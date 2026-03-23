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
    req.user = payload; // { sub, email, name }
    next();
  } catch {
    return sendErr(res, 401, 'Invalid token');
  }
}

/* ------------------------ MODELS ---------------------------- */
const Job = require('./models/Job'); // must have fields: owner, title, invoice, technician, startAt, endAt, etc.

// User
const UserSchema = new mongoose.Schema({
  name:         { type: String, default: 'Admin' },
  email:        { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
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
  email:    { type: String, trim: true, default: '' },
  phone:    { type: String, trim: true, default: '' },
  skills:   { type: [String], default: [] },
  active:   { type: Boolean, default: true },
  notes:    { type: String, default: '' },
  address:  { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
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
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  },
  assignedTo: { type: String, default: '' }, // Technician name
  notes: { type: String, default: '' },
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

// Make sure we have an index to speed up overlap checks (if not defined in Job schema)
(async () => {
  try {
    await Job.collection.createIndex({ owner: 1, technician: 1, startAt: 1, endAt: 1 });
  } catch {}
})();

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

/* ---------- Marketing Site Routes ---------- */
// Submit job request from marketing site (no auth required)
app.post('/api/marketing/job-request', async (req, res) => {
  try {
    console.log('Received job request:', {
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      description: req.body.description,
      imagesCount: req.body.images ? req.body.images.length : 0
    });

    const { fullName, phone, email, description, images } = req.body;
    
    if (!fullName || !phone || !description) {
      console.log('Validation failed:', { fullName, phone, description });
      return res.status(400).json({ 
        error: 'Full name, phone, and description are required' 
      });
    }

    const jobRequest = await IncomingJobRequest.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      description: description.trim(),
      images: images || [],
      status: 'New'
    });

    console.log('Job request created successfully:', jobRequest._id);
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
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = (req.body.name || 'Admin').trim();
    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    if (!email || !password) return sendErr(res, 400, 'Email and password are required');

    const existing = await User.findOne({ email }).lean();
    if (existing) return sendErr(res, 400, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = jwt.sign({ sub: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) { return sendErr(res, 400, e.message || 'Registration failed'); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    const user = await User.findOne({ email });
    if (!user) return sendErr(res, 400, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendErr(res, 400, 'Invalid credentials');

    const token = jwt.sign({ sub: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) { return sendErr(res, 400, e.message || 'Login failed'); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('email name').lean();
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
    let { title, invoice, priority, status, technician, phone, description, startAt, endAt } = req.body;
    if (!title || !invoice) return sendErr(res, 400, 'Title and Invoice are required');

    startAt = startAt ? new Date(startAt) : null;
    endAt   = endAt   ? new Date(endAt)   : null;
    if (startAt && endAt && endAt < startAt) return sendErr(res, 400, 'endAt must be after startAt');

    // Conflict prevention (only if scheduled and technician set)
    if (technician && startAt && endAt) {
      await assertSchedulable({
        ownerId: req.user.sub,
        technicianName: technician,
        start: startAt,
        end: endAt
      });
    }

    const job = await Job.create({
      title, invoice, priority, status, technician, phone, description,
      startAt, endAt,
      owner: req.user.sub
    });
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

    const updated = await Job.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.sub },
      update,
      { new: true }
    ).lean();
    if (!updated) return sendErr(res, 404, 'Not found');
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
    const note = await JobNote.create({
      job: req.params.id,
      text: text.trim(),
      author: (req.user?.name || req.user?.email || 'Admin'),
      owner: req.user.sub
    });
    res.json(note);
  } catch (e) { res.status(400).json({ error: e.message || 'Failed to add note' }); }
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

// single (owner-scoped)
app.get('/api/invoices/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await Invoice.findOne({ _id: id, createdBy: req.user.sub }).lean();
  if (!doc) return res.status(404).json({ error: 'Invoice not found' });
  res.json(doc);
});

/* ---------- Technicians ---------- */
// list (+ filters)
app.get('/api/techs', auth, async (req, res) => {
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
  res.json(docs);
});

// names for dropdowns
app.get('/api/techs/names', auth, async (req, res) => {
  const list = await Tech.find({ createdBy: req.user.sub, active: true })
    .select('name').sort({ name: 1 }).lean();
  res.json(list);
});

// create
app.post('/api/techs', auth, async (req, res) => {
  const {
    name, email = '', phone = '', skills = [],
    active = true, notes = '', address = '', emergencyContact = '',
    workingHours, timeOff
  } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const doc = await Tech.create({
    name, email, phone, skills, active, notes, address, emergencyContact,
    ...(workingHours ? { workingHours } : {}),
    ...(timeOff ? { timeOff } : {}),
    createdBy: req.user.sub
  });
  res.json(doc);
});

// update
app.put('/api/techs/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await Tech.findOneAndUpdate(
    { _id: id, createdBy: req.user.sub },
    req.body || {},
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
  res.json({ ok: true });
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

/* ---------- NEW: Aggregate time-off for all techs ---------- */
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
