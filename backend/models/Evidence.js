const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  evidenceId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  cloudUrl: {
    type: String
  },
  sha256Hash: {
    type: String,
    required: true
  },
  md5Hash: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationHistory: [{
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    hashMatch: Boolean,
    notes: String
  }],
  chainOfCustody: [{
    action: {
      type: String,
      enum: ['uploaded', 'accessed', 'modified', 'verified', 'downloaded'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    notes: String
  }],
  metadata: {
    exifData: Object,
    forensicData: Object,
    customFields: Map
  }
}, {
  timestamps: true
});

// Indexes
evidenceSchema.index({ caseId: 1 });
evidenceSchema.index({ evidenceId: 1 });
evidenceSchema.index({ uploadedBy: 1 });
evidenceSchema.index({ sha256Hash: 1 });
evidenceSchema.index({ createdAt: -1 });

// Generate evidence ID
// use timestamp/random suffix to avoid duplicate key issues during bulk uploads
const crypto = require('crypto');
evidenceSchema.pre('save', async function(next) {
  if (!this.evidenceId) {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.evidenceId = `EVD-${timestamp}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Evidence', evidenceSchema);