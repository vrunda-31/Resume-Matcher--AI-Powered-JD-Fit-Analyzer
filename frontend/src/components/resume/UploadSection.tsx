import { useRef, useState, type DragEvent } from "react";
import { Brain, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadSectionProps {
  resumeFile: File | null;
  resumeText: string;
  jdFile: File | null;
  jdText: string;
  loading: boolean;
  error: string | null;
  onResumeFile: (file: File | null) => void;
  onResumeText: (text: string) => void;
  onJdFile: (file: File | null) => void;
  onJdText: (text: string) => void;
  onAnalyze: () => void;
}

export function UploadSection({
  resumeFile,
  resumeText,
  jdFile,
  jdText,
  loading,
  error,
  onResumeFile,
  onResumeText,
  onJdFile,
  onJdText,
  onAnalyze,
}: UploadSectionProps) {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [jdMode, setJdMode] = useState<"file" | "text">("text");
  const [dragOver, setDragOver] = useState(false);
  const [jdDragOver, setJdDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const hasResume = mode === "file" ? Boolean(resumeFile) : resumeText.trim().length > 0;
  const hasJd = jdMode === "file" ? Boolean(jdFile) : jdText.trim().length > 0;
  const canAnalyze = hasResume && hasJd && !loading;

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") onResumeFile(file);
  }

  function handleJdDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setJdDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") onJdFile(file);
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div
          className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Brain className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Resume Matcher
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          AI-powered fit analysis between your resume and any job description.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resume card */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Your resume</h2>
            </div>
            <div className="inline-flex rounded-lg border bg-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  mode === "file" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setMode("text")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  mode === "text" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Paste text
              </button>
            </div>
          </div>

          {mode === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) onResumeFile(file);
                }}
              />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="max-w-[16rem] truncate text-sm font-medium">
                    {resumeFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(resumeFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResumeFile(null);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop your resume, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF only</p>
                </>
              )}
            </div>
          ) : (
            <Textarea
              value={resumeText}
              onChange={(e) => onResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here..."
              className="h-56 resize-none"
            />
          )}
        </Card>

        {/* JD card */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Job description</h2>
            </div>
            <div className="inline-flex rounded-lg border bg-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setJdMode("file")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  jdMode === "file" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setJdMode("text")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  jdMode === "text" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Paste text
              </button>
            </div>
          </div>

          {jdMode === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setJdDragOver(true);
              }}
              onDragLeave={() => setJdDragOver(false)}
              onDrop={handleJdDrop}
              onClick={() => jdInputRef.current?.click()}
              className={cn(
                "flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                jdDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <input
                ref={jdInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) onJdFile(file);
                }}
              />
              {jdFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="max-w-[16rem] truncate text-sm font-medium">
                    {jdFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(jdFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJdFile(null);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop the job description, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF only</p>
                </>
              )}
            </div>
          ) : (
            <Textarea
              value={jdText}
              onChange={(e) => onJdText(e.target.value)}
              placeholder="Paste the job description you want to match against..."
              className="h-56 resize-none"
            />
          )}
        </Card>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          disabled={!canAnalyze}
          onClick={onAnalyze}
          className="h-12 min-w-[220px] text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Brain className="mr-2 h-5 w-5" />
              Analyze Match
            </>
          )}
        </Button>
        {loading && (
          <p className="text-sm text-muted-foreground">
            Analyzing your resume against the job description…
          </p>
        )}
        {error && !loading && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}