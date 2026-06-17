
## Resume Matcher — AI JD Fit Analyzer

Single-route app (`/`) that toggles between an Upload view and a Results view based on React state. No backend in this project — calls an external FastAPI service via `VITE_API_URL` (default `http://localhost:8000`).

### Files to create

- `src/routes/index.tsx` — replaces placeholder, owns top-level state (resume file/text, JD text, loading, results, error) and renders either `<UploadSection>` or `<ResultsDashboard>` with a fade/slide transition.
- `src/components/resume/UploadSection.tsx` — two-column (stacked on mobile) layout:
  - Resume card: drag-and-drop PDF dropzone + "or paste text" toggle → textarea fallback.
  - JD card: large textarea.
  - Gradient "Analyze Match" CTA, disabled until both inputs have content. Shows inline spinner + status text while loading.
- `src/components/resume/ResultsDashboard.tsx` — composes `<ScoreGauge>`, matched/missing skill sections (using `<SkillBadge>`), `<SuggestionCard>` list, resume overview cards (experience/education), and "Try Another JD" + "Download Report" buttons.
- `src/components/resume/ScoreGauge.tsx` — circular SVG progress ring, color tier (green ≥75, yellow 50–74, red <50), animated fill on mount.
- `src/components/resume/SkillBadge.tsx` — pill chip with `variant: "matched" | "missing"` (green/red tokens) and check/x icon.
- `src/components/resume/SuggestionCard.tsx` — card row with lightbulb icon + suggestion text.
- `src/lib/resume-api.ts` — `uploadResume(file)` (multipart → `/upload-resume`) and `analyzeMatch({ resume_text, jd_text })` (JSON → `/analyze`); typed `AnalysisResult` interface; base URL from `import.meta.env.VITE_API_URL ?? "http://localhost:8000"`.

### Flow

1. User uploads PDF or pastes resume text + pastes JD text.
2. Click Analyze → if file present, call `/upload-resume` to get extracted text, else use pasted text → call `/analyze` with both texts.
3. On success, swap to `<ResultsDashboard>`. On failure, show toast/inline error message and stay on upload.
4. "Try Another JD" clears JD text + results, keeps resume; returns to upload view.
5. "Download Report" is a stub button (toast: "Coming soon") — placeholder per spec.

### Design

- Blue→purple gradient accent defined as design tokens in `src/styles.css` (`--gradient-primary`, `--shadow-elegant`, plus `--success` / `--warning` / `--destructive` tiers for the gauge and badges). All component colors via semantic tokens — no hardcoded hex.
- shadcn `Card`, `Button`, `Textarea`, `Badge` reused; lucide icons: `UploadCloud`, `FileText`, `Brain`, `Check`, `X`, `Lightbulb`, `GraduationCap`, `Briefcase`, `Download`, `RotateCcw`.
- Framer-motion fade/slide between upload and results views; gauge fills with a tween.

### Technical notes

- TypeScript throughout with an `AnalysisResult` interface matching the documented JSON shape.
- Drag-and-drop via native `onDragOver`/`onDrop` (no extra dep); validates `application/pdf`.
- Errors surfaced via `sonner` toast (already in stack) plus inline error text under the CTA.
- Head metadata in `index.tsx`: title "Resume Matcher — AI JD Fit Analyzer", matching description and og tags.
- State is local to the index route — no router changes, no backend, no Cloud needed.

Ask me to switch to build mode and I'll implement.
