'use strict';
/**
 * Call a Technician — API (Express + MongoDB + JWT)
 * Mods:
 *  - 24/7 mode (ALWAYS_OPEN) → only time-off blocks scheduling
 *  - Optional same-day enforcement (ENFORCE_SAME_DAY)
 *  - New GET /api/timeoff aggregate endpoint for the calendar background
 */

require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const dns       = require('node:dns');

// Email notification service
const { sendEmail, isEmailAddressValid } = require('./services/email');
const templates = require('./services/emailTemplates');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MARKETING_ORIGIN = process.env.MARKETING_ORIGIN || 'http://localhost:5174';

/* ------------------------ FLAGS ----------------------------- */
// 24/7 service by default: working-hours are NOT enforced; time-off still blocks
const ALWAYS_OPEN = (process.env.ALWAYS_OPEN ?? 'true') === 'true';
// If you want to forbid cross-midnight jobs, set ENFORCE_SAME_DAY=true
const ENFORCE_SAME_DAY = (process.env.ENFORCE_SAME_DAY ?? 'false') === 'true';

/* ------------------------ ANTI-SPAM RATE LIMITING ------------------- */
// Simple in-memory rate limiter for job request submissions
// Limits: 5 per hour per IP, 10 per day per email
// NOTE: For production scale, replace with Redis
const RATE_LIMIT_ENABLED = (process.env.RATE_LIMIT_ENABLED ?? 'true') === 'true';
const rateLimitStore = new Map(); // key -> { count, resetTime }

function checkRateLimit(key, windowMs, maxRequests) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
      message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 60000)} minutes.`
    };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up old entries every hour (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 3600000);

/* ------------------------ reCAPTCHA v3 VERIFICATION ------------------- */
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

/**
 * Verify reCAPTCHA v3 token with Google
 * @param {string} token - The token from frontend
 * @param {string} action - Expected action name
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
async function verifyRecaptcha(token, action) {
  if (!RECAPTCHA_SECRET) {
    console.warn('[RECAPTCHA] Secret key not configured, skipping verification');
    return { success: true, score: 1.0 }; // Allow if not configured
  }

  if (!token) {
    return { success: false, error: 'Missing reCAPTCHA token' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET,
        response: token,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('[RECAPTCHA] Verification failed:', data['error-codes']);
      return { success: false, error: 'Invalid reCAPTCHA token' };
    }

    if (data.score < RECAPTCHA_MIN_SCORE) {
      return { success: false, score: data.score, error: `Low score: ${data.score}` };
    }

    return { success: true, score: data.score };
  } catch (err) {
    console.error('[RECAPTCHA] Verification error:', err.message);
    return { success: false, error: 'Verification failed' };
  }
}

/* ------------------------ DNS (Atlas SRV) ------------------- */
// On some Windows/VPN/AV setups, Node's SRV lookup can fail with ECONNREFUSED while Compass works.
// Allow overriding resolvers to make mongodb+srv:// connections reliable.
const DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
if (DNS_SERVERS.length) {
  try {
    dns.setServers(DNS_SERVERS);
    console.log('[mongo] Using custom DNS servers:', DNS_SERVERS.join(', '));
  } catch (e) {
    console.warn('[mongo] Failed to set custom DNS servers:', e?.message || e);
  }
}

/* ------------------------ MIDDLEWARE ------------------------ */
app.use(cors({
  origin: [CLIENT_ORIGIN, MARKETING_ORIGIN],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for large base64 images

/* ------------------------ HELPERS --------------------------- */
function sendErr(res, code, message) {
  return res.status(code).json({ error: message });
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return sendErr(res, 401, 'No token');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, email, name, role, techId }
    next();
  } catch {
    return sendErr(res, 401, 'Invalid token');
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return sendErr(res, 403, 'Admins only');
  return next();
}

function parseDateOnlyUTC(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be YYYY-MM-DD`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  // Catch invalid dates like 2026-02-30
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new Error(`${fieldName} is not a valid date`);
  }

  return dt;
}

function buildUtcDateRange(from, to) {
  const start = parseDateOnlyUTC(from, 'from');
  const toStart = parseDateOnlyUTC(to, 'to');
  const endExclusive = new Date(toStart.getTime() + 24 * 60 * 60 * 1000);

  if (start >= endExclusive) {
    throw new Error('from must be before or equal to to');
  }

  return { from, to, start, endExclusive };
}

const WORKFLOW_STATUSES = ['Assigned', 'Accepted', 'En Route', 'On Site', 'In Progress'];
const ASSIGNMENT_FALLBACK_STATUSES = ['Assigned', 'Accepted', 'En Route', 'On Site', 'In Progress', 'Completed', 'Closed'];
const OPEN_WORKLOAD_EXCLUDED_STATUSES = ['Completed', 'Closed'];

function round2(value) {
  return Math.round(value * 100) / 100;
}

/* ------------------------ MODELS ---------------------------- */
const Job = require('./models/Job'); // must have fields: owner, title, invoice, technician, startAt, endAt, etc.

function getActorName(user) {
  if (user?.name && String(user.name).trim()) return String(user.name).trim();
  if (user?.email && String(user.email).trim()) return String(user.email).trim();
  if (user?.role === 'technician') return 'Technician';
  if (user?.role === 'admin') return 'Admin';
  return 'System';
}

function makeJobEvent(req, type, details = {}) {
  return {
    type,
    timestamp: new Date(),
    actorName: getActorName(req?.user),
    actorRole: req?.user?.role || 'system',
    actorId: req?.user?.sub ? String(req.user.sub) : '',
    details,
  };
}

async function appendJobEvents(jobId, events) {
  if (!jobId || !Array.isArray(events) || events.length === 0) return;
  try {
    await Job.updateOne(
      { _id: jobId },
      { $push: { events: { $each: events } } }
    );
  } catch (e) {
    console.error('[EVENTS] Failed to append job events:', e.message);
  }
}

function makeNotePreview(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 140);
}

function toOptionalNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return Boolean(value);
}

// User
const UserSchema = new mongoose.Schema({
  name:         { type: String, default: 'Admin' },
  email:        { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'technician'], default: 'admin' },
  techId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tech', default: null },
  // For technician users: links to their Tech record
  // For admin users: null
}, { timestamps: true });
UserSchema.index({ email: 1 }, { unique: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Job notes
const JobNoteSchema = new mongoose.Schema({
  job:    { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true, required: true },
  text:   { type: String, required: true },
  author: { type: String, default: '' },
  owner:  { type: String, index: true, required: true },
}, { timestamps: true });
const JobNote = mongoose.models.JobNote || mongoose.model('JobNote', JobNoteSchema);

// Invoices
const InvoiceSchema = new mongoose.Schema({
  number:    { type: String, required: true, trim: true }, // e.g. INV-1101
  customer:  { type: String, default: '' },
  amount:    { type: Number, default: 0 },
  status:    { type: String, enum: ['Unpaid','Pending','Paid','Overdue','Void'], default: 'Pending' },
  date:      { type: Date, default: Date.now },
  notes:     { type: String, default: '' },                 // UI "Description" maps here
  // Enhanced customer details
  customerId: { type: String },
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  // Job details
  jobTitle: { type: String },
  jobDescription: { type: String },
  // Pricing breakdown
  fixedPrice: { type: Number, default: 165 },
  additionalMins: { type: Number, default: 0 },
  software: [{
    name: String,
    value: Number
  }],
  pensionYearDiscount: { type: Boolean, default: false },
  socialMediaDiscount: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: true });
InvoiceSchema.index({ createdBy: 1, number: 1 }, { unique: true });
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

// Technicians (with roster fields)
const SlotSchema = new mongoose.Schema(
  { start: { type: String, required: true }, end: { type: String, required: true } }, // "HH:mm"
  { _id: false }
);
const WorkingHoursSchema = new mongoose.Schema(
  {
    mon: { type: [SlotSchema], default: [{ start: '09:00', end: '17:00' }] },
    tue: { type: [SlotSchema], default: [{ start: '09:00', end: '17:00' }] },
    wed: { type: [SlotSchema], default: [{ start: '09:00', end: '17:00' }] },
    thu: { type: [SlotSchema], default: [{ start: '09:00', end: '17:00' }] },
    fri: { type: [SlotSchema], default: [{ start: '09:00', end: '17:00' }] },
    sat: { type: [SlotSchema], default: [] },
    sun: { type: [SlotSchema], default: [] },
  },
  { _id: false }
);
const TimeOffSchema = new mongoose.Schema(
  { start: { type: Date, required: true }, end: { type: Date, required: true }, reason: String },
  { _id: true }
);

const TechSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, index: true },
  technicianCode: { type: String, unique: true, sparse: true }, // TECH-001, TECH-002, etc.
  email:    { type: String, trim: true, default: '' },
  phone:    { type: String, trim: true, default: '' },
  skills:   { type: [String], default: [] },
  active:   { type: Boolean, default: true },
  notes:    { type: String, default: '' },
  address:  { type: String, default: '' },
  // Legacy field - kept for backwards compatibility
  emergencyContact: { type: String, default: '' },
  // New structured emergency contact fields
  emergencyContactName: { type: String, trim: true, default: '' },
  emergencyContactPhone: { type: String, trim: true, default: '' },
  emergencyContactEmail: { type: String, trim: true, default: '' },
  workingHours: { type: WorkingHoursSchema, default: () => ({}) },
  timeOff:      { type: [TimeOffSchema], default: [] },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: true });
