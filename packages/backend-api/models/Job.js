const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true },
    invoice: { type: String, required: true },
    priority: { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Low' },
    status:   { type: String, enum: ['Open','In Progress','Closed'], default: 'Open' },
    technician: { type: String, default: '' },
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
    troubleshooting: { type: String, default: '' }
  },
  { timestamps: true }
);

// indexes belong here (not in server.js)
JobSchema.index({ owner: 1, startAt: 1, endAt: 1 });
JobSchema.index({ owner: 1, technician: 1, startAt: 1 });

module.exports = mongoose.model('Job', JobSchema);
