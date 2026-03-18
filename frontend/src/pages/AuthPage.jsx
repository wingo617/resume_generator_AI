import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import styles from "./AuthPage.module.css";
import { FileText, Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthPage({ onAuth }) {
  const canvasRef = useRef(null);
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

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
    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
        this.r = Math.random() * 2 + 0.5; this.a = Math.random() * 0.5 + 0.2;
        this.color = Math.random() < 0.5 ? "99,102,241" : "168,85,247";
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.a})`; ctx.fill();
      }
    }
    for (let i = 0; i < 100; i++) particles.push(new P());
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
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
        particles[i].update(); particles[i].draw();
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm, then log in.");
        setMode("login");
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>

      {/* LEFT — professional image */}
      <div className={styles.left}>
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop"
          alt="Professionals working"
          className={styles.bgImage}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.leftContent}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}><FileText size={17} color="white" /></div>
            <span>ResumeAI</span>
          </div>
          <div className={styles.leftQuote}>
            <p>"Land your dream job with a resume tailored to every application — instantly."</p>
            <span>Powered by Wingo</span>
          </div>
        </div>
      </div>

      {/* RIGHT — particles + form */}
      <div className={styles.right}>
        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.formWrap}>
          <div className={styles.cardHeader}>
            <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
            <p>{mode === "login" ? "Sign in to generate your tailored resume" : "Start building job-winning resumes for free"}</p>
          </div>

          <form onSubmit={handle} className={styles.form}>
            <div className={styles.field}>
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passWrap}>
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error   && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <button className={styles.submit} disabled={loading}>
              {loading
                ? <><Loader2 size={16} className={styles.spin} />{mode === "login" ? "Signing in…" : "Creating…"}</>
                : mode === "login" ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <p className={styles.toggle}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