const Tech = mongoose.models.Tech || mongoose.model('Tech', TechSchema);

// Incoming Job Requests from Marketing Site
const IncomingJobRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  description: { type: String, required: true, trim: true },
  images: { type: [String], default: [] }, // Array of base64 encoded images
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Completed', 'Cancelled', 'Converted'],
    default: 'New'
  },
  assignedTo: { type: String, default: '' }, // Technician name
  notes: { type: String, default: '' },
  // Conversion tracking fields
  convertedToJobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    default: null,
    index: true 
  },
  convertedAt: { 
    type: Date, 
    default: null 
  },
  convertedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

IncomingJobRequestSchema.index({ createdAt: -1 });
IncomingJobRequestSchema.index({ status: 1 });
const IncomingJobRequest = mongoose.models.IncomingJobRequest || mongoose.model('IncomingJobRequest', IncomingJobRequestSchema);

// Customer Schema for CRM
const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

CustomerSchema.index({ customerId: 1 });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ phone: 1 });
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// Indexes are now defined in models/Job.js - no need to create them here

/* ---------------- SCHEDULING HELPERS (CONFLICTS) ------------ */
const dayMap = ['sun','mon','tue','wed','thu','fri','sat'];

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
function minutesOfDay(d) { return d.getHours()*60 + d.getMinutes(); }
function timeToMinutes(hhmm) { const [h,m] = String(hhmm).split(':').map(Number); return (h*60)+(m||0); }
function sameYMD(a,b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

// In 24/7 mode, this always returns true. If you flip ALWAYS_OPEN=false, we enforce roster.
function withinWorkingHours(tech, start, end) {
  if (ALWAYS_OPEN) return true;
  const dayKey = dayMap[start.getDay()];
  const slots = (tech.workingHours?.[dayKey] || []);
  if (!slots.length) return false;
  const s = minutesOfDay(start), e = minutesOfDay(end);
  return slots.some(slot => {
    const ss = timeToMinutes(slot.start);
    const ee = timeToMinutes(slot.end);
    return ss <= s && e <= ee;
  });
}
function hasTimeOff(tech, start, end) {
  return (tech.timeOff || []).some(off => rangesOverlap(start, end, new Date(off.start), new Date(off.end)));
}
async function hasJobConflict(ownerId, technicianName, start, end, ignoreId) {
  const q = {
    owner: ownerId,
    technician: technicianName,
    startAt: { $lt: end },
    endAt:   { $gt: start },
  };
  if (ignoreId) q._id = { $ne: ignoreId };
  const clash = await Job.findOne(q).lean();
  return !!clash;
}

// Throws if not schedulable
async function assertSchedulable({ ownerId, technicianName, start, end, ignoreId }) {
  if (!technicianName) return; // allow unscheduled jobs
  const tech = await Tech.findOne({ createdBy: ownerId, name: technicianName, active: { $ne: false } }).lean();
  if (!tech) throw new Error('Technician not found');

  if (ENFORCE_SAME_DAY && !sameYMD(start, end)) throw new Error('Jobs must start and end on the same day');
  if (!withinWorkingHours(tech, start, end)) throw new Error('Outside working hours');
  if (hasTimeOff(tech, start, end)) throw new Error('Technician is on time-off');
  if (await hasJobConflict(ownerId, technicianName, start, end, ignoreId)) {
    throw new Error('Time overlaps another job for this technician');
  }
}

/* ------------------------ ROUTES ---------------------------- */
// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

/* ---------- Reports (Admin) ---------- */

// Dashboard KPI summary
app.get('/api/reports/dashboard-summary', auth, requireAdmin, async (req, res) => {
  try {
    const owner = req.user.sub;

    const now = new Date();
    const last30dStart = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const [
      jobStatusRows,
      incoming30d,
      converted30d,
      techDocs,
    ] = await Promise.all([
      Job.aggregate([
        { $match: { owner } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      IncomingJobRequest.countDocuments({
        createdAt: { $gte: last30dStart, $lt: now }
      }),
      IncomingJobRequest.countDocuments({
        convertedAt: { $gte: last30dStart, $lt: now },
        convertedToJobId: { $ne: null },
        convertedBy: owner
      }),
      Tech.find({ createdBy: owner }).select('_id active').lean(),
    ]);

    let total = 0;
    let open = 0;
    let inWorkflow = 0;
    let completed = 0;
    let closed = 0;
    let other = 0;

    for (const row of jobStatusRows) {
      const status = String(row?._id || '');
      const count = Number(row?.count || 0);
      total += count;

      if (status === 'Open') open += count;
      else if (WORKFLOW_STATUSES.includes(status)) inWorkflow += count;
      else if (status === 'Completed') completed += count;
      else if (status === 'Closed') closed += count;
      else other += count;
    }

    const activeTechCount = techDocs.filter(t => t.active !== false).length;
    const techIds = techDocs.map(t => t._id).filter(Boolean);
    const linkedTechIds = techIds.length
      ? await User.distinct('techId', { techId: { $in: techIds } })
      : [];

    const conversionRate = incoming30d > 0
      ? round2((converted30d / incoming30d) * 100)
      : 0;

    return res.json({
      jobs: {
        total,
        open,
        inWorkflow,
        completed,
        closed
      },
      requests30d: {
        incoming: incoming30d,
        converted: converted30d,
        conversionRate
      },
      technicians: {
        active: activeTechCount,
        withLoginAccounts: linkedTechIds.filter(Boolean).length
      }
    });
  } catch (e) {
    return sendErr(res, 500, e.message || 'Failed to generate dashboard summary');
  }
});

// Core date-range summary metrics
app.get('/api/reports/date-range-summary', auth, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const owner = req.user.sub;

    let range;
    try {
      range = buildUtcDateRange(from, to);
    } catch (e) {
      return sendErr(res, 400, e.message);
    }

    const inRange = { $gte: range.start, $lt: range.endExclusive };

    const [
      jobsCreated,
      incomingRequests,
      convertedRequests,
      completedPrimaryIds,
      completedFallbackIds,
      closedPrimaryIds,
      closedFallbackIds,
      followUpFlagged,
    ] = await Promise.all([
      Job.countDocuments({ owner, createdAt: inRange }),
      IncomingJobRequest.countDocuments({ createdAt: inRange }),
      IncomingJobRequest.countDocuments({
        convertedAt: inRange,
        convertedToJobId: { $ne: null },
        convertedBy: owner
      }),
      Job.distinct('_id', { owner, completedAt: inRange }),
      Job.distinct('_id', {
        owner,
        events: {
          $elemMatch: {
            type: 'status_changed',
            'details.toStatus': 'Completed',
            timestamp: inRange
          }
        }
      }),
      Job.distinct('_id', { owner, closedAt: inRange }),
      Job.distinct('_id', {
        owner,
        events: {
          $elemMatch: {
            timestamp: inRange,
            $or: [
              { type: 'job_closed' },
              { type: 'status_changed', 'details.toStatus': 'Closed' }
            ]
          }
        }
      }),
      Job.countDocuments({
        owner,
        'completionForm.submittedAt': inRange,
        'completionForm.followUpRequired': true
      })
    ]);

    const jobsCompleted = new Set([
      ...completedPrimaryIds.map(String),
      ...completedFallbackIds.map(String)
    ]).size;

    const jobsClosed = new Set([
      ...closedPrimaryIds.map(String),
      ...closedFallbackIds.map(String)
    ]).size;

    return res.json({
      range: {
        from: range.from,
        to: range.to
      },
      summary: {
        jobsCreated,
        incomingRequests,
        convertedRequests,
        jobsCompleted,
        jobsClosed,
        followUpFlagged
      }
    });
  } catch (e) {
    return sendErr(res, 500, e.message || 'Failed to generate date-range summary');
  }
});

// Date-range technician performance rows
app.get('/api/reports/date-range-technicians', auth, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const owner = req.user.sub;

    let range;
    try {
      range = buildUtcDateRange(from, to);
    } catch (e) {
      return sendErr(res, 400, e.message);
    }

    const inRange = { $gte: range.start, $lt: range.endExclusive };

    const techDocs = await Tech.find({ createdBy: owner })
      .select('_id name active')
      .sort({ name: 1 })
      .lean();

    const techIds = techDocs.map(t => t._id).filter(Boolean);

    if (techIds.length === 0) {
      return res.json({
        range: { from: range.from, to: range.to },
        rows: []
      });
    }

    const [
      assignedPrimary,
      assignedFallback,
      completionPrimary,
      completionFallback,
      followUpPrimary,
      followUpFallback,
      openWorkload,
      linkedTechIds,
    ] = await Promise.all([
      Job.aggregate([
        {
          $match: {
            owner,
            assignedTo: { $in: techIds },
            assignedAt: inRange
          }
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            assignedTo: { $in: techIds, $ne: null },
            assignedAt: null,
            createdAt: inRange,
            status: { $in: ASSIGNMENT_FALLBACK_STATUSES }
          }
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            'completionForm.submittedAt': inRange,
            'completionForm.submittedBy': { $in: techIds }
          }
        },
        { $group: { _id: '$completionForm.submittedBy', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            'completionForm.submittedAt': inRange,
            'completionForm.submittedBy': null,
            assignedTo: { $in: techIds, $ne: null }
          }
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            'completionForm.submittedAt': inRange,
            'completionForm.followUpRequired': true,
            'completionForm.submittedBy': { $in: techIds }
          }
        },
        { $group: { _id: '$completionForm.submittedBy', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            'completionForm.submittedAt': inRange,
            'completionForm.followUpRequired': true,
            'completionForm.submittedBy': null,
            assignedTo: { $in: techIds, $ne: null }
          }
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        {
          $match: {
            owner,
            assignedTo: { $in: techIds, $ne: null },
            status: { $nin: OPEN_WORKLOAD_EXCLUDED_STATUSES }
          }
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
      ]),
      User.distinct('techId', { techId: { $in: techIds } }),
    ]);

    const assignMap = new Map();
    const completionMap = new Map();
    const followUpMap = new Map();
    const openWorkloadMap = new Map();

    for (const row of assignedPrimary) {
      assignMap.set(String(row._id), Number(row.count || 0));
    }
    for (const row of assignedFallback) {
      const key = String(row._id);
      assignMap.set(key, (assignMap.get(key) || 0) + Number(row.count || 0));
    }

    for (const row of completionPrimary) {
      completionMap.set(String(row._id), Number(row.count || 0));
    }
    for (const row of completionFallback) {
      const key = String(row._id);
      completionMap.set(key, (completionMap.get(key) || 0) + Number(row.count || 0));
    }

    for (const row of followUpPrimary) {
      followUpMap.set(String(row._id), Number(row.count || 0));
    }
    for (const row of followUpFallback) {
      const key = String(row._id);
      followUpMap.set(key, (followUpMap.get(key) || 0) + Number(row.count || 0));
    }

    for (const row of openWorkload) {
      openWorkloadMap.set(String(row._id), Number(row.count || 0));
    }

    const linkedSet = new Set(linkedTechIds.map(String));

    const rows = techDocs.map((tech) => {
      const techId = String(tech._id);
      return {
        techId,
        name: tech.name || 'Unknown',
        jobsAssigned: assignMap.get(techId) || 0,
        completionSubmissions: completionMap.get(techId) || 0,
        followUpFlagged: followUpMap.get(techId) || 0,
        openWorkload: openWorkloadMap.get(techId) || 0,
        hasLoginAccount: linkedSet.has(techId)
      };
    });

    return res.json({
      range: {
        from: range.from,
        to: range.to
      },
      rows
    });
  } catch (e) {
    return sendErr(res, 500, e.message || 'Failed to generate technician date-range report');
  }
});

