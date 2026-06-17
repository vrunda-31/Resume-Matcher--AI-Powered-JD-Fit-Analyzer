import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { UploadSection } from "@/components/resume/UploadSection";
import { ResultsDashboard } from "@/components/resume/ResultsDashboard";
import { analyzeMatch, uploadResume, type AnalysisResult } from "@/lib/resume-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resume Matcher — AI JD Fit Analyzer" },
      {
        name: "description",
        content:
          "Upload your resume and paste a job description to get an instant AI-powered match score, missing skills, and improvement suggestions.",
      },
      { property: "og:title", content: "Resume Matcher — AI JD Fit Analyzer" },
      {
        property: "og:description",
        content:
          "Instant AI match score between your resume and any job description, with matched skills, gaps, and suggestions.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      let text = resumeText;
      if (resumeFile) {
        text = await uploadResume(resumeFile);
      }
      let jd = jdText;
      if (jdFile) {
        jd = await uploadResume(jdFile);
      }
      const data = await analyzeMatch({ resume_text: text, jd_text: jd });
      setResult(data);
    } catch (e) {
      console.error(e);
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setJdText("");
    setJdFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <Toaster />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-[0.07] blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div
          key={result ? "results" : "upload"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {result ? (
            <ResultsDashboard result={result} onReset={handleReset} />
          ) : (
            <UploadSection
              resumeFile={resumeFile}
              resumeText={resumeText}
              jdFile={jdFile}
              jdText={jdText}
              loading={loading}
              error={error}
              onResumeFile={setResumeFile}
              onResumeText={setResumeText}
              onJdFile={setJdFile}
              onJdText={setJdText}
              onAnalyze={handleAnalyze}
            />
          )}
        </div>
      </main>
    </div>
  );
}
