import { useState } from "react";
import styles from "./FormPage.module.css";
import { ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

// ─── Default profile — user edits this once, then reuses across job applications ───
const DEFAULT_PROFILE = {
  name: "Jin Meng",
  email: "awsdollas@gmail.com",
  phone: "+1 (555) 000-0000",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/jinmeng",
  github: "github.com/jinmeng",
  summary:
    "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and shipping products users love.",
  skills:
    "JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, AWS (EC2, S3, Lambda), Docker, Kubernetes, REST APIs, GraphQL, Git, Agile/Scrum",
  experience: `Senior Software Engineer, Acme Corp (2021–Present)
- Built microservices architecture serving 2M+ daily active users
- Led a team of 5 engineers to redesign the core API, reducing latency by 40%
- Implemented CI/CD pipelines with GitHub Actions, cutting deploy time by 60%
- Mentored 3 junior developers and ran weekly code reviews

Software Engineer, StartupXYZ (2015–2021)
- Launched a React Native mobile app with 50k downloads in first 3 months
- Designed and built RESTful APIs in Node.js integrated with Stripe and Twilio
- Improved PostgreSQL query performance by 35% through indexing and query optimization`,
  education: "B.S. Computer Science, UC Berkeley, 2019, GPA 3.7",
  projects: `OpenDash — open-source analytics dashboard built with Next.js and D3.js (800+ GitHub stars)
DevProxy — CLI tool for mocking API responses during local development (used by 2k+ developers)`,
  certifications: "AWS Certified Solutions Architect – Associate\nGoogle Cloud Professional Data Engineer",
};

export default function FormPage({ onBack, onGenerated, onLogout }) {
  const [jobDescription, setJobDescription] = useState("");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false); // collapsed by default

  const update = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userProfile: profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onGenerated(data.resume, { jobDescription, profile });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className={styles.headerTitle}>ResumeAI</div>
        <button className={styles.logoutBtn} onClick={onLogout} title="Sign out" style={{background:"none",border:"1.5px solid var(--border)",color:"var(--muted)",borderRadius:"4px",padding:"6px 10px",cursor:"pointer",fontSize:"0.8rem",display:"flex",alignItems:"center",gap:"6px"}}>
          Sign out
        </button>
      </header>

      <div className={styles.content}>
        <div className={`${styles.panel} fade-up`}>

          {/* ── STEP 1: Job Description (always visible, primary focus) ── */}
          <div className={styles.primarySection}>
            <h2 className={styles.panelTitle}>Paste the Job Description</h2>
            <p className={styles.panelSub}>
              The AI will tailor your skills and experience to match this role's keywords and requirements.
            </p>
            <textarea
              className={styles.bigTextarea}
              placeholder="Paste the full job description here — requirements, responsibilities, qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={14}
            />
          </div>

          {/* ── STEP 2: Profile (collapsible, pre-filled) ── */}
          <div className={styles.profileSection}>
            <button
              className={styles.profileToggle}
              onClick={() => setProfileOpen((o) => !o)}
            >
              <div className={styles.profileToggleLeft}>
                <span className={styles.profileToggleTitle}>Your Profile</span>
                <span className={styles.profileToggleSub}>
                  {profileOpen ? "Click to collapse" : `Pre-filled as ${profile.name} · Click to edit`}
                </span>
              </div>
              {profileOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {profileOpen && (
              <div className={styles.profileBody}>
                <div className={styles.profileNote}>
                  ✦ Your contact info and education stay fixed. The AI will rewrite your
                  <strong>summary</strong>, <strong>skills</strong>, <strong>experience bullets</strong>, and <strong>projects</strong> to match the job above.
                </div>

                <div className={styles.grid2}>
                  <Field label="Full Name *" value={profile.name} onChange={update("name")} placeholder="Jane Smith" />
                  <Field label="Email *" type="email" value={profile.email} onChange={update("email")} placeholder="jane@example.com" />
                  <Field label="Phone *" value={profile.phone} onChange={update("phone")} placeholder="+1 (555) 000-0000" />
                  <Field label="Location *" value={profile.location} onChange={update("location")} placeholder="San Francisco, CA" />
                  <Field label="LinkedIn URL" value={profile.linkedin} onChange={update("linkedin")} placeholder="linkedin.com/in/janesmith" />
                  <Field label="GitHub URL" value={profile.github} onChange={update("github")} placeholder="github.com/janesmith" />
                </div>

                <TextArea label="Professional Summary" value={profile.summary} onChange={update("summary")}
                  placeholder="Brief overview of your background..." rows={3} />

                <div className={styles.aiTaggedField}>
                  <div className={styles.aiTag}><Sparkles size={11} /> AI will tailor this</div>
                  <TextArea label="All Your Skills" value={profile.skills} onChange={update("skills")}
                    placeholder="List everything — the AI picks what's relevant to the job..." rows={3} />
                </div>

                <div className={styles.aiTaggedField}>
                  <div className={styles.aiTag}><Sparkles size={11} /> AI will tailor this</div>
                  <TextArea label="Work Experience *" value={profile.experience} onChange={update("experience")}
                    placeholder={`Senior Developer, Acme Corp (2021–Present)\n- Built microservices serving 2M users\n- Led team of 5 engineers`}
                    rows={9} />
                </div>

                <TextArea label="Education *" value={profile.education} onChange={update("education")}
                  placeholder="B.S. Computer Science, UC Berkeley, 2019, GPA 3.7" rows={2} />

                <TextArea label="Projects (optional)" value={profile.projects} onChange={update("projects")}
                  placeholder="Personal or open-source projects..." rows={3} />

                <TextArea label="Certifications (optional)" value={profile.certifications} onChange={update("certifications")}
                  placeholder="AWS Certified Solutions Architect..." rows={2} />
              </div>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {/* Generate button */}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading || !jobDescription.trim() || !profile.name || !profile.experience}
          >
            {loading ? (
              <><Loader2 size={18} className={styles.spin} /> Tailoring your resume…</>
            ) : (
              <><Sparkles size={18} /> Generate Tailored Resume</>
            )}
          </button>

          {!loading && jobDescription.trim() && (
            <p className={styles.hint}>
              AI tailors your summary, skills, experience bullets, and projects to match the job — contact info and education stay fixed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </div>
  );
}
