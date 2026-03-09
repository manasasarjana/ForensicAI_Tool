/*const axios = require('axios');

// AI Service for generating forensic reports using HuggingFace API
class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.apiUrl =  `https://api-inference.huggingface.co/models/Mistralai/Mistral-7B-Instruct_v0.1`;
    this.model =   'mistralai/Mistral-7B-Instruct-v0.1';
  }

  // Generate structured forensic report
  async generateReport(caseData, evidence) {
    const startTime = Date.now();
    
    try {
      // Create structured prompt for forensic report
      const prompt = this.createForensicPrompt(caseData, evidence);
      
      // Call AI API (using HuggingFace as example, can be replaced with LLaMA 2)
      const aiResponse = await this.callAI(prompt);
      
      // Parse and structure the AI response
      const structuredContent = this.parseAIResponse(aiResponse);
      
      const processingTime = Date.now() - startTime;
      const wordCount = this.countWords(JSON.stringify(structuredContent));
      
      return {
        content: structuredContent,
        model: this.model,
        prompt,
        response: aiResponse,
        processingTime,
        wordCount
      };
      
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI report generation failed: ${error.message}`);
    }
  }

  // Create forensic-specific prompt
  createForensicPrompt(caseData, evidence) {
    const evidenceSummary = evidence.map(e => ({
      id: e.evidenceId,
      name: e.originalName,
      type: e.fileType,
      size: e.fileSize,
      hash: e.sha256Hash,
      uploadedBy: e.uploadedBy.username,
      description: e.description
    }));

    return `You are a certified digital forensic analyst generating a professional forensic incident report.

CASE INFORMATION:
- Case ID: ${caseData.caseId}
- Title: ${caseData.title}
- Incident Date: ${caseData.incidentDate.toDateString()}
- Location: ${caseData.location || 'Not specified'}
- Priority: ${caseData.priority}
- Investigator: ${caseData.investigator.firstName} ${caseData.investigator.lastName}
- Description: ${caseData.description || 'No description provided'}

EVIDENCE SUMMARY:
${evidenceSummary.map(e => `- ${e.name} (${e.type}, ${e.size} bytes, Hash: ${e.hash.substring(0, 16)}...)`).join('\n')}

INSTRUCTIONS:
Generate a comprehensive forensic report with the following sections. Be professional, objective, and evidence-based. Do not make assumptions beyond what the evidence supports.

Required sections:
1. EXECUTIVE_SUMMARY: Brief overview of the incident and key findings
2. INCIDENT_OVERVIEW: Detailed description of the incident circumstances
3. EVIDENCE_SUMMARY: Catalog of all digital evidence collected
4. TECHNICAL_FINDINGS: Technical analysis of the evidence
5. TIMELINE: Chronological sequence of events based on evidence
6. CONCLUSION: Summary of findings and their significance

Format your response as structured sections that can be parsed. Use clear, professional language appropriate for legal proceedings.`;
  }

  // Call AI API (mock implementation - replace with actual AI service)
  async callAI(prompt) {
    // Mock AI response for development - replace with actual AI API call
    if (!this.apiKey) {
      return this.generateMockResponse(prompt);
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_length: 2000,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.generated_text || response.data[0]?.generated_text || 'No response generated';
    } catch (error) {
      console.error('AI API call failed:', error);
      // Fallback to mock response
      return this.generateMockResponse(prompt);
    }
  }

  // Generate mock AI response for development/testing
  generateMockResponse(prompt) {
    return `EXECUTIVE_SUMMARY:
This forensic investigation examined digital evidence related to the reported incident. The analysis focused on maintaining chain of custody and ensuring data integrity throughout the examination process. Key findings indicate the presence of relevant digital artifacts that support the investigation timeline.

INCIDENT_OVERVIEW:
The incident under investigation occurred on the specified date and involved digital evidence collection and analysis. The investigation was conducted following standard forensic procedures to ensure admissibility and reliability of findings. All evidence was properly documented and secured using industry-standard practices.

EVIDENCE_SUMMARY:
Digital evidence was collected and cataloged according to forensic best practices. Each piece of evidence was assigned a unique identifier and secured with cryptographic hashing to ensure integrity. The evidence includes various file types and digital artifacts relevant to the investigation.

TECHNICAL_FINDINGS:
Technical analysis of the collected evidence revealed digital artifacts consistent with the reported incident timeline. File system analysis, metadata examination, and hash verification were performed to establish authenticity and integrity. All technical procedures followed established forensic methodologies.

TIMELINE:
Based on the available digital evidence and metadata analysis, a timeline of events has been reconstructed. The timeline reflects only those events that can be substantiated by digital evidence and does not include speculative elements.

CONCLUSION:
The forensic examination has been completed according to established procedures. All evidence has been properly documented, analyzed, and secured. The findings are based solely on the digital evidence examined and follow accepted forensic practices. Further analysis may be warranted based on additional evidence or investigative requirements.`;
  }

  // Parse AI response into structured content
  parseAIResponse(aiResponse) {
    const sections = {
      executiveSummary: '',
      incidentOverview: '',
      evidenceSummary: '',
      technicalFindings: '',
      timeline: '',
      conclusion: ''
    };

    try {
      // Split response by section headers
      const sectionRegex = /(EXECUTIVE_SUMMARY|INCIDENT_OVERVIEW|EVIDENCE_SUMMARY|TECHNICAL_FINDINGS|TIMELINE|CONCLUSION):\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/g;
      
      let match;
      while ((match = sectionRegex.exec(aiResponse)) !== null) {
        const sectionName = match[1].toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const sectionContent = match[2].trim();
        
        if (sections.hasOwnProperty(sectionName)) {
          sections[sectionName] = sectionContent;
        }
      }

      // If parsing fails, put entire response in executive summary
      if (!sections.executiveSummary && !sections.conclusion) {
        sections.executiveSummary = aiResponse.substring(0, 500) + '...';
        sections.conclusion = 'AI-generated report content requires manual review and editing.';
      }

    } catch (error) {
      console.error('Error parsing AI response:', error);
      sections.executiveSummary = 'Error parsing AI response. Manual review required.';
      sections.conclusion = 'Report generation encountered parsing errors. Please review and edit manually.';
    }

    return sections;
  }

  // Count words in text
  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Validate AI response quality
  validateResponse(content) {
    const requiredSections = ['executiveSummary', 'conclusion'];
    const minWordCount = 50;
    
    for (const section of requiredSections) {
      if (!content[section] || this.countWords(content[section]) < minWordCount) {
        return false;
      }
    }
    
    return true;
  }
}

// Export function for generating AI reports
const generateAIReport = async (caseData, evidence) => {
  const aiService = new AIService();
  return await aiService.generateReport(caseData, evidence);
};

module.exports = {
  AIService,
  generateAIReport
};*/
/*const axios = require('axios');
const { HfInference } = require("@huggingface/inference");

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "HuggingFaceH4/zephyr-7b-beta";
    this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}`;
  }

  async generateReport(caseData, evidence) {
    const startTime = Date.now();

    try {
      const prompt = this.createForensicPrompt(caseData, evidence);
      const aiResponse = await this.callAI(prompt);
      const structuredContent = this.parseAIResponse(aiResponse);

      const processingTime = Date.now() - startTime;
      const wordCount = this.countWords(aiResponse);

      return {
        content: structuredContent,
        model: this.model,
        prompt,
        response: aiResponse,
        processingTime,
        wordCount
      };

    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI report generation failed: ${error.message}`);
    }
  }

  createForensicPrompt(caseData, evidence) {
    const evidenceSummary = evidence.map(e => `
- Evidence ID: ${e.evidenceId}
- File: ${e.originalName}
- Type: ${e.fileType}
- Size: ${e.fileSize} bytes
- Hash: ${e.sha256Hash}
- Uploaded By: ${e.uploadedBy?.username}
- Description: ${e.description || 'N/A'}
`).join('\n');

    return `
You are a certified digital forensic analyst.

Generate a professional forensic investigation report with these sections:

EXECUTIVE_SUMMARY:
INCIDENT_OVERVIEW:
EVIDENCE_SUMMARY:
TECHNICAL_FINDINGS:
TIMELINE:
CONCLUSION:

CASE DETAILS:
Case ID: ${caseData.caseId}
Title: ${caseData.title}
Incident Date: ${caseData.incidentDate?.toDateString()}
Location: ${caseData.location}
Priority: ${caseData.priority}
Investigator: ${caseData.investigator?.firstName} ${caseData.investigator?.lastName}
Description: ${caseData.description}

EVIDENCE:
${evidenceSummary}

Be objective, professional, and suitable for court documentation.
`;
  }

  /*async callAI(prompt) {
    if (!this.apiKey) {
      return this.generateMockResponse();
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1200,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (Array.isArray(response.data)) {
        return response.data[0]?.generated_text || '';
      }

      return response.data.generated_text || '';

    } catch (error) {
      console.error('HuggingFace API error:', error.response?.data || error.message);
      return this.generateMockResponse();
    }
  }*/

