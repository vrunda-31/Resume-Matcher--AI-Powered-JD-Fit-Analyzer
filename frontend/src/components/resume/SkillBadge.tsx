import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  label: string;
  variant: "matched" | "missing";
  priority?: "required" | "preferred" | "nice_to_have";
}

function getMissingStyle(priority?: string) {
  if (priority === "preferred") {
    return {
      badge: { backgroundColor: "#fffbeb", borderColor: "#fcd34d", color: "#b45309" },
      icon: { color: "#f59e0b" }
    };
  }
  if (priority === "nice_to_have") {
    return {
      badge: { backgroundColor: "#f8fafc", borderColor: "#cbd5e1", color: "#475569" },
      icon: { color: "#94a3b8" }
    };
  }
  // default = required
  return {
    badge: { backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" },
    icon: { color: "#ef4444" }
  };
}

function PriorityDot({ priority }: { priority: "required" | "preferred" | "nice_to_have" }) {
  const color = {
    required: "bg-red-500",
    preferred: "bg-amber-400",
    nice_to_have: "bg-slate-400",
  }[priority];

  const title = {
    required: "Required",
    preferred: "Preferred",
    nice_to_have: "Nice to have",
  }[priority];

  return (
    <span
      title={title}
      className={cn("h-2 w-2 rounded-full", color)}
    />
  );
}

export function SkillBadge({ label, variant, priority }: SkillBadgeProps) {
  const matched = variant === "matched";
  const safeLabel =
    typeof label === "string"
      ? label
      : (label as unknown as { skill?: string })?.skill ?? "";

  const missingStyle = getMissingStyle(priority);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        matched
          ? "border-success/30 bg-success/10 text-success"
          : undefined,
      )}
      style={matched ? undefined : missingStyle.badge}
    >
      {matched ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" style={missingStyle.icon} />
      )}
      {safeLabel}
      {!matched && priority && <PriorityDot priority={priority} />}
    </span>
  );
}