/* ---------- Marketing Site Routes ---------- */
// Submit job request from marketing site (no auth required)
app.post('/api/marketing/job-request', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const hasEmail = normalizedEmail.length > 0;

    console.log('Received job request:', {
      hasFullName: Boolean(req.body.fullName),
      hasPhone: Boolean(req.body.phone),
      hasEmail: Boolean(req.body.email),
      descriptionLength: String(req.body.description || '').length,
      imagesCount: req.body.images ? req.body.images.length : 0,
      ip: clientIp
    });

    // Anti-spam: Rate limit by IP (5 per hour)
    if (RATE_LIMIT_ENABLED) {
      const ipLimit = checkRateLimit(`ip:${clientIp}`, 3600000, 5);
      if (!ipLimit.allowed) {
        console.warn(`[RATE LIMIT] IP blocked: ${clientIp}`);
        return res.status(429).json({
          error: 'Too many requests.',
          message: ipLimit.message,
          retryAfter: ipLimit.retryAfter
        });
      }

      // Anti-spam: Rate limit by email (10 per day) if email provided
      if (hasEmail) {
        if (!isEmailAddressValid(normalizedEmail)) {
          return res.status(400).json({
            error: 'Please enter a valid email address or leave the email field blank.'
          });
        }

        const emailLimit = checkRateLimit(`email:${normalizedEmail}`, 86400000, 10);
        if (!emailLimit.allowed) {
          console.warn('[RATE LIMIT] Email blocked');
          return res.status(429).json({
            error: 'Too many requests from this email.',
            message: emailLimit.message,
            retryAfter: emailLimit.retryAfter
          });
        }
      }
    }

    // Anti-spam: reCAPTCHA v3 verification
    const { recaptchaToken } = req.body;
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'submit_job_request');
    if (!recaptchaResult.success) {
      console.warn(`[RECAPTCHA] Blocked: ${recaptchaResult.error}`, { ip: clientIp, score: recaptchaResult.score });
      return res.status(403).json({
        error: 'Security verification failed.',
        message: 'Please try again or contact us directly.'
      });
    }
    console.log(`[RECAPTCHA] Verified: score=${recaptchaResult.score}`, { ip: clientIp });

    const { fullName, phone, description, images } = req.body;

    if (!fullName || !phone || !normalizedEmail || !description) {
      console.log('Validation failed:', {
        hasFullName: Boolean(fullName),
        hasPhone: Boolean(phone),
        hasEmail: Boolean(normalizedEmail),
        descriptionLength: String(description || '').length
      });
      return res.status(400).json({
        error: 'Full name, phone, email, and description are required'
      });
    }

    // Validate email format (now required)
    if (!isEmailAddressValid(normalizedEmail)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }


    const jobRequest = await IncomingJobRequest.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: normalizedEmail,
      description: description.trim(),
      images: images || [],
      status: 'New'
    });

    console.log('Job request created successfully:', jobRequest._id);

    // Send customer confirmation email (best-effort, non-blocking)
    if (hasEmail) {
      const template = templates.customerRequestConfirmation({
        fullName: fullName.trim(),
        description: description.trim(),
        requestId: jobRequest._id
      });
      sendEmail(normalizedEmail, template.subject, template.text, template.html)
        .then(result => {
          if (!result.sent) {
            console.log('[EMAIL] Customer confirmation not sent:', result.reason || result.error);
          }
        })
        .catch(error => {
          console.error('[EMAIL] Customer confirmation send error:', error.message);
        });
    }

    // Send admin notification email (best-effort, non-blocking)
    const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminNotificationEmail && adminNotificationEmail.trim()) {
      try {
        const template = templates.adminNewRequestNotification({
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: normalizedEmail || 'Not provided',
          description: description.trim(),
          requestId: jobRequest._id
        });
        sendEmail(adminNotificationEmail.trim(), template.subject, template.text, template.html)
          .then(result => {
            if (!result.sent) {
              console.log('[EMAIL] Admin notification not sent:', result.reason || result.error);
            } else {
              console.log('[EMAIL] Admin notification sent successfully');
            }
          });
      } catch (error) {
        console.error('[EMAIL] Failed to send admin notification:', error.message);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Job request submitted successfully',
      id: jobRequest._id
    });
  } catch (e) {
    console.error('Error creating job request:', e);
    console.error('Error details:', {
      message: e.message,
      name: e.name,
      stack: e.stack
    });
    res.status(500).json({ 
      error: 'Failed to submit job request',
      details: e.message 
    });
  }
});

/* ---------- Auth ---------- */
// Registration disabled - only existing internal users can access the portal
// Internal users must be created via direct database insertion or admin CLI
app.post('/api/auth/register', async (req, res) => {
  return sendErr(res, 403, 'Registration is disabled. Contact your administrator for access.');
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    const user = await User.findOne({ email });
    if (!user) return sendErr(res, 400, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendErr(res, 400, 'Invalid credentials');

    const token = jwt.sign({ 
      sub: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      techId: user.techId
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        techId: user.techId
      } 
    });
  } catch (e) { return sendErr(res, 400, e.message || 'Login failed'); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('email name role techId').lean();
    if (!user) return sendErr(res, 404, 'User not found');
    return res.json({ user });
  } catch (e) { return sendErr(res, 500, e.message || 'Failed to fetch user'); }
});