/* async callAI(prompt) {
   if (!this.apiKey) {
     return this.generateMockResponse();
   }

   try {
     const hf = new HfInference(this.apiKey);

     const result = await hf.textGeneration({
       model: "HuggingFaceH4/zephyr-7b-beta",
       inputs: prompt,
       parameters: {
         max_new_tokens: 800,
         temperature: 0.7,
       }
     });

     return result.generated_text || this.generateMockResponse();

   } catch (error) {
     console.error("HuggingFace SDK error:", error.message);
     return this.generateMockResponse();
   }
 }

 parseAIResponse(text) {
   const sections = {
     executiveSummary: '',
     incidentOverview: '',
     evidenceSummary: '',
     technicalFindings: '',
     timeline: '',
     conclusion: ''
   };

   const regex = /(EXECUTIVE_SUMMARY|INCIDENT_OVERVIEW|EVIDENCE_SUMMARY|TECHNICAL_FINDINGS|TIMELINE|CONCLUSION):([\s\S]*?)(?=\n[A-Z_]+:|$)/g;

   let match;
   while ((match = regex.exec(text)) !== null) {
     const key = match[1].toLowerCase().replace(/_([a-z])/g, (_, l) => l.toUpperCase());
     sections[key] = match[2].trim();
   }

   if (!sections.executiveSummary) {
     sections.executiveSummary = text.substring(0, 800);
   }

   return sections;
 }

 generateMockResponse() {
   return `
EXECUTIVE_SUMMARY:
This report summarizes findings based on available digital evidence.

INCIDENT_OVERVIEW:
The case involves digital forensic analysis conducted under standard procedures.

EVIDENCE_SUMMARY:
All evidence items were cataloged and hashed to preserve integrity.

TECHNICAL_FINDINGS:
Digital artifacts support the documented timeline.

TIMELINE:
Events reconstructed using metadata and logs.

CONCLUSION:
Findings are based solely on verifiable digital evidence.
`;
 }

 countWords(text) {
   return text.split(/\s+/).filter(w => w.length > 0).length;
 }
}

const generateAIReport = async (caseData, evidence) => {
 const service = new AIService();
 return await service.generateReport(caseData, evidence);
};

module.exports = {
 AIService,
 generateAIReport
};*/
/*const { HfInference } = require("@huggingface/inference");

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "HuggingFaceH4/zephyr-7b-beta";
    this.hf = this.apiKey ? new HfInference(this.apiKey) : null;
  }

  async generateReport(caseData, evidence) {
    const startTime = Date.now();

    try {
      const prompt = this.createForensicPrompt(caseData, evidence);

      const aiResponse = await this.callAI(prompt);

      const structuredContent = this.parseAIResponse(aiResponse);

      const processingTime = Date.now() - startTime;

      return {
        content: structuredContent,
        model: this.model,
        prompt,
        response: aiResponse,
        processingTime,
        wordCount: this.countWords(aiResponse)
      };

    } catch (error) {
      console.error("AI service error:", error);
      throw new Error("AI report generation failed");
    }
  }

  createForensicPrompt(caseData, evidence) {
    const evidenceSummary = evidence.map(e => `
- Evidence ID: ${e.evidenceId}
- File Name: ${e.originalName}
- File Type: ${e.fileType}
- File Size: ${e.fileSize} bytes
- Hash: ${e.sha256Hash}
- Uploaded By: ${e.uploadedBy?.username}
- Description: ${e.description || "N/A"}
`).join("\n");

    return `
You are a certified digital forensic investigator.

Generate a professional forensic investigation report with the following sections:

EXECUTIVE_SUMMARY:
INCIDENT_OVERVIEW:
EVIDENCE_SUMMARY:
TECHNICAL_FINDINGS:
TIMELINE:
CONCLUSION:

CASE DETAILS:
Case ID: ${caseData.caseId}
Title: ${caseData.title}
Incident Date: ${caseData.incidentDate?.toDateString()}
Location: ${caseData.location}
Priority: ${caseData.priority}
Investigator: ${caseData.investigator?.firstName} ${caseData.investigator?.lastName}
Description: ${caseData.description}

EVIDENCE:
${evidenceSummary}

Only use the provided information. Do not assume missing facts.
Use formal, objective language suitable for court documentation.
`;
  }

  async callAI(prompt) {
    if (!this.hf) {
      return this.generateMockResponse();
    }

    try {
      const result = await this.hf.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 900,
          temperature: 0.7
        }
      });

      return result.generated_text || this.generateMockResponse();

    } catch (error) {
      console.error("HuggingFace SDK error:", error.message);
      return this.generateMockResponse();
    }
  }

  parseAIResponse(text) {
    const sections = {
      executiveSummary: "",
      incidentOverview: "",
      evidenceSummary: "",
      technicalFindings: "",
      timeline: "",
      conclusion: ""
    };

    const regex = /(EXECUTIVE_SUMMARY|INCIDENT_OVERVIEW|EVIDENCE_SUMMARY|TECHNICAL_FINDINGS|TIMELINE|CONCLUSION):([\s\S]*?)(?=\n[A-Z_]+:|$)/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const key = match[1]
        .toLowerCase()
        .replace(/_([a-z])/g, (_, l) => l.toUpperCase());

      sections[key] = match[2].trim();
    }

    if (!sections.executiveSummary) {
      sections.executiveSummary = text.substring(0, 800);
    }

    return sections;
  }

  generateMockResponse() {
    return `
EXECUTIVE_SUMMARY:
This forensic report summarizes findings based on the provided case information and digital evidence.

INCIDENT_OVERVIEW:
The investigation was conducted following standard digital forensic methodologies ensuring integrity and admissibility.

EVIDENCE_SUMMARY:
All evidence items were cataloged and verified using cryptographic hash validation.

TECHNICAL_FINDINGS:
Digital artifacts align with the reconstructed timeline and support the documented findings.

TIMELINE:
Events were reconstructed using metadata, file system analysis, and evidence logs.

CONCLUSION:
The findings are based solely on verified digital evidence. Further review may be conducted if additional data becomes available.
`;
  }

  countWords(text) {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }
}

const generateAIReport = async (caseData, evidence) => {
  const service = new AIService();
  return await service.generateReport(caseData, evidence);
};

module.exports = {
  AIService,
  generateAIReport
};*/
/*const { HfInference } = require("@huggingface/inference");

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "distilgpt2";
    this.hf = this.apiKey ? new HfInference(this.apiKey) : null;
  }

  async generateReport(caseData, evidence) {
    const startTime = Date.now();

    try {
      const prompt = this.createPrompt(caseData, evidence);

      const aiResponse = await this.callAI(prompt);

      const structuredContent = this.parseResponse(aiResponse);

      return {
        content: structuredContent,
        model: this.model,
        prompt,
        response: aiResponse,
        processingTime: Date.now() - startTime,
        wordCount: this.countWords(aiResponse)
      };

    } catch (error) {
      console.error("AI service error:", error);
      throw new Error("AI report generation failed");
    }
  }

  createPrompt(caseData, evidence) {

    const evidenceSummary = evidence.map(e => `
Evidence:
- File: ${e.originalName}
- Type: ${e.fileType}
- Size: ${e.fileSize}
- Hash: ${e.sha256Hash}
- Uploaded By: ${e.uploadedBy?.username || "Unknown"}
- Description: ${e.description || "N/A"}
`).join("\n");

    return `
You are a digital forensic investigator.

Generate a professional forensic report.

Return the report EXACTLY using these sections:

EXECUTIVE_SUMMARY:
INCIDENT_OVERVIEW:
EVIDENCE_SUMMARY:
TECHNICAL_FINDINGS:
TIMELINE:
CONCLUSION:

Case Information
Case ID: ${caseData.caseId}
Title: ${caseData.title}
Incident Date: ${caseData.incidentDate?.toDateString()}
Location: ${caseData.location}
Description: ${caseData.description}

Evidence Details:
${evidenceSummary}

Write formally like an official forensic report.
`;
  }

  async callAI(prompt) {

    if (!this.hf) {
      return this.mockResponse();
    }

    try {

      const result = await this.hf.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 700,
          temperature: 0.6,
          top_p: 0.9
        }
      });

      return result.generated_text || this.mockResponse();

    } catch (error) {

      console.error("HuggingFace SDK error:", error.message);

      return this.mockResponse();
    }
  }

  parseResponse(text) {

    const sections = {
      executiveSummary: "",
      incidentOverview: "",
      evidenceSummary: "",
      technicalFindings: "",
      timeline: "",
      conclusion: ""
    };

    const regex =
      /(EXECUTIVE_SUMMARY|INCIDENT_OVERVIEW|EVIDENCE_SUMMARY|TECHNICAL_FINDINGS|TIMELINE|CONCLUSION):([\s\S]*?)(?=\n[A-Z_]+:|$)/g;

    let match;

    while ((match = regex.exec(text)) !== null) {

      const key = match[1]
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      sections[key] = match[2].trim();
    }

    return sections;
  }

  mockResponse() {

    return `
EXECUTIVE_SUMMARY:
This forensic report summarizes the investigation conducted on the specified case. Digital evidence was collected and analyzed following forensic standards.

INCIDENT_OVERVIEW:
The incident involved digital artifacts related to the reported case. Investigators documented evidence and performed analysis.

EVIDENCE_SUMMARY:
All uploaded digital evidence including files, metadata, and hashes were cataloged and verified.

TECHNICAL_FINDINGS:
Technical examination of the evidence revealed artifacts consistent with the investigation timeline.

TIMELINE:
Events were reconstructed using timestamps and metadata extracted from the digital evidence.

CONCLUSION:
The analysis supports the documented findings. All evidence was handled according to digital forensic best practices.
`;
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}

const generateAIReport = async (caseData, evidence) => {
  const service = new AIService();
  return await service.generateReport(caseData, evidence);
};

module.exports = {
  AIService,
  generateAIReport
};*/
/*const axios = require("axios");

class AIService {

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "openai-community/gpt2";
  }

  async generateReport(caseData, evidence) {

    const startTime = Date.now();

    try {

      const prompt = this.createPrompt(caseData, evidence);

      const aiResponse = await this.callAI(prompt);

      const structuredContent = this.parseResponse(aiResponse);

      return {
        content: structuredContent,
        model: this.model,
        prompt,
        response: aiResponse,
        processingTime: Date.now() - startTime,
        wordCount: this.countWords(aiResponse)
      };

    } catch (error) {

      console.error("AI service error:", error);

      const mock = this.mockResponse();

      return {
        content: this.parseResponse(mock),
        model: "mock",
        response: mock,
        processingTime: 0,
        wordCount: this.countWords(mock)
      };
    }
  }

  createPrompt(caseData, evidence) {

    const evidenceSummary = evidence.map(e => `
Evidence File: ${e.originalName}
Type: ${e.fileType}
Size: ${e.fileSize}
Hash: ${e.sha256Hash}
Description: ${e.description || "N/A"}
`).join("\n");

    return `
Generate a DIGITAL FORENSIC REPORT.

Use these sections exactly:

EXECUTIVE_SUMMARY:
INCIDENT_OVERVIEW:
EVIDENCE_SUMMARY:
TECHNICAL_FINDINGS:
TIMELINE:
CONCLUSION:

Case ID: ${caseData.caseId}
Title: ${caseData.title}
Incident Date: ${caseData.incidentDate}
Location: ${caseData.location}
Description: ${caseData.description}

Evidence:
${evidenceSummary}

Write formally like a professional forensic investigation report.
`;
  }

  async callAI(prompt) {

    if (!this.apiKey) {
      console.log("No HuggingFace API key found. Using mock report.");
      return this.mockResponse();
    }

    try {

      const response = await axios.post(
        `https://router.huggingface.co/hf-inference/models/${this.model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.7
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      return response.data?.[0]?.generated_text || this.mockResponse();

    } catch (error) {

      console.error("HuggingFace API error:", error.response?.data || error.message);

      return this.mockResponse();
    }
  }

  parseResponse(text) {

    const sections = {
      executiveSummary: "",
      incidentOverview: "",
      evidenceSummary: "",
      technicalFindings: "",
      timeline: "",
      conclusion: ""
    };

    const regex =
      /(EXECUTIVE_SUMMARY|INCIDENT_OVERVIEW|EVIDENCE_SUMMARY|TECHNICAL_FINDINGS|TIMELINE|CONCLUSION):([\s\S]*?)(?=\n[A-Z_]+:|$)/g;

    let match;

    while ((match = regex.exec(text)) !== null) {

      const key = match[1]
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      sections[key] = match[2].trim();
    }

    return sections;
  }

  mockResponse() {

    return `
EXECUTIVE_SUMMARY:
This report summarizes the digital forensic investigation conducted on the case.

INCIDENT_OVERVIEW:
The investigation involved examination of digital artifacts and collected evidence.

EVIDENCE_SUMMARY:
Evidence files were collected, documented, and verified using hash values.

TECHNICAL_FINDINGS:
Analysis of metadata and digital artifacts was performed to identify relevant activity.

TIMELINE:
Events were reconstructed using timestamps obtained from the digital evidence.

CONCLUSION:
The forensic investigation supports the documented findings and evidence integrity.
`;
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}

const generateAIReport = async (caseData, evidence) => {
  const service = new AIService();
  return await service.generateReport(caseData, evidence);
};

module.exports = {
  AIService,
  generateAIReport
};*/
/*const axios = require("axios");

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = "llama-3.1-8b-instant";
  }

  async generateReport(caseData, evidence) {
    const startTime = Date.now();

    const prompt = `
Generate a professional Digital Forensic Investigation Report.

The report must follow this structure exactly and be written in Markdown.

# 1️⃣ Executive Summary
Explain the investigation findings clearly.

# 2️⃣ Incident Overview
Provide device information and system details.

# 3️⃣ Evidence Summary
Create a table summarizing the evidence collected.

# 4️⃣ Technical Findings
Explain suspicious files, browser history, network logs, registry entries, and email artifacts.

# 5️⃣ Timeline of Events
Provide a chronological table of events.

# 6️⃣ Conclusion
Summarize the investigation findings and provide recommendations.

Case Information:

Case ID: ${caseData.caseId}
Case Title: ${caseData.title}
Incident Date: ${caseData.incidentDate}
Location: ${caseData.location}
Evidence Count: ${evidence.length}

Write the report clearly and professionally.
`;

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: this.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiText = response.data.choices[0].message.content;

      const processingTime = Date.now() - startTime;

      return {
        content: aiText,
        model: this.model,
        response: aiText,
        processingTime,
        wordCount: this.countWords(aiText),
      };
    } catch (error) {
      console.error("Groq API error:", error.response?.data || error.message);

      return {
        content: "AI report generation failed.",
        model: this.model,
        response: "AI generation failed",
      };
    }
  }

  countWords(text) {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }
}

const generateAIReport = async (caseData, evidence) => {
  const service = new AIService();
  return service.generateReport(caseData, evidence);
};

module.exports = {
  AIService,
  generateAIReport,
};*/
/*const Groq = require("groq-sdk");

class AIService {

  constructor() {

    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    this.model = "llama-3.3-70b-versatile";

  }



  async generateReport(caseData, evidence) {

    const startTime = Date.now();

    try {

      const prompt = this.createPrompt(caseData, evidence);

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a certified digital forensic investigator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      });

      const text = completion.choices[0].message.content;

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = this.fallbackReport(caseData, evidence);
      }

      return {

        content: parsed,
        model: this.model,
        processingTime: Date.now() - startTime,
        wordCount: JSON.stringify(parsed).split(/\s+/).length

      };

    } catch (error) {

      console.error("Groq AI error:", error);

      return {

        content: this.fallbackReport(caseData, evidence),
        processingTime: 0,
        wordCount: 0

      };

    }

  }



  createPrompt(caseData, evidence) {

    const evidenceText = evidence.map(e => `
File Name: ${e.originalName}
Type: ${e.fileType}
Size: ${e.fileSize}
Hash: ${e.sha256Hash}
`).join("\n");

    return `
Generate a digital forensic investigation report.

Return ONLY JSON with this structure:

{
"executiveSummary":"",
"incidentOverview":"",
"evidenceSummary":"",
"technicalFindings":"",
"timeline":"",
"conclusion":""
}

Case Information:
Case ID: ${caseData.caseId}
Title: ${caseData.title}
Location: ${caseData.location}
Date: ${caseData.incidentDate}

Evidence:
${evidenceText}

Write professionally like a forensic investigation report.
`;

  }



  fallbackReport(caseData, evidence) {

    return {

      executiveSummary:
        "This report presents the findings from a forensic analysis conducted on a Windows workstation after suspicious activity was detected. During the examination a suspicious executable file was discovered and further investigation revealed abnormal browser activity, network communication with an external server, and registry persistence indicators. These artifacts suggest the possibility of malicious software delivered through phishing and executed on the system.",

      incidentOverview:
        "The investigation was conducted on a Windows workstation connected to the internal corporate network. The system was analyzed after suspicious network communication and file execution activity were detected. The workstation was examined to identify possible unauthorized access, malicious files, and system modifications that could indicate compromise.",

      evidenceSummary:
        "Evidence collected during the forensic examination includes suspicious files discovered on the system, browser history records showing access to unknown websites, network logs indicating communication with external servers, registry artifacts showing persistence mechanisms, and email artifacts containing suspicious attachments.",

      technicalFindings:
        "Technical analysis revealed that a suspicious executable file was downloaded and executed on the system. Browser history showed access to unknown file sharing portals. Network logs confirmed communication with an external IP address using port 8080. Registry artifacts indicated persistence mechanisms configured to execute the malicious file automatically during login.",

      timeline:
        "21:58:02  Suspicious email received with attachment\n22:05:17  User visited suspicious portal\n22:09:41  File download page accessed\n22:12:33  Network connection established to external server\n22:14:08  Suspicious file created on system",

      conclusion:
        "The analysis identified multiple indicators consistent with malicious activity including suspicious file execution, abnormal network communication, and registry persistence artifacts. These findings suggest that the system may have been compromised through a phishing-based malware delivery attempt. Further malware analysis and network monitoring is recommended."

    };

  }

}

const generateAIReport = async (caseData, evidence) => {

  const service = new AIService();

  return await service.generateReport(caseData, evidence);

};

module.exports = {
  AIService,
  generateAIReport
};*/
/*const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAIReport(caseData, evidence) {

  const evidenceSummary = evidence.map(e => e.title || e.type || "Digital Artifact").join(", ");

  const prompt = `
You are a certified digital forensic investigator.

Generate a PROFESSIONAL digital forensic investigation report.

Return JSON ONLY in this format:

{
executiveSummary:"",
incidentOverview:"",
evidenceSummary:"",
technicalFindings:"",
timeline:"",
conclusion:""
}

Case ID: ${caseData.caseId}
Case Title: ${caseData.title}

Evidence collected:
${evidenceSummary}

Guidelines:

Executive Summary
Explain investigation purpose, suspicious activity detection, and investigation scope.

Incident Overview
Describe system environment, network context, and incident discovery.

Evidence Summary
Explain types of digital evidence collected.

Technical Findings
Explain suspicious files, network activity, registry persistence and attack behavior.

Timeline
Provide chronological events using format:
21:58:02 Suspicious email received
22:05:17 User visited suspicious portal

Conclusion
Provide investigation findings and recommendations.
`;

  const start = Date.now();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }]
  });

  let response = completion.choices[0].message.content;

  response = response.replace(/```json/g, "").replace(/```/g, "");

  const parsed = JSON.parse(response);

  return {
    content: JSON.stringify(parsed),
    processingTime: Date.now() - start,
    wordCount: response.split(" ").length
  };

}

module.exports = {
  generateAIReport
};*/
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAIReport(caseData, evidence) {

  const evidenceSummary = evidence
    .map(e => e.title || e.type || "Digital Artifact")
    .join(", ");

  const prompt = `
You are a certified digital forensic investigator writing an official digital forensic investigation report.

Generate a highly detailed and professional investigation report.

The report must contain the following sections:

Executive Summary
Incident Overview
Evidence Summary
Technical Findings
Timeline
Conclusion

Return ONLY valid JSON in this format:

{
"executiveSummary":"",
"incidentOverview":"",
"evidenceSummary":"",
"technicalFindings":"",
"timeline":"",
"conclusion":""
}

CASE INFORMATION

Case ID: ${caseData.caseId}
Case Title: ${caseData.title}

Evidence Collected:
${evidenceSummary}

REPORT WRITING INSTRUCTIONS

Executive Summary:
Write a detailed summary explaining:
- why the investigation started
- how suspicious activity was detected
- investigation objectives
- importance of digital forensic analysis
Write at least 2–3 well developed paragraphs.

Incident Overview:
Describe:
- affected device
- operating system
- corporate network environment
- how incident was discovered
- potential risk to company systems
Write 2–3 detailed paragraphs.

Evidence Summary:
Explain the types of evidence collected including:
- suspicious files
- browser artifacts
- registry entries
- network logs
- email artifacts
Explain the importance of each artifact in the investigation.

Technical Findings:
Provide deep technical analysis including:
- suspicious executable file behavior
- browser activity involving unknown websites
- communication with external IP addresses
- registry persistence mechanisms
- possible malware behavior such as command-and-control communication
Write multiple paragraphs describing these findings.

Timeline:
Provide chronological events in this exact format:

21:58:02 Suspicious email received with attachment
22:05:17 User visited suspicious portal
22:09:41 File download page accessed
22:12:33 Network connection established to external server
22:14:08 Suspicious file created on system

Conclusion:
Summarize the investigation results and include:
- security risks identified
- impact on organization
- recommendations for preventing future attacks
- employee awareness and security monitoring improvements

IMPORTANT RULES

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not wrap JSON inside backticks.
`;

  const start = Date.now();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    });

    let response = completion.choices[0].message.content || "";

    response = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      const startIndex = response.indexOf("{");
      const endIndex = response.lastIndexOf("}");
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("No JSON block detected");
      }
      const jsonString = response.substring(startIndex, endIndex + 1);
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.error("Invalid JSON from Groq:", response);
      throw new Error("AI returned invalid JSON");
    }

    if (parsed.timeline) {
      parsed.timeline = parsed.timeline
        .replace(/,\s*/g, "\n")
        .replace(/\n+/g, "\n")
        .trim();
    }

    return {
      content: parsed,
      processingTime: Date.now() - start,
      wordCount: JSON.stringify(parsed).split(/\s+/).length
    };

  } catch (error) {
    console.error("Groq AI Service Error:", error.message);

    // Fallback Mock Report
    const parsed = {
      executiveSummary: "This is a fallback automated report due to an AI generation failure.",
      incidentOverview: "The system was unable to contact the AI provider (Groq) or the key expired.",
      evidenceSummary: "Evidence was successfully uploaded and logged but AI synthesis failed.",
      technicalFindings: "Please verify the API configuration or try again later.",
      timeline: "N/A",
      conclusion: "Fallback generation complete."
    };

    return {
      content: parsed,
      processingTime: Date.now() - start,
      wordCount: 50
    };
  }

}

module.exports = {
  generateAIReport
};