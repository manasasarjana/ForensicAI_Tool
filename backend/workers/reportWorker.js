const { Worker } = require('bullmq');
const { connection } = require('../config/queue');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { generateAIReport } = require('../services/aiService');

const reportWorker = new Worker('ReportGeneration', async job => {
  const { reportIdDb, caseData, evidence } = job.data;
  
  try {
    console.log(`Starting AI processing for Report ${reportIdDb}`);
    
    // Generate AI report
    const aiResult = await generateAIReport(caseData, evidence);
    
    // Update report
    const report = await Report.findById(reportIdDb);
    if (!report) throw new Error("Report not found in DB.");
    
    report.content = aiResult.content;
    report.status = 'completed';
    report.metadata = {
      processingTime: aiResult.processingTime,
      wordCount: aiResult.wordCount
    };
    
    await report.save();
    
    // Create notification
    await Notification.create({
      userId: report.generatedBy,
      title: 'AI Analysis Complete',
      message: `Your AI forensic report for case ${caseData.caseId} has been generated successfully.`,
      type: 'success',
      actionUrl: `/reports/${report._id}`
    });
    
    return { success: true };
    
  } catch (error) {
    console.error(`❌ AI generation error for job ${job.id}:`, error.stack || error);
    
    const report = await Report.findById(reportIdDb);
    if (report) {
      report.status = 'draft';
      report.metadata = { 
        error: error.message,
        failedAt: new Date()
      };
      await report.save();
      
      await Notification.create({
        userId: report.generatedBy,
        title: 'Report Generation Failed',
        message: `Failed to generate report for ${caseData.caseId}. Error: ${error.message}. Please try again or contact support if the issue persists.`,
        type: 'error',
        actionUrl: `/reports/${report._id}`
      });
    }
    
    throw error;
  }
}, { connection });

// Handle worker events
reportWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

reportWorker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = reportWorker;