/* ---------- Jobs ---------- */
// list (+ calendar filters)
app.get('/api/jobs', auth, async (req, res) => {
  try {
    const {
      q = '', status, priority, invoice, technician,
      scheduled, from, to
    } = req.query;

    const query = { owner: req.user.sub };

    if (q) {
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { invoice:     { $regex: q, $options: 'i' } },
        { technician:  { $regex: q, $options: 'i' } },
        { phone:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (status && status !== 'All')     query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (invoice)                        query.invoice = invoice;
    if (technician && technician !== 'All') query.technician = technician;

    if (scheduled === 'true') {
      query.startAt = { $ne: null };
      const and = [];
      if (from) and.push({ endAt:   { $gte: new Date(from) } });
      if (to)   and.push({ startAt: { $lt:  new Date(to)   } });
      if (and.length) query.$and = and;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
    return res.json(jobs);
  } catch (e) { return sendErr(res, 500, e.message || 'Failed to load jobs'); }
});

// create (+ start/end) with conflict checks
app.post('/api/jobs', auth, async (req, res) => {
  try {
    let { 
      title, invoice, priority, status, technician, phone, description,
      startAt, endAt, sourceRequestId, customerEmail,
      durationMins, additionalMins, amount, customerName, customerId,
      customerAddress, software, pensionYearDiscount, socialMediaDiscount,
      troubleshooting
    } = req.body;
    if (!title || !invoice) return sendErr(res, 400, 'Title and Invoice are required');

    // Handle sourceRequestId if provided
    let sourceRequest = null;
    if (sourceRequestId) {
      // Verify the request exists and hasn't been converted
      sourceRequest = await IncomingJobRequest.findById(sourceRequestId);
      if (!sourceRequest) {
        return sendErr(res, 400, 'Source request not found');
      }
      if (sourceRequest.convertedToJobId) {
        return sendErr(res, 400, 'Request already converted to a job');
      }
      // Use email from source request if available
      customerEmail = sourceRequest.email || customerEmail;
    }

    startAt = startAt ? new Date(startAt) : null;
    endAt   = endAt   ? new Date(endAt)   : null;
    if (startAt && endAt && endAt < startAt) return sendErr(res, 400, 'endAt must be after startAt');

    // Normalize and validate customerEmail if provided
    if (customerEmail) {
      customerEmail = String(customerEmail).trim().toLowerCase();
      if (!isEmailAddressValid(customerEmail)) {
        return sendErr(res, 400, 'Invalid customer email address');
      }
    }

    // Conflict prevention (only if scheduled and technician set)
    if (technician && startAt && endAt) {
      await assertSchedulable({
        ownerId: req.user.sub,
        technicianName: technician,
        start: startAt,
        end: endAt
      });
    }

    // Handle assignment: lookup Tech by name and set assignedTo
    let assignedTo = null;
    if (technician && technician.trim()) {
      const tech = await Tech.findOne({ name: technician.trim(), createdBy: req.user.sub });
      if (!tech) {
        return sendErr(res, 400, `Technician "${technician}" not found. Please create the technician record first or check the name.`);
      }
      assignedTo = tech._id;
    }

    const initialEvents = [
      makeJobEvent(req, 'job_created', {
        title: title.trim(),
        status: status || 'Open'
      })
    ];

    if (assignedTo && technician && technician.trim()) {
      initialEvents.push(
        makeJobEvent(req, 'technician_assigned', {
          techName: technician.trim()
        })
      );
    }

    const job = await Job.create({
      title, invoice, priority, status, technician: technician ? technician.trim() : '', phone, description,
      startAt, endAt,
      owner: req.user.sub,
      assignedTo,  // proper technician reference (null if no technician)
      customerEmail: customerEmail || undefined,
      durationMins: toOptionalNumber(durationMins),
      additionalMins: toOptionalNumber(additionalMins),
      amount: toOptionalNumber(amount),
      customerName: customerName ? String(customerName).trim() : undefined,
      customerId: customerId ? String(customerId).trim() : undefined,
      customerAddress: customerAddress ? String(customerAddress).trim() : undefined,
      software: Array.isArray(software) ? software.map((item) => ({
        name: String(item?.name || '').trim(),
        value: toOptionalNumber(item?.value) ?? 0,
      })).filter((item) => item.name) : undefined,
      pensionYearDiscount: toOptionalBoolean(pensionYearDiscount),
      socialMediaDiscount: toOptionalBoolean(socialMediaDiscount),
      troubleshooting: troubleshooting ? String(troubleshooting).trim() : undefined,
      ...(status === 'Assigned' && assignedTo && { assignedAt: new Date() }),  // Set timestamp if assigned
      events: initialEvents,
      ...(sourceRequestId && { sourceRequestId })
    });

    // If this job was created from a request, update the request
    if (sourceRequest) {
      await IncomingJobRequest.findByIdAndUpdate(sourceRequestId, {
        convertedToJobId: job._id,
        convertedAt: new Date(),
        convertedBy: req.user.sub,
        status: 'Converted',
        updatedAt: new Date()
      });
    }

    // Send assignment emails if technician was assigned during job creation
    if (assignedTo && technician && technician.trim()) {
      // Technician notification
      try {
        const techUser = await User.findOne({ techId: assignedTo });
        if (techUser?.email) {
          const template = templates.technicianAssigned({
            techName: technician.trim(),
            jobTitle: job.title,
            jobDescription: job.description || 'No description provided',
            customerName: job.customerName || 'Unknown',
            customerPhone: job.phone || 'N/A',
            customerAddress: job.customerAddress || 'N/A',
            jobId: job._id
          });
          sendEmail(techUser.email, template.subject, template.text, template.html)
            .then(result => {
              if (!result.sent) {
                console.log('[EMAIL] Tech assignment not sent during job creation:', result.reason || result.error);
              } else {
                console.log('[EMAIL] Tech assignment email sent successfully');
              }
            });
        } else {
          console.log('[EMAIL] Tech assigned but no linked user email found during job creation');
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send tech assignment notification during job creation:', emailErr.message);
      }

      // Customer notification (if customer email exists)
      if (customerEmail) {
        try {
          let scheduledWindow = 'To be confirmed';
          if (job.startAt) {
            const start = new Date(job.startAt);
            if (!Number.isNaN(start.getTime())) {
              if (job.endAt) {
                const end = new Date(job.endAt);
                if (!Number.isNaN(end.getTime())) {
                  scheduledWindow = `${start.toLocaleString()} to ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                } else {
                  scheduledWindow = start.toLocaleString();
                }
              } else {
                scheduledWindow = start.toLocaleString();
              }
            }
          }
          const template = templates.customerTechnicianAssigned({
            customerName: job.customerName || 'Valued Customer',
            techName: technician.trim(),
            jobTitle: job.title,
            scheduledWindow
          });
          sendEmail(customerEmail, template.subject, template.text, template.html)
            .then(result => {
              if (!result.sent) {
                console.log('[EMAIL] Customer assignment not sent during job creation:', result.reason || result.error);
              } else {
                console.log('[EMAIL] Customer assignment email sent successfully');
              }
            });
        } catch (emailErr) {
          console.error('[EMAIL] Failed to send customer assignment notification during job creation:', emailErr.message);
        }
      }
    }

    return res.json(job);
  } catch (e) { return sendErr(res, 409, e.message || 'Create failed'); }
});

// update (with conflict checks)
app.put('/api/jobs/:id', auth, async (req, res) => {
  try {
    const update = { ...req.body };
    if ('startAt' in update) update.startAt = update.startAt ? new Date(update.startAt) : null;
    if ('endAt'   in update) update.endAt   = update.endAt   ? new Date(update.endAt)   : null;
    if (update.startAt && update.endAt && update.endAt < update.startAt) {
      return sendErr(res, 400, 'endAt must be after startAt');
    }

    // Conflict prevention if we have the 3 fields
    const techName = update.technician;
    if ((techName || techName === '') && update.startAt && update.endAt) {
      await assertSchedulable({
        ownerId: req.user.sub,
        technicianName: techName,
        start: update.startAt,
        end: update.endAt,
        ignoreId: req.params.id
      });
    }

    // Fetch the existing job first (needed for comparison and validation)
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.sub });
    if (!job) return sendErr(res, 404, 'Job not found');

    // Handle assignment update: if technician changed, lookup Tech and update assignedTo
    if ('technician' in update) {
      if (update.technician && update.technician.trim()) {
        const tech = await Tech.findOne({ name: update.technician.trim(), createdBy: req.user.sub });
        if (!tech) {
          return sendErr(res, 400, `Technician "${update.technician}" not found. Please create the technician record first or check the name.`);
        }
        update.assignedTo = tech._id;
        update.technician = update.technician.trim();
        // If status is being set to 'Assigned', also set assignedAt
        if (update.status === 'Assigned' || (!update.status && job.status === 'Assigned')) {
          update.assignedAt = new Date();
        }
      } else {
        // No technician selected - clear assignment
        update.assignedTo = null;
        update.technician = '';
      }
    }

    // Check if technician is being changed (for notification)
    const oldTechName = job.technician || '';
    const newTechName = update.technician !== undefined ? update.technician : oldTechName;
    const techChanged = 'technician' in update && newTechName !== oldTechName && newTechName.trim() !== '';

    const eventsToAppend = [];
    if ('status' in update && update.status && update.status !== job.status) {
      eventsToAppend.push(
        makeJobEvent(req, 'status_changed', {
          fromStatus: job.status,
          toStatus: update.status
        })
      );
      if (update.status === 'Closed') {
        eventsToAppend.push(
          makeJobEvent(req, 'job_closed', {
            fromStatus: job.status
          })
        );
      }
    }

    if (techChanged) {
      eventsToAppend.push(
        makeJobEvent(req, 'technician_assigned', {
          techName: newTechName
        })
      );
    }

    let updated = await Job.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.sub },
      update,
      { new: true }
    ).lean();
    if (!updated) return sendErr(res, 404, 'Not found');

    if (eventsToAppend.length > 0) {
      await appendJobEvents(updated._id, eventsToAppend);
      updated = await Job.findById(updated._id).lean() || updated;
    }

    // Send assignment emails (best-effort, non-blocking)
    if (techChanged && updated.assignedTo) {
      // Technician notification
      try {
        const techUser = await User.findOne({ techId: updated.assignedTo });
        if (techUser?.email) {
          const template = templates.technicianAssigned({
            techName: newTechName,
            jobTitle: updated.title,
            jobDescription: updated.description || 'No description provided',
            customerName: updated.customerName || 'Unknown',
            customerPhone: updated.phone || 'N/A',
            customerAddress: updated.customerAddress || 'N/A',
            jobId: updated._id
          });
          sendEmail(techUser.email, template.subject, template.text, template.html)
            .then(result => {
              if (!result.sent) {
                console.log('[EMAIL] Tech assignment not sent:', result.reason || result.error);
              }
            });
        } else {
          console.log('[EMAIL] Tech assigned but no linked user email found for tech:', updated.assignedTo);
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send tech assignment notification:', emailErr.message);
      }

      // Customer notification
      try {
        const customerEmail = (updated.customerEmail || '').trim();
        if (customerEmail && customerEmail.includes('@')) {
          let scheduledWindow = 'To be confirmed';
          if (updated.startAt) {
            const start = new Date(updated.startAt);
            if (!Number.isNaN(start.getTime())) {
              if (updated.endAt) {
                const end = new Date(updated.endAt);
                if (!Number.isNaN(end.getTime())) {
                  scheduledWindow = `${start.toLocaleString()} to ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                } else {
                  scheduledWindow = start.toLocaleString();
                }
              } else {
                scheduledWindow = start.toLocaleString();
              }
            }
          }

          const template = templates.customerTechnicianAssigned({
            customerName: updated.customerName || 'Customer',
            techName: newTechName,
            jobTitle: updated.title || 'Your service request',
            scheduledWindow
          });

          sendEmail(customerEmail, template.subject, template.text, template.html)
            .then(result => {
              if (!result.sent) {
                console.log('[EMAIL] Customer assignment not sent:', result.reason || result.error);
              }
            });
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send customer assignment notification:', emailErr.message);
      }
    }

    return res.json(updated);
  } catch (e) { return sendErr(res, 409, e.message || 'Update failed'); }
});

// delete
app.delete('/api/jobs/:id', auth, async (req, res) => {
  try {
    const out = await Job.deleteOne({ _id: req.params.id, owner: req.user.sub });
    if (out.deletedCount === 0) return sendErr(res, 404, 'Not found');
    return res.json({ ok: true });
  } catch (e) { return sendErr(res, 400, e.message || 'Delete failed'); }
});

/* ---------- Job Notes ---------- */
app.get('/api/jobs/:id/notes', auth, async (req, res) => {
  try {
    const notes = await JobNote.find({ job: req.params.id, owner: req.user.sub })
      .sort({ createdAt: 1 }).lean();
    res.json(notes);
  } catch (e) { res.status(500).json({ error: e.message || 'Failed to load notes' }); }
});

app.post('/api/jobs/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'Note text is required' });
    const authorName = getActorName(req.user);
    const note = await JobNote.create({
      job: req.params.id,
      text: text.trim(),
      author: authorName,
      owner: req.user.sub
    });

    await appendJobEvents(req.params.id, [
      makeJobEvent(req, 'note_added', {
        notePreview: makeNotePreview(text),
        author: authorName
      })
    ]);

    res.json(note);
  } catch (e) { res.status(400).json({ error: e.message || 'Failed to add note' }); }
});

/* ---------- Technician Workflow Endpoints ---------- */

// GET /api/my-jobs - Get jobs assigned to authenticated technician
// Only accessible by users with role='technician'
// Returns jobs where assignedTo matches the user's techId
app.get('/api/my-jobs', auth, async (req, res) => {
  try {
    // Authorization: technician only
    if (req.user.role !== 'technician') {
      return sendErr(res, 403, 'Only technicians can access this endpoint');
    }
    
    // Must have a linked Tech record
    const userTechId = req.user.techId ? req.user.techId.toString() : null;
    if (!userTechId) {
      return sendErr(res, 400, 'Technician account not linked to Tech record');
    }
    
    const { status } = req.query;
    
    // Query jobs where assignedTo matches the technician's techId
    const query = { 
      assignedTo: req.user.techId,  // MongoDB will match ObjectId to string
      // Don't show closed jobs to technicians
      status: { $ne: 'Closed' }
    };
    
    // Optional status filter
    if (status && status !== 'All') {
      query.status = status;
    }
    
    const jobs = await Job.find(query)
      .sort({ assignedAt: -1, createdAt: -1 })
      .lean();
    
    return res.json(jobs);
  } catch (e) { 
    return sendErr(res, 500, e.message || 'Failed to load my jobs'); 
  }
});

// Status transition validation helper
const VALID_STATUS_TRANSITIONS = {
  // Admin closeout rules:
  // - Only Completed jobs can be Closed
  // - Closed jobs can only be reopened to Completed
  // - Technicians cannot close jobs (handled separately)
  'admin': {
    canTransition: (from, to) => {
      // Closing: only Completed -> Closed allowed
      if (to === 'Closed') {
        return from === 'Completed';
      }
      // Reopening: only Closed -> Completed allowed
      if (from === 'Closed') {
        return to === 'Completed';
      }
      // All other transitions allowed for admin
      return true;
    }
  },
  // Technician transitions (progressive workflow)
  'technician': {
    allowedTransitions: {
      'Assigned': ['Accepted'],
      'Accepted': ['En Route'],
      'En Route': ['On Site'],
      'On Site': ['In Progress'],
      'In Progress': ['Completed']
    },
    canTransition: (from, to) => {
      const allowed = VALID_STATUS_TRANSITIONS.technician.allowedTransitions[from];
      return allowed && allowed.includes(to);
    }
  }
};

// PUT /api/jobs/:id/status - Update job status with validation
// Authorization: Only assigned technician or admin can update status
// Technicians cannot move job to 'Closed' (admin only)
//
// NOTE ON TECH NOTES IN STATUS UPDATE:
// - If a note is provided with status change, it uses same rules as POST /api/jobs/:id/tech-notes
// - Schema requires createdBy (Tech ref), so job must have assignedTo
// - Returns 400 if attempting to add note to unassigned job
//
app.put('/api/jobs/:id/status', auth, async (req, res) => {
  try {
    const { status: newStatus, note } = req.body;
    
    if (!newStatus) {
      return sendErr(res, 400, 'Status is required');
    }
    
    // Find the job
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) {
      return sendErr(res, 404, 'Job not found');
    }
    
    const currentStatus = job.status;
    
    // Authorization checks with safe null handling
    const isAdmin = req.user.role === 'admin';
    const userTechId = req.user.techId ? req.user.techId.toString() : null;
    const jobAssignedTo = job.assignedTo ? job.assignedTo.toString() : null;
    const isAssignedTech = req.user.role === 'technician' && 
                           jobAssignedTo && 
                           jobAssignedTo === userTechId;
    
    // Only assigned technician or admin can update
    if (!isAdmin && !isAssignedTech) {
      return sendErr(res, 403, 'Not authorized to update this job');
    }
    
    // Validate status transition
    if (!isAdmin) {
      // Technician rules - can only progress through workflow
      const allowed = VALID_STATUS_TRANSITIONS.technician.allowedTransitions[currentStatus];
      if (!allowed || !allowed.includes(newStatus)) {
        return sendErr(res, 400, `Invalid status transition: ${currentStatus} -> ${newStatus}. Technician can only: ${allowed ? allowed.join(', ') : 'no further actions'}`);
      }
      
      // Technicians cannot close jobs (only complete them)
      if (newStatus === 'Closed') {
        return sendErr(res, 403, 'Technicians cannot close jobs. Mark as Completed instead.');
      }
    } else {
      // Admin transition validation
      const canTransition = VALID_STATUS_TRANSITIONS.admin.canTransition(currentStatus, newStatus);
      if (!canTransition) {
        if (newStatus === 'Closed') {
          return sendErr(res, 400, 'Only Completed jobs can be Closed');
        }
        if (currentStatus === 'Closed') {
          return sendErr(res, 400, 'Closed jobs can only be reopened to Completed');
        }
        return sendErr(res, 400, `Invalid status transition: ${currentStatus} -> ${newStatus}`);
      }
    }

    // Build update with timestamps
    const update = { status: newStatus };
    
    // Set appropriate timestamp based on status
    switch (newStatus) {
      case 'Assigned':
        update.assignedAt = new Date();
        // When status becomes Assigned, look up Tech by name from job.technician
        if (job.technician) {
          const tech = await Tech.findOne({ name: job.technician, createdBy: req.user.sub });
          if (tech) {
            update.assignedTo = tech._id;
          }
        }
        break;
      case 'Accepted':
        update.acceptedAt = new Date();
        break;
      case 'In Progress':
        update.startedAt = new Date();
        break;
      case 'Completed':
        update.completedAt = new Date();
        // Clear closedAt when reopening from Closed
        if (currentStatus === 'Closed') {
          update.closedAt = null;
        }
        break;
      case 'Closed':
        update.closedAt = new Date();
        break;
    }
    
    // Add note if provided (tech notes)
    if (note && note.trim()) {
      // Cannot add tech note if job has no assigned technician
      // (Schema requires createdBy which is a Tech reference)
      if (!job.assignedTo && !update.assignedTo) {
        return sendErr(res, 400, 'Cannot add tech note: job has no assigned technician. Assign a technician first.');
      }
      
      if (!job.techNotes) job.techNotes = [];
      job.techNotes.push({
        note: note.trim(),
        createdAt: new Date(),
        // Technicians: use their own techId
        // Admins: use job's assigned tech (or the new one being assigned)
        createdBy: isAssignedTech ? req.user.techId : (update.assignedTo || job.assignedTo)
      });
      update.techNotes = job.techNotes;
    }

    // Handle completion form and photos when marking job as Completed
    const { completionForm, photos } = req.body;
    if (newStatus === 'Completed' && currentStatus !== 'Completed') {
      // Validate completion form if provided (optional but validated if present)
      if (completionForm) {
        // Check if completion form already exists (no editing after completion)
        if (job.completionForm && job.completionForm.submittedAt) {
          return sendErr(res, 400, 'Completion form already submitted. Cannot modify.');
        }

        // Validate required fields
        if (!completionForm.workPerformed || completionForm.workPerformed.trim().length < 10) {
          return sendErr(res, 400, 'Work performed is required (minimum 10 characters)');
        }
        if (completionForm.workPerformed.length > 2000) {
          return sendErr(res, 400, 'Work performed is too long (maximum 2000 characters)');
        }

        // Validate follow-up notes if follow-up required
        if (completionForm.followUpRequired) {
          if (!completionForm.followUpNotes || completionForm.followUpNotes.trim().length === 0) {
            return sendErr(res, 400, 'Follow-up notes are required when follow-up is flagged');
          }
          if (completionForm.followUpNotes.length > 1000) {
            return sendErr(res, 400, 'Follow-up notes are too long (maximum 1000 characters)');
          }
        }

        // Save completion form
        update.completionForm = {
          workPerformed: completionForm.workPerformed.trim(),
          partsUsed: (completionForm.partsUsed || '').trim(),
          followUpRequired: !!completionForm.followUpRequired,
          followUpNotes: (completionForm.followUpNotes || '').trim(),
          submittedAt: new Date(),
          submittedBy: isAssignedTech ? req.user.techId : job.assignedTo
        };
      }

      // Handle photos if provided (optional)
      if (photos && Array.isArray(photos) && photos.length > 0) {
        if (photos.length > 3) {
          return sendErr(res, 400, 'Maximum 3 photos allowed');
        }

        // Validate each photo (base64 format and size)
        const validatedPhotos = [];
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          if (!photo || typeof photo !== 'string') {
            return sendErr(res, 400, `Photo ${i + 1} is invalid`);
          }

          // Check base64 size (rough estimate: base64 is ~4/3 of binary size)
          const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
          const estimatedSizeMB = (base64Data.length * 0.75) / (1024 * 1024);
          if (estimatedSizeMB > 5) {
            return sendErr(res, 400, `Photo ${i + 1} is too large (max 5MB)`);
          }

          validatedPhotos.push({
            url: photo,
            caption: '',
            uploadedAt: new Date(),
            uploadedBy: isAssignedTech ? req.user.techId : job.assignedTo
          });
        }

        update.completionPhotos = validatedPhotos;
      }
    }

    const eventsToAppend = [];
    if (currentStatus !== newStatus) {
      eventsToAppend.push(
        makeJobEvent(req, 'status_changed', {
          fromStatus: currentStatus,
          toStatus: newStatus
        })
      );
      if (newStatus === 'Closed') {
        eventsToAppend.push(
          makeJobEvent(req, 'job_closed', {
            fromStatus: currentStatus
          })
        );
      }
    }

    if (note && note.trim()) {
      eventsToAppend.push(
        makeJobEvent(req, 'note_added', {
          notePreview: makeNotePreview(note),
          author: getActorName(req.user)
        })
      );
    }

    if (update.completionForm?.submittedAt) {
      eventsToAppend.push(
        makeJobEvent(req, 'completion_submitted', {
          techName: job.technician || getActorName(req.user)
        })
      );
    }

    if (newStatus === 'Assigned' && job.technician) {
      eventsToAppend.push(
        makeJobEvent(req, 'technician_assigned', {
          techName: job.technician
        })
      );
    }

    let updated = await Job.findOneAndUpdate(
      { _id: req.params.id },
      update,
      { new: true }
    ).lean();

    if (!updated) {
      return sendErr(res, 404, 'Job not found');
    }

    if (eventsToAppend.length > 0) {
      await appendJobEvents(updated._id, eventsToAppend);
      updated = await Job.findById(updated._id).lean() || updated;
    }

    // Send admin notification when job is marked Completed by technician (best-effort, non-blocking)
    if (newStatus === 'Completed' && currentStatus !== 'Completed' && isAssignedTech) {
      try {
        const admin = await User.findOne({ _id: job.owner });
        if (admin?.email) {
          const tech = await Tech.findOne({ _id: req.user.techId });
          const template = templates.jobCompletedAdmin({
            adminName: admin.name || 'Admin',
            jobTitle: updated.title,
            jobId: updated._id,
            techName: tech?.name || 'Technician',
            completedAt: new Date().toLocaleString(),
            customerName: updated.customerName || 'Unknown'
          });
          sendEmail(admin.email, template.subject, template.text, template.html)
            .then(result => {
              if (!result.sent) {
                console.log('[EMAIL] Admin completion not sent:', result.reason || result.error);
              }
            });
        } else {
          console.log('[EMAIL] Job completed but no admin email found for owner:', job.owner);
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send admin completion notification:', emailErr.message);
      }
    }

    return res.json(updated);
  } catch (e) {
    return sendErr(res, 500, e.message || 'Failed to update status');
  }
});

// POST /api/jobs/:id/tech-notes - Add a technician note to a job
// Authorization: Only assigned technician or admin can add notes
// 
// NOTE ON TECH NOTES CONSISTENCY (Phase 1.5):
// - Job.techNotes.createdBy references 'Tech' model and is REQUIRED
// - When a technician adds a note: createdBy = their techId (consistent)
// - When an admin adds a note: we use job.assignedTo (the assigned tech)
//   because the schema requires a Tech reference, not a User ID
// - If job is unassigned (no assignedTo), admin CANNOT add tech notes
//   (returns 400 error)
// 
// This is intentional: techNotes are meant for technician communication.
// Admin can still add regular job notes via POST /api/jobs/:id/notes
//
app.post('/api/jobs/:id/tech-notes', auth, async (req, res) => {
  try {
    const { note, isAdminOnly = false } = req.body || {};
    
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note is required' });
    }
    
    // Find the job
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Authorization checks
    const isAdmin = req.user.role === 'admin';
    const userTechId = req.user.techId ? req.user.techId.toString() : null;
    const jobAssignedTo = job.assignedTo ? job.assignedTo.toString() : null;
    const isAssignedTech = req.user.role === 'technician' && 
                           jobAssignedTo && 
                           jobAssignedTo === userTechId;
    
    // Only assigned technician or admin can add notes
    if (!isAdmin && !isAssignedTech) {
      return res.status(403).json({ error: 'Not authorized to add notes to this job' });
    }
    
    // Schema requires createdBy (Tech ref) - must have assignedTo
    if (!job.assignedTo) {
      return res.status(400).json({ 
        error: 'Cannot add tech note: job has no assigned technician. Assign a technician first.' 
      });
    }
    
    // Initialize techNotes array if not exists
    if (!job.techNotes) {
      job.techNotes = [];
    }
    
    // Add the note
    // Technicians: use their own techId
    // Admins: use the job's assignedTo (the tech they're managing)
    // Schema requires a valid Tech reference, never null
    job.techNotes.push({
      note: note.trim(),
      isAdminOnly: Boolean(isAdminOnly),
      createdAt: new Date(),
      createdBy: isAssignedTech ? req.user.techId : job.assignedTo
    });

    if (!job.events) {
      job.events = [];
    }
    job.events.push(
      makeJobEvent(req, 'note_added', {
        notePreview: makeNotePreview(note),
        author: getActorName(req.user)
      })
    );
    
    await job.save();
    
    res.json({ 
      ok: true, 
      note: job.techNotes[job.techNotes.length - 1],
      totalNotes: job.techNotes.length
    });
  } catch (e) { 
    res.status(500).json({ error: e.message || 'Failed to add tech note' }); 
  }
});

/* ---------- Invoices ---------- */
// list
app.get('/api/invoices', auth, async (req, res) => {
  try {
    const { q = '', status } = req.query;
    const query = {
      createdBy: req.user.sub,
      ...(q ? { $or: [
        { number:   { $regex: q, $options: 'i' } },
        { customer: { $regex: q, $options: 'i' } },
        { notes:    { $regex: q, $options: 'i' } }, // description
      ] } : {}),
      ...(status && status !== 'All' ? { status } : {}),
    };
    const list = await Invoice.find(query).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) { return sendErr(res, 500, 'Failed to load invoices'); }
});

// create (accepts description -> notes)
app.post('/api/invoices', auth, async (req, res) => {
  try {
    const {
      number,
      customer = '',
      amount = 0,
      status = 'Unpaid',
      date = Date.now(),
      notes = '',
      description,
      // Enhanced customer details
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      // Job details
      jobTitle,
      jobDescription,
      // Pricing breakdown
      fixedPrice = 165,
      additionalMins = 0,
      software = [],
      // Discounts
      pensionYearDiscount = false,
      socialMediaDiscount = false
    } = req.body || {};

    if (!number) return res.status(400).json({ error: 'Invoice number is required' });

    const doc = await Invoice.create({
      number: String(number).trim(),
      customer,
      amount: Number(amount) || 0,
      status,
      date,
      notes: (description ?? notes ?? ''),
      // Enhanced customer details
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      // Job details
      jobTitle,
      jobDescription,
      // Pricing breakdown
      fixedPrice: Number(fixedPrice) || 165,
      additionalMins: Number(additionalMins) || 0,
      software: Array.isArray(software) ? software : [],
      // Discounts
      pensionYearDiscount: Boolean(pensionYearDiscount),
      socialMediaDiscount: Boolean(socialMediaDiscount),
      createdBy: req.user.sub
    });
    res.json(doc);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Invoice number already exists' });
    res.status(500).json({ error: e.message });
  }
});

// update (owner-scoped; map description -> notes)
app.put('/api/invoices/:id', auth, async (req, res) => {
  const { id } = req.params;
  const payload = { ...(req.body || {}) };
  if (payload.amount != null) payload.amount = Number(payload.amount) || 0;
  if ('description' in payload) { payload.notes = payload.description; delete payload.description; }
  try {
    const doc = await Invoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.sub },
      payload,
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Invoice not found' });
    res.json(doc);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Invoice number already exists' });
    res.status(500).json({ error: e.message });
  }
});

