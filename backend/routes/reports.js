/*const express = require('express');
const Report = require('../models/Report');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const { auth, auditLogger } = require('../middleware/auth');
const { validate, reportSchema, updateReportSchema } = require('../middleware/validation');
const { generateAIReport } = require('../services/aiService');
const { generatePDF, generateDOCX } = require('../services/exportService');

const router = express.Router();

// Get all reports (with pagination and filtering)
router.get('/',
  auth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        caseId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const query = {};
      
      // Apply filters
      if (status) query.status = status;
      if (caseId) query.caseId = caseId;
      
      // Search functionality
      if (search) {
        query.$or = [
          { reportId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ];
      }
      
      // If not admin, only show own reports
      if (req.user.role !== 'admin') {
        query.generatedBy = req.userId;
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      };
      
      const reports = await Report.find(query)
        .populate('caseId', 'caseId title')
        .populate('generatedBy', 'username firstName lastName')
        .populate('finalizedBy', 'username firstName lastName')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);
      
      const total = await Report.countDocuments(query);
      
      res.json({
        reports,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      });
      
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ message: 'Server error fetching reports' });
    }
  }
);

// Get single report
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('caseId')
        .populate('generatedBy', 'username firstName lastName')
        .populate('finalizedBy', 'username firstName lastName')
        .populate('evidenceReferences.evidenceId')
        .populate('revisionHistory.editedBy', 'username firstName lastName');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      res.json({ report });
      
    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({ message: 'Server error fetching report' });
    }
  }
);

// Create new report (manual)
router.post('/',
  auth,
  validate(reportSchema),
  auditLogger('report_generated', 'report'),
  async (req, res) => {
    try {
      const { caseId, title, content } = req.body;
      
      // Verify case exists and user has access
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      // Generate reportId manually
      const crypto = require('crypto');
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const reportId = `REP-${timestamp}-${randomSuffix}`;
      
      const report = new Report({
        reportId,
        caseId: caseData._id,
        title,
        content: content || {},
        generatedBy: req.userId,
        aiGenerated: false
      });
      
      await report.save();
      await report.populate([
        { path: 'caseId', select: 'caseId title' },
        { path: 'generatedBy', select: 'username firstName lastName' }
      ]);
      
      res.status(201).json({
        message: 'Report created successfully',
        report
      });
      
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ message: 'Server error creating report' });
    }
  }
);

// Generate AI report
router.post('/generate-ai',
  auth,
  auditLogger('report_generated', 'report'),
  async (req, res) => {
    try {
      const { caseId, title } = req.body;
      
      if (!caseId || !title) {
        return res.status(400).json({ message: 'Case ID and title are required' });
      }
      
      // Verify case exists and user has access
      const caseData = await Case.findById(caseId).populate('investigator');
      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      // Generate reportId manually to avoid validation errors
      const crypto = require('crypto');
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const reportId = `REP-${timestamp}-${randomSuffix}`;
      
      // Create report with processing status
      const report = new Report({
        reportId,
        caseId: caseData._id,
        title,
        status: 'processing',
        generatedBy: req.userId,
        aiGenerated: true
      });
      
      await report.save();
      
      // Start AI generation asynchronously
      setImmediate(async () => {
        try {
          // Get case evidence
          const evidence = await Evidence.find({ caseId: caseData._id })
            .populate('uploadedBy', 'username firstName lastName');
          
          // Generate AI report
          const aiResult = await generateAIReport(caseData, evidence);
          
          // Update report with AI content
          report.content = aiResult.content;
          report.aiModel = aiResult.model;
          report.aiPrompt = aiResult.prompt;
          report.aiResponse = aiResult.response;
          report.status = 'completed';
          report.metadata = {
            ...report.metadata,
            processingTime: aiResult.processingTime,
            wordCount: aiResult.wordCount
          };
          
          await report.save();
          
        } catch (aiError) {
          console.error('AI generation error:', aiError);
          report.status = 'draft';
          report.metadata = {
            ...report.metadata,
            error: aiError.message
          };
          await report.save();
        }
      });
      
      await report.populate([
        { path: 'caseId', select: 'caseId title' },
        { path: 'generatedBy', select: 'username firstName lastName' }
      ]);
      
      res.status(201).json({
        message: 'AI report generation started',
        report
      });
      
    } catch (error) {
      console.error('Generate AI report error:', error);
      res.status(500).json({ message: 'Server error generating AI report' });
    }
  }
);

// Update report
router.put('/:id',
  auth,
  validate(updateReportSchema),
  auditLogger('report_edited', 'report'),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id).populate('caseId');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Can't edit finalized reports
      if (report.status === 'finalized') {
        return res.status(400).json({ message: 'Cannot edit finalized report' });
      }
      
      // Store previous version
      const previousContent = {
        title: report.title,
        content: report.content,
        version: report.version
      };
      
      // Update fields
      const { title, content, changes } = req.body;
      
      if (title) report.title = title;
      if (content) report.content = { ...report.content, ...content };
      
      // Increment version and add to revision history
      report.version += 1;
      report.revisionHistory.push({
        version: report.version,
        editedBy: req.userId,
        editedAt: new Date(),
        changes: changes || 'Manual edit',
        previousContent
      });
      
      await report.save();
      await report.populate([
        { path: 'caseId', select: 'caseId title' },
        { path: 'generatedBy', select: 'username firstName lastName' },
        { path: 'revisionHistory.editedBy', select: 'username firstName lastName' }
      ]);
      
      res.json({
        message: 'Report updated successfully',
        report
      });
      
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({ message: 'Server error updating report' });
    }
  }
);

// Finalize report
router.post('/:id/finalize',
  auth,
  auditLogger('report_finalized', 'report'),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id).populate('caseId');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      if (report.status === 'finalized') {
        return res.status(400).json({ message: 'Report is already finalized' });
      }
      
      // Finalize report
      report.status = 'finalized';
      report.finalizedBy = req.userId;
      report.finalizedAt = new Date();
      
      await report.save();
      await report.populate('finalizedBy', 'username firstName lastName');
      
      res.json({
        message: 'Report finalized successfully',
        report
      });
      
    } catch (error) {
      console.error('Finalize report error:', error);
      res.status(500).json({ message: 'Server error finalizing report' });
    }
  }
);

// Export report as PDF
router.get('/:id/export/pdf',
  auth,
  auditLogger('report_exported', 'report'),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('caseId')
        .populate('generatedBy', 'username firstName lastName')
        .populate('finalizedBy', 'username firstName lastName');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Generate PDF
      const pdfBuffer = await generatePDF(report);
      
      // Record export
      report.exports.push({
        format: 'pdf',
        exportedBy: req.userId,
        exportedAt: new Date()
      });
      await report.save();
      
      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Export PDF error:', error);
      res.status(500).json({ message: 'Server error exporting PDF' });
    }
  }
);

// Export report as DOCX
router.get('/:id/export/docx',
  auth,
  auditLogger('report_exported', 'report'),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('caseId')
        .populate('generatedBy', 'username firstName lastName')
        .populate('finalizedBy', 'username firstName lastName');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Generate DOCX
      const docxBuffer = await generateDOCX(report);
      
      // Record export
      report.exports.push({
        format: 'docx',
        exportedBy: req.userId,
        exportedAt: new Date()
      });
      await report.save();
      
      // Send DOCX
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}.docx"`);
      res.send(docxBuffer);
      
    } catch (error) {
      console.error('Export DOCX error:', error);
      res.status(500).json({ message: 'Server error exporting DOCX' });
    }
  }
);

// Download report (defaults to PDF)
router.get('/:id/download',
  auth,
  auditLogger('report_exported', 'report'),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('caseId')
        .populate('generatedBy', 'username firstName lastName')
        .populate('finalizedBy', 'username firstName lastName');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Check if report is ready
      if (report.status !== 'completed' && report.status !== 'finalized') {
        return res.status(400).json({ message: 'Report is not ready for download. Current status: ' + report.status });
      }
      
      // Generate PDF (default format)
      const pdfBuffer = await generatePDF(report);
      
      // Record export
      if (!report.exports) {
        report.exports = [];
      }
      report.exports.push({
        format: 'pdf',
        exportedBy: req.userId,
        exportedAt: new Date()
      });
      await report.save();
      
      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportId || report._id}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({ message: 'Server error downloading report' });
    }
  }
);

// Delete report (admin only)
router.delete('/:id',
  auth,
  auditLogger('report_deleted', 'report'),
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      if (report.status === 'finalized') {
        return res.status(400).json({ message: 'Cannot delete finalized report' });
      }
      
      await Report.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'Report deleted successfully' });
      
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ message: 'Server error deleting report' });
    }
  }
);

module.exports = router;*/
const express = require("express");
const Report = require("../models/Report");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");

