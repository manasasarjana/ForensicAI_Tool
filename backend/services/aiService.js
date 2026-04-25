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
