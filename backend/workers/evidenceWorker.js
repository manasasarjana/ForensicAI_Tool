const { Worker } = require('bullmq');
const { connection } = require('../config/queue');
const Evidence = require('../models/Evidence');
const Notification = require('../models/Notification');
const { generateFileHash } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const evidenceWorker = new Worker('EvidenceVerification', async job => {
  const { evidenceIdDb, filePath } = job.data;
  
  try {
    console.log(`Starting hash processing for Evidence ${evidenceIdDb}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Generate hashes
    const hashes = await generateFileHash(filePath);
    
    // Update evidence record
    const evidence = await Evidence.findById(evidenceIdDb).populate('caseId');
    if (!evidence) throw new Error("Evidence record not found in DB.");
    
    evidence.sha256Hash = hashes.sha256;
    evidence.md5Hash = hashes.md5;
    evidence.status = 'completed';
    
    // Add processing completion to chain of custody
    evidence.chainOfCustody.push({
      action: 'verified', // Using verified as the closest action for hash completion
      performedBy: evidence.uploadedBy,
      timestamp: new Date(),
      notes: 'Background hash generation completed successfully'
    });
    
    await evidence.save();
    
    // Create notification for the user
    await Notification.create({
      userId: evidence.uploadedBy,
      title: 'Evidence Processed',
      message: `Forensic hashing for "${evidence.originalName}" is complete and integrity is verified.`,
      type: 'success',
      actionUrl: `/cases/${evidence.caseId._id}`
    });
    
    console.log(`Successfully processed hashes for Evidence ${evidenceIdDb}`);
    return { success: true, hashes };
    
  } catch (error) {
    console.error(`Evidence processing error for job ${job.id}:`, error);
    
    const evidence = await Evidence.findById(evidenceIdDb);
    if (evidence) {
      evidence.status = 'error';
      await evidence.save();
      
      await Notification.create({
        userId: evidence.uploadedBy,
        title: 'Evidence Processing Failed',
        message: `Failed to process forensic hashes for ${evidence.originalName}: ${error.message}`,
        type: 'error'
      });
    }
    
    throw error;
  }
}, { connection });

// Handle worker events
evidenceWorker.on('completed', job => {
  console.log(`Evidence job ${job.id} has completed!`);
});

evidenceWorker.on('failed', (job, err) => {
  console.log(`Evidence job ${job.id} has failed with ${err.message}`);
});

module.exports = evidenceWorker;