// delete (owner-scoped)
app.delete('/api/invoices/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await Invoice.findOneAndDelete({ _id: id, createdBy: req.user.sub });
  if (!doc) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ ok: true });
});

// Get next sequential invoice number (format: INV-2026-0001) - MUST be before /:id routes
app.get('/api/invoices/next-number', auth, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const seq = await getNextSequence(`invoice-${year}`, 'INV', year);
    const invoiceNumber = `INV-${year}-${String(seq).padStart(4, '0')}`;
    res.json({ number: invoiceNumber });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to generate invoice number' });
  }
});

// single (owner-scoped) - MUST be after specific routes like /next-number
app.get('/api/invoices/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await Invoice.findOne({ _id: id, createdBy: req.user.sub }).lean();
  if (!doc) return res.status(404).json({ error: 'Invoice not found' });
  res.json(doc);
});

/* ---------- Technicians ---------- */
// list (+ filters)
app.get('/api/techs', auth, async (req, res) => {
  // Only admins can access this endpoint
  if (req.user.role !== 'admin') {
    return sendErr(res, 403, 'Admins only');
  }

  const { q = '', active } = req.query;
  const query = {
    createdBy: req.user.sub,
    ...(q ? { $or: [
      { name:  { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } },
      { address: { $regex: q, $options: 'i' } },
      { emergencyContact: { $regex: q, $options: 'i' } },
    ] } : {}),
    ...(active === 'true' ? { active: true } : active === 'false' ? { active: false } : {}),
  };
  const docs = await Tech.find(query).sort({ name: 1 }).lean();
  
  // Enrich with login account status
  const techIds = docs.map(t => t._id.toString());
  const linkedUsers = await User.find({ techId: { $in: techIds } }).select('techId email').lean();
  const userMap = new Map(linkedUsers.map(u => [u.techId.toString(), u.email]));
  
  const enriched = docs.map(t => ({
    ...t,
    hasLoginAccount: userMap.has(t._id.toString()),
    loginEmail: userMap.get(t._id.toString()) || null
  }));
  
  res.json(enriched);
});