const { auth, auditLogger } = require("../middleware/auth");
const { validate, reportSchema } = require("../middleware/validation");

const { generateAIReport } = require("../services/aiService");
const { generatePDF, generateDOCX } = require("../services/exportService");

const router = express.Router();



/*
=========================================
GET ALL REPORTS
=========================================
*/
router.get("/", auth, async (req, res) => {

  try {

    const reports = await Report.find()
      .populate("caseId", "caseId title")
      .populate("generatedBy", "username firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ reports });

  } catch (error) {

    console.error("Get reports error:", error);

    res.status(500).json({
      message: "Server error fetching reports"
    });

  }

});



/*
=========================================
GET SINGLE REPORT
=========================================
*/
router.get("/:id", auth, async (req, res) => {

  try {

    const report = await Report.findById(req.params.id)
      .populate("caseId")
      .populate("generatedBy", "username firstName lastName");

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.json({ report });

  } catch (error) {

    console.error("Get report error:", error);

    res.status(500).json({
      message: "Server error fetching report"
    });

  }

});



/*
=========================================
CREATE MANUAL REPORT
=========================================
*/
router.post(
  "/",
  auth,
  validate(reportSchema),
  auditLogger("report_created", "report"),
  async (req, res) => {

    try {

      const { caseId, title, content } = req.body;

      const caseData = await Case.findById(caseId);

      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      const crypto = require("crypto");

      const reportId =
        `REP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      const report = new Report({

        reportId,
        caseId,
        title,
        content: content || "",
        generatedBy: req.userId,
        aiGenerated: false,
        status: "draft"

      });

      await report.save();

      res.status(201).json({
        message: "Report created successfully",
        report
      });

    } catch (error) {

      console.error("Create report error:", error);

      res.status(500).json({
        message: "Server error creating report"
      });

    }

  }
);



/*
=========================================
GENERATE AI REPORT
=========================================
*/
router.post(
  "/generate-ai",
  auth,
  auditLogger("report_generated", "report"),
  async (req, res) => {

    try {

      const { caseId, title } = req.body;

      if (!caseId) {
        return res.status(400).json({
          message: "Case ID is required"
        });
      }

      const caseData =
        await Case.findById(caseId).populate("investigator");

      if (!caseData) {
        return res.status(404).json({
          message: "Case not found"
        });
      }

      const reportTitle = title || `AI Report - ${caseData.title}`;

      const evidence =
        await Evidence.find({ caseId: caseData._id });

      const crypto = require("crypto");

      const reportId =
        `REP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;



      /*
      CREATE REPORT
      */
      const report = new Report({
        reportId,
        caseId: caseData._id,
        title: reportTitle,
        content: {},
        status: "processing",
        generatedBy: req.userId,
        aiGenerated: true
      });

      await report.save();



      /*
      GENERATE AI REPORT
      */
      const aiResult =
        await generateAIReport(caseData, evidence);



      /*
      SAVE CONTENT AS STRING
      */
      report.content = aiResult.content;

      report.status = "completed";

      report.metadata = {

        processingTime: aiResult.processingTime,
        wordCount: aiResult.wordCount

      };

      await report.save();



      res.status(201).json({

        message: "AI report generated successfully",
        report

      });

    } catch (error) {

      console.error("Generate AI report error:", error);

      res.status(500).json({
        message: "Server error generating report"
      });

    }

  }
);



/*
=========================================
DOWNLOAD PDF
=========================================
*/
router.get("/:id/download", auth, async (req, res) => {

  try {

    const report =
      await Report.findById(req.params.id)
        .populate("caseId")
        .populate("generatedBy");

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    const pdfBuffer =
      await generatePDF(report);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.reportId}.pdf"`
    );

    res.send(pdfBuffer);

  } catch (error) {

    console.error("Download report error:", error);

    res.status(500).json({
      message: "Server error downloading report"
    });

  }

});



/*
=========================================
EXPORT DOCX
=========================================
*/
router.get("/:id/export/docx", auth, async (req, res) => {

  try {

    const report =
      await Report.findById(req.params.id)
        .populate("caseId")
        .populate("generatedBy");

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    const docxBuffer =
      await generateDOCX(report);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.reportId}.docx"`
    );

    res.send(docxBuffer);

  } catch (error) {

    console.error("DOCX export error:", error);

    res.status(500).json({
      message: "DOCX export failed"
    });

  }

});



module.exports = router;