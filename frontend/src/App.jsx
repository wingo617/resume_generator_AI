import { useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import FormPage from "./pages/FormPage.jsx";
import ResumePage from "./pages/ResumePage.jsx";

export default function App() {
  const [page, setPage] = useState("landing"); // landing | form | resume
  const [resumeData, setResumeData] = useState(null);
  const [formData, setFormData] = useState(null);

  return (
    <>
      {page === "landing" && (
        <LandingPage onStart={() => setPage("form")} />
      )}
      {page === "form" && (
        <FormPage
          onBack={() => setPage("landing")}
          onGenerated={(data, form) => {
            setResumeData(data);
            setFormData(form);
            setPage("resume");
          }}
        />
      )}
      {page === "resume" && (
        <ResumePage
          resume={resumeData}
          onBack={() => setPage("form")}
          onRegenerate={() => setPage("form")}
        />
      )}
    </>
  );
}
