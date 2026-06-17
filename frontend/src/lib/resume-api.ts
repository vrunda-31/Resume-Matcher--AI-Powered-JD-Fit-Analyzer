export interface AnalysisResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  resume_skills: string[];
  jd_skills: string[];
  suggestions: string[];
  experience_summary: string;
  education_summary: string;
}

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export async function uploadResume(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/upload-resume`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = (await res.json()) as { resume_text?: string; text?: string };
  const text = data.resume_text ?? data.text;
  if (!text) throw new Error("Backend did not return resume text");
  return text;
}

export async function analyzeMatch(payload: {
  resume_text: string;
  jd_text: string;
}): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Analyze failed (${res.status})`);
  return (await res.json()) as AnalysisResult;
}