// names for dropdowns
app.get('/api/techs/names', auth, async (req, res) => {
  const list = await Tech.find({ createdBy: req.user.sub, active: true })
    .select('name').sort({ name: 1 }).lean();
  res.json(list);
});

// create (auto-generates technicianCode)
app.post('/api/techs', auth, async (req, res) => {
  const {
    name, email = '', phone = '', skills = [],
    active = true, notes = '', address = '', emergencyContact = '',
    emergencyContactName = '', emergencyContactPhone = '', emergencyContactEmail = '',
    workingHours, timeOff
  } = req.body || {};

  if (!name) return res.status(400).json({ error: 'Name required' });

  // Validate emergency contact: name required, plus at least phone or email
  if (emergencyContactName) {
    if (!emergencyContactPhone && !emergencyContactEmail) {
      return res.status(400).json({ error: 'Emergency contact must have either phone or email' });
    }
  }

  // Validate email format if provided
  if (emergencyContactEmail && !isEmailAddressValid(emergencyContactEmail)) {
    return res.status(400).json({ error: 'Invalid emergency contact email format' });
  }

  // Generate next technician code atomically
  const seq = await getNextSequence('tech', 'TECH');
  const technicianCode = `TECH-${String(seq).padStart(3, '0')}`;

  // Build legacy emergencyContact string for backwards compatibility
  const legacyEmergencyContact = emergencyContactName
    ? `${emergencyContactName}${emergencyContactPhone ? ' - ' + emergencyContactPhone : ''}${emergencyContactEmail ? ' - ' + emergencyContactEmail : ''}`
    : emergencyContact;

  const doc = await Tech.create({
    name, email, phone, skills, active, notes, address,
    emergencyContact: legacyEmergencyContact,
    emergencyContactName, emergencyContactPhone, emergencyContactEmail,
    technicianCode,
    ...(workingHours ? { workingHours } : {}),
    ...(timeOff ? { timeOff } : {}),
    createdBy: req.user.sub
  });
  res.json(doc);
});

