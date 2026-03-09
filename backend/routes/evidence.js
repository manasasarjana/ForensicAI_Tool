const express = require('express');
const fs = require('fs');
const path = require('path');
const Evidence = require('../models/Evidence');
const Case = require('../models/Case');
const { auth, auditLogger } = require('../middleware/auth');
const { upload, generateHashes, handleUploadError, generateFileHash } = require('../middleware/upload');
const { validate, evidenceSchema } = require('../middleware/validation');

const router = express.Router();

// Upload evidence files
router.post('/upload',
  auth,
  upload.array('evidence', 10),
  handleUploadError,
  generateHashes,
  validate(evidenceSchema),
  auditLogger('evidence_uploaded', 'evidence'),
  async (req, res) => {
    try {
      console.log('Evidence upload request body:', req.body);
      console.log('Uploaded files:', req.files && req.files.map(f => f.originalname));
      
      const { caseId, description, tags } = req.body;
      
      // Verify case exists
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const evidenceRecords = [];
      
      const crypto = require('crypto');
      for (const file of req.files) {
        // manually generate evidenceId to avoid missing hook issue
        const timestamp = Date.now();
        const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
        const evidenceId = `EVD-${timestamp}-${randomSuffix}`;

        const evidence = new Evidence({
          evidenceId,
          caseId: caseData._id,
          fileName: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          sha256Hash: file.sha256Hash,
          md5Hash: file.md5Hash,
          uploadedBy: req.userId,
          description: description || '',
          tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
          chainOfCustody: [{
            action: 'uploaded',
            performedBy: req.userId,
            timestamp: new Date(),
            ipAddress: req.ip || req.connection.remoteAddress,
            notes: 'Initial evidence upload'
          }]
        });
        
        await evidence.save();
        await evidence.populate('uploadedBy', 'username firstName lastName');
        evidenceRecords.push(evidence);
      }
      
      res.status(201).json({
        message: `${evidenceRecords.length} evidence file(s) uploaded successfully`,
        evidence: evidenceRecords
      });
      
    } catch (error) {
      console.error('Evidence upload error:', error.stack || error);
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      // send error message for debugging (development only)
      res.status(500).json({ message: 'Server error uploading evidence', error: error.message });
    }
  }
);

// Get evidence for a case
router.get('/case/:caseId',
  auth,
  async (req, res) => {
    try {
      const { caseId } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      // Verify case exists
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      };
      
      const evidence = await Evidence.find({ caseId })
        .populate('uploadedBy', 'username firstName lastName')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);
      
      const total = await Evidence.countDocuments({ caseId });
      
      res.json({
        evidence,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      });
      
    } catch (error) {
      console.error('Get evidence error:', error);
      res.status(500).json({ message: 'Server error fetching evidence' });
    }
  }
);

// Get single evidence item
router.get('/:id',
  auth,
  auditLogger('evidence_accessed', 'evidence'),
  async (req, res) => {
    try {
      const evidence = await Evidence.findById(req.params.id)
        .populate('uploadedBy', 'username firstName lastName')
        .populate('caseId', 'caseId title investigator')
        .populate('chainOfCustody.performedBy', 'username firstName lastName');
      
      if (!evidence) {
        return res.status(404).json({ message: 'Evidence not found' });
      }
      
      // Add access to chain of custody
      evidence.chainOfCustody.push({
        action: 'accessed',
        performedBy: req.userId,
        timestamp: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        notes: 'Evidence details viewed'
      });
      
      await evidence.save();
      
      res.json({ evidence });
      
    } catch (error) {
      console.error('Get evidence error:', error);
      res.status(500).json({ message: 'Server error fetching evidence' });
    }
  }
);

// download evidence file (inline or attachment)
router.get('/:id/download',
  auth,
  async (req, res) => {
    try {
      const evidence = await Evidence.findById(req.params.id);
      if (!evidence) {
        return res.status(404).json({ message: 'Evidence not found' });
      }
      const filePath = evidence.filePath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }
      const inline = req.query.inline === 'true';
      if (inline) {
        res.setHeader('Content-Disposition', `inline; filename="${evidence.originalName}"`);
        res.sendFile(path.resolve(filePath));
      } else {
        res.download(filePath, evidence.originalName);
      }
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Server error downloading file' });
    }
  }
);

module.exports = router;