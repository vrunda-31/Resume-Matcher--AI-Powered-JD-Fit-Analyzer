import { Lightbulb } from "lucide-react";

interface SuggestionCardProps {
  suggestion: string;
  index: number;
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-[var(--shadow-card)]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Lightbulb className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Suggestion {index + 1}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{suggestion}</p>
      </div>
    </div>
  );
}