import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
}

function tier(score: number) {
  if (score >= 75) return { color: "var(--success)", label: "Strong match" };
  if (score >= 50) return { color: "var(--warning)", label: "Partial match" };
  return { color: "var(--destructive)", label: "Low match" };
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { color, label } = tier(clamped);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(clamped), 60);
    return () => clearTimeout(t);
  }, [clamped]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="14"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight" style={{ color }}>
            {animated}%
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Match score
          </span>
        </div>
      </div>
      <span
        className="mt-4 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
      >
        {label}
      </span>
    </div>
  );
}