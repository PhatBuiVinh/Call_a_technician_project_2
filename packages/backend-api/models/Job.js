const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true },
    invoice: { type: String, required: true },
    priority: { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Low' },
    status:   { type: String, enum: ['Open','Assigned','Accepted','En Route','On Site','In Progress','Completed','Closed'], default: 'Open' },
    
    // LEGACY: technician string for backward compatibility (deprecated, use assignedTo)
    technician: { type: String, default: '' },
    
    // NEW: Real technician relationship via Tech model
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tech',
      default: null,
      index: true
    },
    
    // NEW: Technician workflow timestamps
    assignedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },  // When marked "In Progress"
    completedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },  // Admin closeout timestamp
    
    // NEW: Technician notes array
    techNotes: [{
      note: { type: String, required: true },
      isAdminOnly: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tech', required: true }
    }],

    // NEW: Job completion evidence (submitted when tech marks job Completed)
    completionForm: {
      workPerformed: { type: String, default: '' },
      partsUsed: { type: String, default: '' },
      followUpRequired: { type: Boolean, default: false },
      followUpNotes: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tech', default: null }
    },

    // NEW: Technician evidence photos (submitted on completion)
    completionPhotos: [{
      url: { type: String, required: true },
      caption: { type: String, default: '' },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tech', required: true }
    }],

    // Job events timeline (admin-facing chronological audit)
    events: [{
      type: {
        type: String,
        enum: [
          'job_created',
          'status_changed',
          'technician_assigned',
          'note_added',
          'completion_submitted',
          'job_closed'
        ],
        required: true
      },
      timestamp: { type: Date, default: Date.now },
      actorName: { type: String, default: 'System' },
      actorRole: { type: String, default: 'system' },
      actorId: { type: String, default: '' },
      details: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],

    phone: { type: String, default: '' },
    description: { type: String, default: '' },

    // calendar scheduling
    startAt: { type: Date, default: null },
    endAt:   { type: Date, default: null },
    
    // Enhanced customer details
    customerName: { type: String, default: '' },
    customerId: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    
    // Pricing and time
    amount: { type: Number, default: 165 },
    durationMins: { type: Number, default: 120 },
    additionalMins: { type: Number, default: 0 },
    
    // Software and discounts
    software: [{
      name: { type: String, required: true },
      value: { type: Number, required: true, default: 0 }
    }],
    pensionYearDiscount: { type: Boolean, default: false },
    socialMediaDiscount: { type: Boolean, default: false },
    
    // Troubleshooting (admin/technician only)
    troubleshooting: { type: String, default: '' },
    
    // Conversion tracking
    sourceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncomingJobRequest',
      default: null
    }
  },
  { timestamps: true }
);

// indexes belong here (not in server.js)
JobSchema.index({ owner: 1, startAt: 1, endAt: 1 });
JobSchema.index({ owner: 1, assignedTo: 1, startAt: 1 });

module.exports = mongoose.model('Job', JobSchema);
