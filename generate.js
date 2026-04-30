export default async function handler(req, res) {
  // Support both Vercel-style and raw Node http response
  const send = (status, body) => {
    if (typeof res.status === "function") {
      return res.status(status).json(body);
    }
    res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(body));
  };

  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.end();
  if (req.method !== "POST") return send(405, { error: "Method not allowed" });

  const { jobDescription, userProfile } = req.body;
  if (!jobDescription || !userProfile)
    return send(400, { error: "Missing jobDescription or userProfile" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return send(500, { error: "GROQ_API_KEY not set" });

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
Experience: ${userProfile.experience}
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
- Tailor experience bullets to mirror exact keywords and skills from the job description
- Use strong action verbs and quantify achievements where possible
- Prioritize skills mentioned in the job description
- Return ONLY the JSON object, nothing else`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Always respond with valid JSON only — no markdown, no backticks, no extra text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Groq API error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in response");

    const resume = JSON.parse(jsonMatch[0]);
    return send(200, { resume });
  } catch (err) {
    console.error("Groq error:", err);
    return send(500, { error: err.message || "Failed to generate resume" });
  }
}
