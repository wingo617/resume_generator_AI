import Groq from "groq-sdk";

export default async function handler(req, res) {
  // Support both Vercel-style and raw Node http response
  const send = (status, body) => {
    if (typeof res.status === "function") {
      return res.status(status).json(body);
    }
    res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(body));
  };

  try {
    res.setHeader?.("Access-Control-Allow-Origin", "*");
    res.setHeader?.("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.end();
    if (req.method !== "POST") return send(405, { error: "Method not allowed" });

    const body = req.body || {};
    const { jobDescription, userProfile } = body;
    if (!jobDescription || !userProfile)
      return send(400, { error: "Missing jobDescription or userProfile" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return send(500, { error: "GROQ_API_KEY not set" });

    const hasExperience = userProfile.experience && userProfile.experience.trim().length > 0;

    const prompt = `You are an expert resume writer. Create a tailored, ATS-optimized resume based on the job description and user profile below.

JOB DESCRIPTION:
${jobDescription}

USER PROFILE:
Name: ${userProfile.name}
Email: ${userProfile.email}
Phone: ${userProfile.phone}
Location: ${userProfile.location}
LinkedIn: ${userProfile.linkedin || "N/A"}
GitHub: ${userProfile.github || "N/A"}
Summary: ${userProfile.summary}
Skills: ${userProfile.skills}
Experience: ${hasExperience ? userProfile.experience : "(none provided — return an empty experience array)"}
Education: ${userProfile.education}
Projects: ${userProfile.projects || "N/A"}
Certifications: ${userProfile.certifications || "N/A"}

Return ONLY a valid JSON object — no markdown, no backticks, no explanation. Use this exact structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "summary": "2-3 sentence tailored professional summary",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "",
      "company": "",
      "duration": "",
      "bullets": ["achievement with metrics", "achievement"]
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "year": "",
      "gpa": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": ["tech1", "tech2"]
    }
  ],
  "certifications": ["cert1", "cert2"]
}

Rules:
- Write the summary as 2-3 sentences that directly speak to the job requirements, highlighting the most relevant experience and value
- Rewrite project descriptions to emphasize aspects most relevant to the job (tech stack, scale, impact)
- Use strong action verbs and quantify achievements where possible
- Prioritize skills mentioned in the job description
- WORK EXPERIENCE — DO NOT TAILOR OR REWRITE: Parse the user's experience text into the structured format (title, company, duration, bullets) but keep every bullet's wording EXACTLY as the user wrote it. Do not paraphrase, condense, expand, reorder, add metrics, or change keywords. Treat it as read-only data you are only reformatting into JSON.
- If the experience text is empty or "(none provided ...)", return "experience": [] (an empty array). Do NOT invent jobs, companies, dates, or bullets.
- Return ONLY the JSON object, nothing else`;

    const groq = new Groq({ apiKey });

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Always respond with valid JSON only — no markdown, no backticks, no extra text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });
    } catch (err) {
      // SDK exposes the REAL upstream error message ("Host not in allowlist",
      // "Model not found", etc.) — much more useful than the raw fetch's
      // generic "Forbidden". Log everything so we can see exactly what Groq
      // is rejecting.
      console.error("---- Groq SDK error ----");
      console.error("Status :", err.status);
      console.error("Message:", err.message);
      console.error("Code   :", err.error?.code || err.code);
      console.error("Body   :", err.error || "(no body)");
      console.error("------------------------");

      const status = err.status || 500;
      let userMsg;
      if (status === 401) {
        userMsg = "Groq rejected the API key (401). Check GROQ_API_KEY in .env, restart the server.";
      } else if (status === 403) {
        userMsg = `Groq returned 403: ${err.message || "Forbidden"}. Check key settings at https://console.groq.com/keys (look for IP/host allowlists or model permissions).`;
      } else if (status === 429) {
        userMsg = "Groq rate limit (429). Wait a minute and try again.";
      } else {
        userMsg = err.message || `Groq error ${status}`;
      }
      return send(500, { error: userMsg });
    }

    const rawText = completion.choices?.[0]?.message?.content || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return send(500, { error: "AI response did not contain valid JSON. Please try again." });
    }

    let resume;
    try {
      resume = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return send(500, { error: "Failed to parse AI JSON response: " + e.message });
    }

    // Safety net: if the user left Work Experience blank, force the
    // experience array to be empty in case the model invented entries.
    if (!hasExperience) {
      resume.experience = [];
    }

    return send(200, { resume });
  } catch (err) {
    console.error("generate.js fatal error:", err);
    return send(500, { error: err?.message || "Internal server error" });
  }
}
