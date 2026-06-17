import { Briefcase, Download, GraduationCap, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreGauge } from "./ScoreGauge";
import { SkillBadge } from "./SkillBadge";
import { SuggestionCard } from "./SuggestionCard";
import type { AnalysisResult } from "@/lib/resume-api";

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  function handleDownload() {
    const lines = [
      "Resume Match Report",
      "===================",
      "",
      `Match Score: ${result.match_score}%`,
      "",
      `Matched Skills (${result.matched_skills.length}):`,
      ...result.matched_skills.map((s) => `  - ${s}`),
      "",
      `Missing Skills (${result.missing_skills.length}):`,
      ...result.missing_skills.map(
        (s) => `  - ${s.skill}${s.priority ? ` [${s.priority}]` : ""}`
      ),
      "",
      "Suggestions:",
      ...result.suggestions.map((s, i) => `  ${i + 1}. ${s}`),
      "",
      "Experience:",
      `  ${result.experience_summary || "Not detected"}`,
      "",
      "Education:",
      `  ${result.education_summary || "Not detected"}`,
      "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-match-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Here's how your resume stacks up against the job description.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button
            onClick={onReset}
            className="text-primary-foreground shadow-[var(--shadow-elegant)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Another JD
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex items-center justify-center p-8 lg:col-span-1">
          <ScoreGauge score={result.match_score} />
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              <h2 className="font-semibold">Matched skills</h2>
              <span className="text-xs text-muted-foreground">
                ({result.matched_skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matched skills detected.</p>
              ) : (
                result.matched_skills.map((s) => (
                  <SkillBadge key={s} label={s} variant="matched" />
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-destructive" />
              <h2 className="font-semibold">Missing skills</h2>
              <span className="text-xs text-muted-foreground">
                ({result.missing_skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing missing — great alignment!
                </p>
              ) : (
                result.missing_skills.map((s) => (
                  <SkillBadge key={s.skill} label={s.skill} variant="missing" priority={s.priority} />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">AI suggestions</h2>
        </div>
        {result.suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suggestions returned.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {result.suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Experience
              </p>
              <p className="mt-1 text-sm text-foreground">
                {result.experience_summary || "Not detected"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Education
              </p>
              <p className="mt-1 text-sm text-foreground">
                {result.education_summary || "Not detected"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}