const express = require('express');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const Report = require('../models/Report');
const { auth, adminAuth, auditLogger } = require('../middleware/auth');
const { validate, caseSchema } = require('../middleware/validation');

const router = express.Router();

// Get all cases (with pagination and filtering)
router.get('/',
  auth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        investigator,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = {};

      // Apply filters
      if (status) query.status = status;
      if (priority) query.priority = priority;

      // Tenant Isolation: If not admin, FORCE query.investigator to their own ID
      if (req.user.role !== 'admin') {
        query.investigator = req.userId;
      } else if (investigator) {
        query.investigator = investigator;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { caseId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: {
          path: 'investigator',
          select: 'username firstName lastName email'
        }
      };

      const cases = await Case.find(query)
        .populate(options.populate)
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);

      const total = await Case.countDocuments(query);

      res.json({
        cases,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      });

    } catch (error) {
      console.error('Get cases error:', error);
      res.status(500).json({ message: 'Server error fetching cases' });
    }
  }
);

// Get case statistics
router.get('/stats/dashboard',
  auth,
  async (req, res) => {
    try {
      // Filter by investigator if the user is not an admin
      const isAdmin = req.user.role === 'admin';
      const userFilter = isAdmin ? {} : { investigator: req.userId };
      const evidenceFilter = isAdmin ? {} : { uploadedBy: req.userId };
      const reportFilter = isAdmin ? {} : { generatedBy: req.userId };

      const stats = await Promise.all([
        Case.countDocuments({ ...userFilter, status: 'active' }),
        Case.countDocuments({ ...userFilter, status: 'closed' }),
        Case.countDocuments({ ...userFilter, status: 'archived' }),
        Case.countDocuments(userFilter),
        Evidence.countDocuments(evidenceFilter),
        Report.countDocuments(reportFilter)
      ]);

      // Get cases by month for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const casesByMonth = await Case.aggregate([
        {
          $match: {
            ...userFilter,
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      res.json({
        activeCases: stats[0],
        closedCases: stats[1],
        archivedCases: stats[2],
        totalCases: stats[3],
        totalEvidence: stats[4],
        totalReports: stats[5],
        casesByMonth
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Server error fetching statistics' });
    }
  }
);

// Get single case
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const caseData = await Case.findById(req.params.id)
        .populate('investigator', 'username firstName lastName email');

      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }

      // Tenant Isolation: verify investigator ownership
      if (req.user.role !== 'admin' && caseData.investigator._id.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not have permission to view this case.' });
      }

      // Get related evidence and reports
      const evidence = await Evidence.find({ caseId: caseData._id })
        .populate('uploadedBy', 'username firstName lastName')
        .sort({ createdAt: -1 });

      const reports = await Report.find({ caseId: caseData._id })
        .populate('generatedBy', 'username firstName lastName')
        .sort({ createdAt: -1 });

      res.json({
        case: caseData,
        evidence,
        reports
      });

    } catch (error) {
      console.error('Get case error:', error);
      res.status(500).json({ message: 'Server error fetching case' });
    }
  }
);

// Create new case
router.post('/',
  auth,
  validate(caseSchema),
  auditLogger('case_created', 'case'),
  async (req, res) => {
    try {
      const caseData = new Case({
        caseId: "CF-" + Date.now(),
        ...req.body,
        investigator: req.userId
      });

      await caseData.save();
      await caseData.populate('investigator', 'username firstName lastName email');

      res.status(201).json({
        message: 'Case created successfully',
        case: caseData
      });

    } catch (error) {
      console.error('Create case error:', error);
      res.status(500).json({ message: 'Server error creating case' });
    }
  }
);

// Update case
router.put('/:id',
  auth,
  auditLogger('case_updated', 'case'),
  async (req, res) => {
    try {
      // Find the case first to check ownership
      const caseToUpdate = await Case.findById(req.params.id);
      
      if (!caseToUpdate) {
        return res.status(404).json({ message: 'Case not found' });
      }

      // Tenant Isolation: verify investigator ownership
      if (req.user.role !== 'admin' && caseToUpdate.investigator.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not have permission to modify this case.' });
      }

      const caseData = await Case.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('investigator', 'username firstName lastName email');

      res.json({
        message: 'Case updated successfully',
        case: caseData
      });

    } catch (error) {
      console.error('Update case error:', error);
      res.status(500).json({ message: 'Server error updating case' });
    }
  }
);

// Close case
router.put('/:id/close',
  auth,
  auditLogger('case_closed', 'case'),
  async (req, res) => {
    try {
      const caseData = await Case.findById(req.params.id);

      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }

      // Tenant Isolation: verify investigator ownership
      if (req.user.role !== 'admin' && caseData.investigator.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not have permission to modify this case.' });
      }

      if (caseData.status === 'closed') {
        return res.status(400).json({ message: 'Case is already closed' });
      }

      caseData.status = 'closed';
      caseData.closedAt = new Date();
      caseData.closedBy = req.userId;

      await caseData.save();
      await caseData.populate('investigator', 'username firstName lastName email');

      res.json({
        message: 'Case closed successfully',
        case: caseData
      });

    } catch (error) {
      console.error('Close case error:', error);
      res.status(500).json({ message: 'Server error closing case' });
    }
  }
);

module.exports = router;