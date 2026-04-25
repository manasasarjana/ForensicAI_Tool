const express = require("express");
const Report = require("../models/Report");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");

const { auth, auditLogger } = require("../middleware/auth");
const { validate, reportSchema } = require("../middleware/validation");

const { generateAIReport } = require("../services/aiService");
const { generatePDF, generateDOCX } = require("../services/exportService");
const { reportQueue } = require("../config/queue");

const router = express.Router();

/**
 * @route GET /api/reports
 * @desc Get all reports
 * @access Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const query = {};
    // If not admin, only show own reports
    if (req.user.role !== 'admin') {
      query.generatedBy = req.userId;
    }

    const reports = await Report.find(query)
      .populate("caseId", "caseId title")
      .populate("generatedBy", "username firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Server error fetching reports" });
  }
});

/**
 * @route GET /api/reports/:id
 * @desc Get single report details
 * @access Private
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("caseId")
      .populate("generatedBy", "username firstName lastName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Tenant Isolation: Verify investigator ownership
    const ownerId = report.generatedBy._id ? report.generatedBy._id.toString() : report.generatedBy.toString();
    if (req.user.role !== 'admin' && ownerId !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this report.' });
    }

    res.json({ report });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: "Server error fetching report" });
  }
});

/**
 * @route POST /api/reports
 * @desc Create a manual forensic report
 * @access Private
 */
router.post("/", auth, validate(reportSchema), auditLogger("report_created", "report"), async (req, res) => {
  try {
    const { caseId, title, content } = req.body;
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Tenant Isolation: Verify investigator ownership of the case
    if (req.user.role !== 'admin' && caseData.investigator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to create a report for this case.' });
    }

    const crypto = require("crypto");
    const reportId = `REP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

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
    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Server error creating report" });
  }
});

/**
 * @route POST /api/reports/generate-ai
 * @desc Generate an AI-powered forensic analysis report
 * @access Private
 */
router.post("/generate-ai", auth, auditLogger("report_generated", "report"), async (req, res) => {
  try {
    const { caseId, title } = req.body;

    if (!caseId) {
      return res.status(400).json({ message: "Case ID is required" });
    }

    const caseData = await Case.findById(caseId).populate("investigator");
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Tenant Isolation: Verify investigator ownership of the case
    if (req.user.role !== 'admin' && caseData.investigator._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to generate AI reports for this case.' });
    }

    const reportTitle = title || `AI Report - ${caseData.title}`;
    const evidence = await Evidence.find({ caseId: caseData._id });

    const crypto = require("crypto");
    const reportId = `REP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

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
    START BACKGROUND JOB via BullMQ
    */
    await reportQueue.add('generateAIReport', {
      reportIdDb: report._id,
      caseData: caseData,
      evidence: evidence
    }, {
      removeOnComplete: true,
      removeOnFail: false
    });

    res.status(201).json({
      message: "AI report generation added to processing queue.",
      report
    });

  } catch (error) {
    console.error("Generate AI report error:", error);
    res.status(500).json({ message: "Server error generating report" });
  }
});

/**
 * @route GET /api/reports/:id/download
 * @desc Download report as PDF
 * @access Private
 */
router.get("/:id/download", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("caseId").populate("generatedBy");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Tenant Isolation: Verify investigator ownership
    const ownerId = report.generatedBy._id ? report.generatedBy._id.toString() : report.generatedBy.toString();
    if (req.user.role !== 'admin' && ownerId !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to download this report.' });
    }

    const pdfBuffer = await generatePDF(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${report.reportId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download report error:", error);
    res.status(500).json({ message: "Server error downloading report" });
  }
});

/**
 * @route GET /api/reports/:id/export/docx
 * @desc Export report as DOCX
 * @access Private
 */
router.get("/:id/export/docx", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("caseId").populate("generatedBy");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Tenant Isolation: Verify investigator ownership
    const ownerId = report.generatedBy._id ? report.generatedBy._id.toString() : report.generatedBy.toString();
    if (req.user.role !== 'admin' && ownerId !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to export this report.' });
    }

    const docxBuffer = await generateDOCX(report);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${report.reportId}.docx"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error("Export DOCX error:", error);
    res.status(500).json({ message: "Server error exporting DOCX" });
  }
});

/**
 * @route DELETE /api/reports/:id
 * @desc Delete report (Admin Only)
 * @access Private/Admin
 */
router.delete('/:id', auth, auditLogger('report_deleted', 'report'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('caseId');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Tenant Isolation: Verify investigator ownership or admin role
    const creatorId = report.generatedBy._id ? report.generatedBy._id.toString() : report.generatedBy.toString();
    const isOwner = creatorId === req.userId.toString();
    
    // Check if user is the investigator of the parent case
    const isCaseInvestigator = report.caseId && report.caseId.investigator && report.caseId.investigator.toString() === req.userId.toString();

    if (req.user.role !== 'admin' && !isOwner && !isCaseInvestigator) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to delete this report.' });
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
});

module.exports = router;