import { Egg } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  sub = "Pagerwojo",
  size = "md",
  className,
}: {
  sub?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const icon = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-5 h-5" : "w-6 h-6";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-xl bg-primary flex items-center justify-center shrink-0",
          box
        )}
      >
        <Egg className={cn("text-egg", icon)} />
      </div>
      <div className="leading-tight">
        <div className="font-bold text-heading dark:text-slate-100 tracking-tight">
          GEMATI
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>
      </div>
    </div>
  );
}
