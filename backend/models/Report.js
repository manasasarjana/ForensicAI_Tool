const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true
    },

    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "processing", "completed", "finalized"],
      default: "draft"
    },

    version: {
      type: Number,
      default: 1
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    finalizedAt: Date,



    /*
    ===============================
    REPORT CONTENT (MAIN FIX)
    ===============================
    */

    content: {

      executiveSummary: {
        type: String,
        default: ""
      },

      incidentOverview: {
        type: String,
        default: ""
      },

      evidenceSummary: {
        type: String,
        default: ""
      },

      technicalFindings: {
        type: String,
        default: ""
      },

      timeline: {
        type: String,
        default: ""
      },

      conclusion: {
        type: String,
        default: ""
      }

    },



    aiGenerated: {
      type: Boolean,
      default: false
    },

    aiModel: String,

    aiPrompt: String,

    aiResponse: String,



    evidenceReferences: [
      {
        evidenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Evidence"
        },
        relevance: String,
        findings: String
      }
    ],



    revisionHistory: [
      {
        version: Number,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        editedAt: Date,
        changes: String,
        previousContent: Object
      }
    ],



    digitalSignature: {
      signed: {
        type: Boolean,
        default: false
      },

      signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      signedAt: Date,

      signature: String
    },



    exports: [
      {
        format: {
          type: String,
          enum: ["pdf", "docx", "html"]
        },

        exportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        exportedAt: Date,

        filePath: String
      }
    ],



    metadata: {
      wordCount: Number,
      pageCount: Number,
      processingTime: Number,
      customFields: Map
    }

  },
  {
    timestamps: true
  }
);



/*
==============================
INDEXES
==============================
*/

reportSchema.index({ reportId: 1 });
reportSchema.index({ caseId: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });



/*
==============================
GENERATE REPORT ID
==============================
*/

reportSchema.pre("save", async function (next) {

  if (!this.reportId) {

    const year = new Date().getFullYear();

    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });

    this.reportId = `RPT-${year}-${String(count + 1).padStart(4, "0")}`;

  }

  next();

});



module.exports = mongoose.model("Report", reportSchema);