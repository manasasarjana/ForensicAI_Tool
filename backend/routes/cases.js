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
      if (investigator) query.investigator = investigator;

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
      // Show all cases and system-wide statistics to all users
      const stats = await Promise.all([
        Case.countDocuments({ status: 'active' }),
        Case.countDocuments({ status: 'closed' }),
        Case.countDocuments({ status: 'archived' }),
        Case.countDocuments({}),
        Evidence.countDocuments({}),
        Report.countDocuments({})
      ]);

      // Get cases by month for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const casesByMonth = await Case.aggregate([
        {
          $match: {
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

module.exports = router;

/*router.post('/',
  auth,
  validate(caseSchema),
  auditLogger('case_created', 'case'),
  async (req, res) => {
    try {

      const caseData = new Case({
        caseId: "CF-" + Date.now(),   // 🔥 auto generate ID
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
);*/