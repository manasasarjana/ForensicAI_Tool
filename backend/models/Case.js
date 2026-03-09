const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  incidentDate: {
    type: Date,
    required: true
  },
  investigator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    type: String,
    trim: true
  },
  suspects: [{
    name: String,
    details: String
  }],
  victims: [{
    name: String,
    details: String
  }],
  tags: [String],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for performance
caseSchema.index({ caseId: 1 });
caseSchema.index({ investigator: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ createdAt: -1 });

// Generate case ID
caseSchema.pre('save', async function(next) {
  if (!this.caseId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.caseId = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);