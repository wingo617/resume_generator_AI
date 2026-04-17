import { useState, useEffect } from "react";
import { supabase } from "./lib/authClient.js";
import AuthPage from "./pages/AuthPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import FormPage from "./pages/FormPage.jsx";
import ResumePage from "./pages/ResumePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";

export default function App() {
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage]             = useState("landing");
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("landing");
    setResumeData(null);
  };

  const isAdmin = user?.is_admin || user?.email === ADMIN_EMAIL;

  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--paper)" }}>
      <div style={{ width:32, height:32, border:"3px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );

  if (!user) return <AuthPage onAuth={(u) => { setUser(u); setPage("landing"); }} />;

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onStart={() => setPage("form")}
          user={user}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onAdmin={() => setPage("admin")}
        />
      )}
      {page === "form" && (
        <FormPage
          onBack={() => setPage("landing")}
          onGenerated={(data) => { setResumeData(data); setPage("resume"); }}
          onLogout={handleLogout}
        />
      )}
      {page === "resume" && (
        <ResumePage
          resume={resumeData}
          onBack={() => setPage("form")}
          onRegenerate={() => setPage("form")}
          onLogout={handleLogout}
        />
      )}
      {page === "admin" && isAdmin && (
        <AdminPage onBack={() => setPage("landing")} />
      )}
    </>
  );
}