// update
app.put('/api/techs/:id', auth, async (req, res) => {
  const { id } = req.params;
  const update = req.body || {};

  // Validate emergency contact if provided
  if (update.emergencyContactName !== undefined) {
    if (update.emergencyContactName && !update.emergencyContactPhone && !update.emergencyContactEmail) {
      return res.status(400).json({ error: 'Emergency contact must have either phone or email' });
    }

    // Validate email format if provided
    if (update.emergencyContactEmail && !isEmailAddressValid(update.emergencyContactEmail)) {
      return res.status(400).json({ error: 'Invalid emergency contact email format' });
    }

    // Build legacy emergencyContact string for backwards compatibility
    if (update.emergencyContactName) {
      update.emergencyContact = `${update.emergencyContactName}${update.emergencyContactPhone ? ' - ' + update.emergencyContactPhone : ''}${update.emergencyContactEmail ? ' - ' + update.emergencyContactEmail : ''}`;
    }
  }

  const doc = await Tech.findOneAndUpdate(
    { _id: id, createdBy: req.user.sub },
    update,
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Technician not found' });
  res.json(doc);
});

// delete
app.delete('/api/techs/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await Tech.findOneAndDelete({ _id: id, createdBy: req.user.sub });
  if (!doc) return res.status(404).json({ error: 'Technician not found' });

  // Also delete any linked user account to prevent orphaned auth records
  try {
    await User.deleteOne({ techId: id });
  } catch (userErr) {
    // Log but don't fail the deletion if user cleanup fails
    console.error('Failed to delete linked user account for technician:', id, userErr.message);
  }

  res.json({ ok: true });
});

// Create login account for technician (admin only)
app.post('/api/techs/:id/create-account', auth, async (req, res) => {
  try {
    // Only admins can create technician accounts
    if (req.user.role !== 'admin') {
      return sendErr(res, 403, 'Admins only');
    }

    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return sendErr(res, 400, 'Email and password are required');
    }

    // Validate email format
    if (!isEmailAddressValid(normalizedEmail)) {
      return sendErr(res, 400, 'Invalid email format');
    }

    if (password.length < 6) {
      return sendErr(res, 400, 'Password must be at least 6 characters');
    }

    // Verify technician exists and belongs to this admin
    const tech = await Tech.findOne({ _id: req.params.id, createdBy: req.user.sub });
    if (!tech) {
      return sendErr(res, 404, 'Technician not found');
    }

    // Check if technician already has a linked account
    const existingLinked = await User.findOne({ techId: tech._id });
    if (existingLinked) {
      return sendErr(res, 409, 'Technician already has a linked login account');
    }

    // Check if email is already used by another user
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return sendErr(res, 409, 'Email address is already registered');
    }

    // Create the user account
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: tech.name,
      email: normalizedEmail,
      passwordHash,
      role: 'technician',
      techId: tech._id
    });

    // Send credentials email to technician (best-effort, non-blocking)
    try {
      const portalUrl = process.env.PORTAL_URL || `${req.protocol}://${req.get('host')}/tech-view`;
      const template = templates.technicianAccountCreated({
        techName: tech.name,
        email: normalizedEmail,
        tempPassword: password,
        portalUrl
      });
      const emailResult = await sendEmail(normalizedEmail, template.subject, template.text, template.html);
      if (emailResult.sent) {
        console.log('[EMAIL] Technician credentials sent to:', normalizedEmail);
      } else {
        console.log('[EMAIL] Failed to send credentials:', emailResult.reason || emailResult.error);
      }
    } catch (emailErr) {
      console.error('[EMAIL] Error sending technician credentials:', emailErr.message);
      // Don't fail the request if email fails - account is still created
    }

    res.status(201).json({
      message: 'Login account created successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        techId: user.techId
      }
    });
  } catch (e) {
    if (e.code === 11000) {
      return sendErr(res, 409, 'Duplicate entry - account may already exist');
    }
    return sendErr(res, 500, e.message || 'Failed to create account');
  }
});

/* ---- Working hours + time-off (Roster) ---- */
// Update weekly working hours
app.put('/api/techs/:id/working-hours', auth, async (req, res) => {
  const tech = await Tech.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.sub },
    { workingHours: req.body },
    { new: true }
  );
  if (!tech) return res.status(404).json({ error: 'Technician not found' });
  res.json(tech);
});

// Add time-off
app.post('/api/techs/:id/time-off', auth, async (req, res) => {
  const { start, end, reason } = req.body || {};
  if (!start || !end) return res.status(400).json({ error: 'start and end are required' });
  const tech = await Tech.findOne({ _id: req.params.id, createdBy: req.user.sub });
  if (!tech) return res.status(404).json({ error: 'Technician not found' });
  tech.timeOff.push({ start, end, reason });
  await tech.save();
  res.json(tech);
});

