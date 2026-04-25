const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAIReport(caseData, evidence) {

  const evidenceSummary = evidence
    .map((e, index) => `${index + 1}. [${e.createdAt.toISOString()}] ${e.originalName} (${e.fileType}) - ${e.description || "No description provided"}`)
    .join("\n");

  const prompt = `
You are a certified digital forensic investigator writing an official digital forensic investigation report.

Generate a highly detailed and professional investigation report based on the evidence provided.

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
Case Description: ${caseData.description || "N/A"}
Incident Date: ${caseData.incidentDate ? caseData.incidentDate.toISOString() : "Unknown"}

EVIDENCE DATA (USE THIS TO GENERATE THE TIMELINE AND ANALYSIS):
${evidenceSummary}

REPORT WRITING INSTRUCTIONS

Executive Summary:
Write a detailed summary explaining why the investigation started and the main objectives.

Incident Overview:
Describe the incident environment and how it was discovered.

Evidence Summary:
Detail the collected artifacts and their relevance.

Technical Findings:
Provide deep technical analysis of the findings derived from the evidence listed above.

Timeline:
Generate a CHRONOLOGICAL timeline based on the actual "Evidence Data" timestamps provided above.
Each line should start with the HH:MM:SS format.
DO NOT use the example below as literal data. USE THE ACTUAL TIMESTAMPS FROM THE EVIDENCE LIST.

Example Format:
HH:MM:SS Description of the forensic event related to the evidence item

Conclusion:
Summarize results and provide security recommendations.

IMPORTANT RULES

Return ONLY valid JSON.
Do not include markdown or backticks.
The Timeline section MUST reflect the actual evidence timestamps provided.
`;

  const start = Date.now();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
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
