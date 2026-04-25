const express = require('express');
const AuditLog = require('../models/AuditLog');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get audit logs (admin only for system-wide, users can see their own)
router.get('/',
  auth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        resource,
        severity,
        dateFrom,
        dateTo,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const query = {};
      
      // Apply filters
      if (action) query.action = action;
      if (resource) query.resource = resource;
      if (severity) query.severity = severity;
      
      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }
      
      // User filter - admins can see all, users only see their own
      if (req.user.role === 'admin') {
        if (userId) query.userId = userId;
      } else {
        query.userId = req.userId;
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      };
      
      const logs = await AuditLog.find(query)
        .populate('userId', 'username firstName lastName email')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);
      
      const total = await AuditLog.countDocuments(query);
      
      res.json({
        logs,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      });
      
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ message: 'Server error fetching audit logs' });
    }
  }
);

// Get user activity (own activity or admin can specify user)
router.get('/user/:userId?',
  auth,
  async (req, res) => {
    try {
      const targetUserId = req.params.userId || req.userId;
      
      // Check permissions
      if (req.user.role !== 'admin' && targetUserId !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { limit = 50 } = req.query;
      
      const logs = await AuditLog.getUserActivity(targetUserId, parseInt(limit));
      
      res.json({ logs });
      
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({ message: 'Server error fetching user activity' });
    }
  }
);

// Get system activity summary (admin only)
router.get('/system/summary',
  auth, adminAuth,
  async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
      }
      
      // Get activity summary
      const summary = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            lastOccurrence: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Get activity by severity
      const severitySummary = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Get top active users
      const topUsers = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            count: 1,
            lastActivity: 1,
            user: { $arrayElemAt: ['$user', 0] }
          }
        }
      ]);
      
      // Get failed actions
      const failedActions = await AuditLog.countDocuments({
        ...dateFilter,
        success: false
      });
      
      // Get activity by day for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dailyActivity = await AuditLog.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      
      res.json({
        summary,
        severitySummary,
        topUsers,
        failedActions,
        dailyActivity
      });
      
    } catch (error) {
      console.error('Get system summary error:', error);
      res.status(500).json({ message: 'Server error fetching system summary' });
    }
  }
);

// Get security events (admin only)
router.get('/security',
  auth, adminAuth,
  async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      
      const securityActions = [
        'login',
        'logout',
        'password_change',
        'user_created',
        'user_deleted',
        'evidence_accessed',
        'evidence_downloaded',
        'report_finalized'
      ];
      
      const securityLogs = await AuditLog.find({
        $or: [
          { action: { $in: securityActions } },
          { success: false },
          { severity: { $in: ['high', 'critical'] } }
        ]
      })
        .populate('userId', 'username firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      
      res.json({ logs: securityLogs });
      
    } catch (error) {
      console.error('Get security events error:', error);
      res.status(500).json({ message: 'Server error fetching security events' });
    }
  }
);

// Get login history for a user
router.get('/login-history/:userId?',
  auth,
  async (req, res) => {
    try {
      const targetUserId = req.params.userId || req.userId;
      
      // Check permissions
      if (req.user.role !== 'admin' && targetUserId !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { limit = 20 } = req.query;
      
      const loginHistory = await AuditLog.find({
        userId: targetUserId,
        action: { $in: ['login', 'logout'] }
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      
      res.json({ loginHistory });
      
    } catch (error) {
      console.error('Get login history error:', error);
      res.status(500).json({ message: 'Server error fetching login history' });
    }
  }
);

// Export audit logs (admin only)
router.get('/export',
  auth, adminAuth,
  async (req, res) => {
    try {
      const {
        format = 'json',
        action,
        resource,
        severity,
        dateFrom,
        dateTo,
        userId
      } = req.query;
      
      const filters = {};
      if (action) filters.action = action;
      if (resource) filters.resource = resource;
      if (severity) filters.severity = severity;
      if (userId) filters.userId = userId;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      
      const logs = await AuditLog.getSystemActivity(filters, 10000); // Max 10k records
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Timestamp,User,Action,Resource,Resource ID,IP Address,Success,Details\n';
        const csvRows = logs.map(log => {
          const user = log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown';
          const details = JSON.stringify(log.details).replace(/"/g, '""');
          return `${log.createdAt.toISOString()},${user},${log.action},${log.resource || ''},${log.resourceId || ''},${log.ipAddress || ''},${log.success},${details}`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
        res.send(csvHeader + csvRows);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
        res.json({ logs, exportedAt: new Date().toISOString() });
      }
      
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({ message: 'Server error exporting audit logs' });
    }
  }
);

module.exports = router;