// Remove time-off entry
app.delete('/api/techs/:id/time-off/:timeOffId', auth, async (req, res) => {
  const tech = await Tech.findOne({ _id: req.params.id, createdBy: req.user.sub });
  if (!tech) return res.status(404).json({ error: 'Technician not found' });
  const node = tech.timeOff.id(req.params.timeOffId);
  if (!node) return res.status(404).json({ error: 'Time-off not found' });
  node.remove();
  await tech.save();
  res.json({ ok: true });
});

// Availability (blocked ranges for the visible window) — kept for compatibility
app.get('/api/techs/:id/availability', auth, async (req, res) => {
  const tech = await Tech.findOne({ _id: req.params.id, createdBy: req.user.sub }).lean();
  if (!tech) return res.status(404).json({ error: 'Tech not found' });

  const from = new Date(req.query.from);
  const to   = new Date(req.query.to);
  if (!(from instanceof Date) || isNaN(from) || !(to instanceof Date) || isNaN(to)) {
    return res.status(400).json({ error: 'from/to required (ISO dates)' });
  }

  const blocked = [];

  // 1) Non-working hours per day (skipped in ALWAYS_OPEN mode)
  if (!ALWAYS_OPEN) {
    for (let d = new Date(from); d < to; d = new Date(d.getTime() + 86400000)) {
      const dayKey = dayMap[d.getDay()];
      const slots = (tech.workingHours?.[dayKey] || []).slice().sort((a,b)=>a.start.localeCompare(b.start));

      let last = '00:00';
      const pushGap = (s,e) => {
        if (s === e) return;
        const start = new Date(d); const [sh, sm] = s.split(':').map(Number);
        start.setHours(sh, sm || 0, 0, 0);
        const end   = new Date(d); const [eh, em] = e.split(':').map(Number);
        end.setHours(eh, em || 0, 0, 0);
        blocked.push({ start: start.toISOString(), end: end.toISOString() });
      };

      for (const sl of slots) { pushGap(last, sl.start); last = sl.end; }
      pushGap(last, '24:00');
    }
  }

  // 2) Time-off clipped to window
  for (const off of (tech.timeOff || [])) {
    const s = new Date(off.start), e = new Date(off.end);
    const start = s < from ? from : s;
    const end   = e > to   ? to   : e;
    if (start < end) blocked.push({ start: start.toISOString(), end: end.toISOString() });
  }

  res.json(blocked);
});

// Counter schema for sequential numbering (technician codes, invoice numbers)
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'tech', 'invoice-2026'
  prefix: { type: String, default: '' }, // e.g., 'TECH', 'INV'
  year: { type: Number }, // optional year for yearly sequences
  seq: { type: Number, default: 0 }, // current sequence number
}, { timestamps: true });
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

// Helper to get next sequence number atomically
async function getNextSequence(name, prefix = '', year = null) {
  const query = { name };
  const update = { $inc: { seq: 1 } };
  const options = { new: true, upsert: true };
  
  // If year is specified, include it in the query and update
  if (year) {
    query.year = year;
    update.$setOnInsert = { prefix, year };
  } else {
    update.$setOnInsert = { prefix };
  }
  
  const counter = await Counter.findOneAndUpdate(query, update, options);
  return counter.seq;
}
/**
 * GET /api/timeoff?from=ISO&to=ISO&technician=Name
 * Returns: [{ technician, startAt, endAt, reason }]
 */
app.get('/api/timeoff', auth, async (req, res) => {
  try {
    const { from, to, technician } = req.query;
    const start = from ? new Date(from) : null;
    const end   = to   ? new Date(to)   : null;

    const techQuery = { createdBy: req.user.sub };
    if (technician) techQuery.name = technician;

    const techs = await Tech.find(techQuery).select('name timeOff').lean();
    const out = [];

    for (const t of techs) {
      for (const off of (t.timeOff || [])) {
        let s = new Date(off.start);
        let e = new Date(off.end);
        if (start && e < start) continue;
        if (end && s > end) continue;
        if (start && s < start) s = start;
        if (end && e > end) e = end;
        if (s < e) out.push({ technician: t.name, startAt: s.toISOString(), endAt: e.toISOString(), reason: off.reason || '' });
      }
    }

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load time-off' });
  }
});

/* ---------- Aliases for older frontend paths (optional) ----- */
app.get('/api/technicians', auth, async (req, res) => {
  const { q = '', active } = req.query;
  const query = {
    createdBy: req.user.sub,
    ...(q ? { $or: [
      { name:  { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } },
    ] } : {}),
    ...(active === 'true' ? { active: true } : active === 'false' ? { active: false } : {}),
  };
  const docs = await Tech.find(query).sort({ name: 1 }).lean();
  res.json(docs);
});
app.get('/api/technicians/names', auth, async (req, res) => {
  const list = await Tech.find({ createdBy: req.user.sub, active: true })
    .select('name').sort({ name: 1 }).lean();
  res.json(list);
});
app.get('/api/technicians/:id/availability', (req,res,next)=> {
  req.url = `/api/techs/${req.params.id}/availability${req._parsedUrl.search||''}`;
  next();
});

/* ---------- Customer CRM Routes ---------- */
// Get all customers
app.get('/api/customers', auth, async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (e) {
    return sendErr(res, 500, 'Failed to load customers');
  }
});

// Create new customer
app.post('/api/customers', auth, async (req, res) => {
  try {
    const { customerId, name, phone, email, address } = req.body;
    
    if (!customerId || !name || !phone) {
      return sendErr(res, 400, 'Customer ID, name, and phone are required');
    }
    
    const customer = await Customer.create({
      customerId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : ''
    });
    
    res.status(201).json(customer);
  } catch (e) {
    if (e.code === 11000) {
      return sendErr(res, 400, 'Customer ID already exists');
    }
    return sendErr(res, 500, 'Failed to create customer');
  }
});

// Update customer
app.put('/api/customers/:id', auth, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        address: address ? address.trim() : '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return sendErr(res, 404, 'Customer not found');
    }
    
    res.json(customer);
  } catch (e) {
    return sendErr(res, 500, 'Failed to update customer');
  }
});

// Delete customer
app.delete('/api/customers/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return sendErr(res, 404, 'Customer not found');
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (e) {
    return sendErr(res, 500, 'Failed to delete customer');
  }
});

// Get single customer
app.get('/api/customers/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return sendErr(res, 404, 'Customer not found');
    }
    res.json(customer);
  } catch (e) {
    return sendErr(res, 500, 'Failed to load customer');
  }
});

/* ---------- Incoming Job Requests (Admin Portal) ---------- */
// List incoming job requests
app.get('/api/incoming-jobs', auth, async (req, res) => {
  try {
    const { status, q = '' } = req.query;
    
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (q) {
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const jobRequests = await IncomingJobRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(jobRequests);
  } catch (e) {
    console.error('Error fetching incoming jobs:', e);
    res.status(500).json({ error: 'Failed to fetch incoming jobs' });
  }
});

// Get single incoming job request
app.get('/api/incoming-jobs/:id', auth, async (req, res) => {
  try {
    const jobRequest = await IncomingJobRequest.findById(req.params.id).lean();
    if (!jobRequest) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    res.json(jobRequest);
  } catch (e) {
    console.error('Error fetching job request:', e);
    res.status(500).json({ error: 'Failed to fetch job request' });
  }
});

// Update incoming job request (status, assignment, notes)
app.put('/api/incoming-jobs/:id', auth, async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    
    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;

    const jobRequest = await IncomingJobRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).lean();

    if (!jobRequest) {
      return res.status(404).json({ error: 'Job request not found' });
    }

    res.json(jobRequest);
  } catch (e) {
    console.error('Error updating job request:', e);
    res.status(500).json({ error: 'Failed to update job request' });
  }
});

// Delete incoming job request
app.delete('/api/incoming-jobs/:id', auth, async (req, res) => {
  try {
    const result = await IncomingJobRequest.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting job request:', e);
    res.status(500).json({ error: 'Failed to delete job request' });
  }
});

// Check if incoming job request can be converted
app.get('/api/incoming-jobs/:id/convert-check', auth, async (req, res) => {
  try {
    const request = await IncomingJobRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.convertedToJobId) {
      return res.json({ 
        canConvert: false, 
        reason: 'Already converted to job',
        convertedToJobId: request.convertedToJobId,
        request 
      });
    }
    
    res.json({ canConvert: true, request });
  } catch (e) {
    console.error('Error checking convert status:', e);
    res.status(500).json({ error: 'Failed to check convert status' });
  }
});

/* ------------------------ STARTUP --------------------------- */
async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Missing MONGODB_URI in .env');
      process.exit(1);
    }
    console.log('Connecting to MongoDB...');

    const uri = process.env.MONGODB_URI;
    const uriScheme = String(uri).split(':')[0];
    const redacted = String(uri)
      .replace(/\/\/([^:/?#]+):([^@/?#]+)@/i, '//$1:***@');

    console.log('[mongo] Node:', process.version, '| Mongoose:', mongoose.version, '| URI scheme:', uriScheme);
    console.log('[mongo] URI (redacted):', redacted);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 30000,
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 30000,
      socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
    });
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Failed to connect to MongoDB:', e.message);
    console.error('Check: Network Access, DB user/password, and MONGODB_URI.');
    if (e?.name || e?.code) console.error('[mongo] Error meta:', { name: e.name, code: e.code });
    process.exit(1);
  }
}
mongoose.connection.on('error', err => console.error('Mongo connection error:', err.message));
start();
