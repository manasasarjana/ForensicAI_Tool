const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'password_change',
      'case_created',
      'case_updated',
      'case_deleted',
      'evidence_uploaded',
      'evidence_accessed',
      'evidence_verified',
      'evidence_downloaded',
      'report_generated',
      'report_edited',
      'report_finalized',
      'report_exported',
      'user_created',
      'user_updated',
      'user_deleted',
      'case_closed',
      'system_access'
    ]
  },
  resource: {
    type: String, // e.g., 'case', 'evidence', 'report', 'user'
  },
  resourceId: {
    type: String // ID of the affected resource
  },
  details: {
    type: Object, // Additional context about the action
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for performance and querying
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ success: 1 });
auditLogSchema.index({ severity: 1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

// Static method to create audit log entry
auditLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent breaking main functionality
    return null;
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

// Static method to get system activity
auditLogSchema.statics.getSystemActivity = async function(filters = {}, limit = 100) {
  const query = {};
  
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.severity) query.severity = filters.severity;
  if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);