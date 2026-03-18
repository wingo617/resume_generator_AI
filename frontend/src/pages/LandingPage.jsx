import styles from "./LandingPage.module.css";
import { Sparkles, FileText, Zap, Target, LogOut, ShieldAlert } from "lucide-react";

export default function LandingPage({ onStart, user, isAdmin, onLogout, onAdmin }) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <FileText size={20} />
          <span>ResumeAI</span>
        </div>
        <div className={styles.navRight}>
          {user && <span className={styles.userEmail}>{user.email}</span>}
          {isAdmin && (
            <button className={styles.adminBtn} onClick={onAdmin}>
              <ShieldAlert size={14} /> Admin
            </button>
          )}
          <button className={styles.navCta} onClick={onStart}>Get Started →</button>
          {user && (
            <button className={styles.logoutBtn} onClick={onLogout} title="Sign out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={`${styles.badge} fade-up fade-up-1`}>
          <Sparkles size={14} /> Powered by Groq AI
        </div>
        <h1 className={`${styles.headline} fade-up fade-up-2`}>
          Resumes that land<br /><em>the interview.</em>
        </h1>
        <p className={`${styles.sub} fade-up fade-up-3`}>
          Paste a job description. Tell us about yourself.<br />
          Get a tailored, ATS-optimized resume in seconds.
        </p>
        <button className={`${styles.cta} fade-up fade-up-3`} onClick={onStart}>
          <Sparkles size={18} /> Generate My Resume
        </button>
        <div className={styles.heroDecor} aria-hidden />
      </section>

      <section className={styles.features}>
        {[
          { icon: <Target size={24} />, title: "Job-Targeted", desc: "Keywords pulled directly from the posting to pass ATS filters." },
          { icon: <Zap size={24} />, title: "Instant Results", desc: "AI generates a polished resume in under 10 seconds, ready to download." },
          { icon: <FileText size={24} />, title: "Print-Ready", desc: "Clean, professional layout that looks great on paper and PDF." },
        ].map((f, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.icon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
      <footer className={styles.footer}>Built with Groq AI · © {new Date().getFullYear()} ResumeAI</footer>
    </div>
  );
}
