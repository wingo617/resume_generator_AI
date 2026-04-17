import { useEffect, useRef } from "react";
import styles from "./LandingPage.module.css";
import { FileText, Sparkles, Zap, Target, LogOut, ShieldAlert } from "lucide-react";

export default function LandingPage({ onStart, user, isAdmin, onLogout, onAdmin }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], animId;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.r = Math.random() * 2 + 0.5;
        this.a = Math.random() * 0.5 + 0.2;
        this.color = Math.random() < 0.5 ? "99,102,241" : "168,85,247";
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.a})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 130; i++) particles.push(new Particle());

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><FileText size={18} color="white" /></div>
          ResumeAI
        </div>
        <div className={styles.navRight}>
          {user && <span className={styles.userEmail}>{user.email}</span>}
          {isAdmin && (
            <button className={styles.adminBtn} onClick={onAdmin}>
              <ShieldAlert size={14} /> Admin
            </button>
          )}
          <button className={styles.navCta} onClick={onStart}>Get Started Free</button>
          {user && (
            <button className={styles.logoutBtn} onClick={onLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Powered by Groq AI · Llama 3.3 70B
        </div>
        <h1 className={styles.headline}>
          Resumes that<br />
          <span className={styles.gradient}>land the interview</span>
        </h1>
        <p className={styles.sub}>
          AI tailors every bullet, skill, and summary to match the exact job
          description. Pass ATS filters. Get noticed by recruiters.
        </p>
        <div className={styles.heroBtns}>
          <button className={styles.heroPrimary} onClick={onStart}>
            <Sparkles size={16} /> Generate my resume
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <div className={styles.cards}>
        {[
          { icon: <Target size={20} />, color: "#6366f1", title: "ATS-optimized", desc: "Keywords matched directly from the job posting to pass automated screening filters." },
          { icon: <Zap size={20} />, color: "#a855f7", title: "10-second generation", desc: "Paste a job description, get a fully tailored resume instantly — no manual editing needed." },
          { icon: <FileText size={20} />, color: "#ec4899", title: "Download as .docx", desc: "Professional Word format ready to submit, print, or share directly with recruiters." },
        ].map((f, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardIcon} style={{ background: f.color + "22" }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} ResumeAI · Built with Groq AI
      </footer>
    </div>
  );
}
