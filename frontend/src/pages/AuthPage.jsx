import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import styles from "./AuthPage.module.css";
import { FileText, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthPage({ onAuth }) {
  const [mode, setMode]           = useState("login"); // login | signup
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <FileText size={28} />
          <span>ResumeAI</span>
        </div>
        <div className={styles.leftContent}>
          <h1 className={styles.leftTitle}>
            Land the interview.<br /><em>Every time.</em>
          </h1>
          <p className={styles.leftSub}>
            AI-tailored resumes that match the exact keywords and tone of any job description.
          </p>
          <div className={styles.features}>
            {["ATS-optimized in seconds", "Tailored skills & experience", "Download as .docx"].map(f => (
              <div className={styles.feature} key={f}>
                <Sparkles size={14} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.leftDecor} aria-hidden />
      </div>

      {/* Right panel — auth form */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className={styles.cardSub}>
            {mode === "login"
              ? "Sign in to generate your tailored resume"
              : "Start building job-winning resumes for free"}
          </p>

          <form onSubmit={handle} className={styles.form}>
            <div className={styles.field}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error   && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <button className={styles.submit} disabled={loading}>
              {loading
                ? <><Loader2 size={17} className={styles.spin} /> {mode === "login" ? "Signing in…" : "Creating account…"}</>
                : mode === "login" ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          <p className={styles.toggle}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
