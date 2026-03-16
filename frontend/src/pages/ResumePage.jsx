import { useRef, useEffect, useState } from "react";
import styles from "./ResumePage.module.css";
import { ArrowLeft, Printer, RefreshCw, Mail, Phone, MapPin, Linkedin, Github, FileDown, Loader2, CheckCircle } from "lucide-react";
import { downloadResumeDocx } from "../utils/downloadDocx.js";

export default function ResumePage({ resume, onBack, onRegenerate }) {
  const printRef = useRef();
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxDone, setDocxDone]       = useState(false);

  // Auto-download docx as soon as resume is ready
  useEffect(() => {
    if (!resume) return;
    handleDocxDownload();
  }, []);

  const handleDocxDownload = async () => {
    setDocxLoading(true);
    setDocxDone(false);
    try {
      await downloadResumeDocx(resume);
      setDocxDone(true);
      setTimeout(() => setDocxDone(false), 3000);
    } catch (e) {
      console.error("DOCX error:", e);
      alert("Failed to generate DOCX: " + e.message);
    } finally {
      setDocxLoading(false);
    }
  };

  if (!resume) return null;

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={`${styles.toolbar} no-print`}>
        <button className={styles.back} onClick={onBack}>
          <ArrowLeft size={16} /> Edit
        </button>
        <div className={styles.toolbarTitle}>Your Resume is Ready</div>
        <div className={styles.toolbarActions}>
          <button className={styles.regenBtn} onClick={onRegenerate}>
            <RefreshCw size={15} /> Regenerate
          </button>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <Printer size={15} /> Print / PDF
          </button>
          <button
            className={`${styles.docxBtn} ${docxDone ? styles.docxDone : ""}`}
            onClick={handleDocxDownload}
            disabled={docxLoading}
          >
            {docxLoading
              ? <><Loader2 size={15} className={styles.spin} /> Building…</>
              : docxDone
              ? <><CheckCircle size={15} /> Downloaded!</>
              : <><FileDown size={15} /> Download .docx</>
            }
          </button>
        </div>
      </div>

      {/* Resume Paper */}
      <div className={styles.paperWrap}>
        <div className={`${styles.paper} print-area fade-up`} ref={printRef}>
          <header className={styles.resumeHeader}>
            <h1 className={styles.resumeName}>{resume.name}</h1>
            <div className={styles.contact}>
              {resume.email    && <span><Mail     size={12} />{resume.email}</span>}
              {resume.phone    && <span><Phone    size={12} />{resume.phone}</span>}
              {resume.location && <span><MapPin   size={12} />{resume.location}</span>}
              {resume.linkedin && <span><Linkedin size={12} />{resume.linkedin}</span>}
              {resume.github   && <span><Github   size={12} />{resume.github}</span>}
            </div>
          </header>

          {resume.summary && (
            <Section title="Professional Summary">
              <p className={styles.summary}>{resume.summary}</p>
            </Section>
          )}

          {resume.skills && (
            <Section title="Skills">
              {resume.skills.technical?.length > 0 && (
                <div className={styles.skillGroup}>
                  <span className={styles.skillLabel}>Technical:</span>
                  <span className={styles.skillList}>{resume.skills.technical.join(" · ")}</span>
                </div>
              )}
              {resume.skills.soft?.length > 0 && (
                <div className={styles.skillGroup}>
                  <span className={styles.skillLabel}>Professional:</span>
                  <span className={styles.skillList}>{resume.skills.soft.join(" · ")}</span>
                </div>
              )}
            </Section>
          )}

          {resume.experience?.length > 0 && (
            <Section title="Work Experience">
              {resume.experience.map((exp, i) => (
                <div className={styles.expItem} key={i}>
                  <div className={styles.expHeader}>
                    <div>
                      <span className={styles.expTitle}>{exp.title}</span>
                      <span className={styles.expCompany}> · {exp.company}</span>
                    </div>
                    <span className={styles.expDuration}>{exp.duration}</span>
                  </div>
                  <ul className={styles.bullets}>
                    {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </Section>
          )}

          {resume.education?.length > 0 && (
            <Section title="Education">
              {resume.education.map((ed, i) => (
                <div className={styles.eduItem} key={i}>
                  <div className={styles.expHeader}>
                    <div>
                      <span className={styles.expTitle}>{ed.degree}</span>
                      <span className={styles.expCompany}> · {ed.school}</span>
                    </div>
                    <span className={styles.expDuration}>
                      {ed.year}{ed.gpa ? ` · GPA ${ed.gpa}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {resume.projects?.length > 0 && (
            <Section title="Projects">
              {resume.projects.map((proj, i) => (
                <div className={styles.projItem} key={i}>
                  <span className={styles.projName}>{proj.name}</span>
                  {proj.tech?.length > 0 && (
                    <span className={styles.projTech}>{proj.tech.join(", ")}</span>
                  )}
                  <p className={styles.projDesc}>{proj.description}</p>
                </div>
              ))}
            </Section>
          )}

          {resume.certifications?.length > 0 && (
            <Section title="Certifications">
              <ul className={styles.certList}>
                {resume.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionLine} />
      </div>
      {children}
    </section>
  );
}
