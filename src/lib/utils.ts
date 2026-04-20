import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getResonanceLabel(score: number) {
  // Formalize the Resonance Tiers (0-10 scale)
  if (score >= 9.0) {
    return { 
      label: "Peak Resonance", 
      color: "text-accent-emerald", 
      bg: "bg-accent-emerald/10", 
      border: "border-accent-emerald/20",
      rawColor: "#10b981" // Emerald
    };
  }
  if (score >= 7.0) {
    return { 
      label: "Minor Drift", 
      color: "text-accent-amber", 
      bg: "bg-accent-amber/10", 
      border: "border-accent-amber/20",
      rawColor: "#f59e0b" // Amber
    };
  }
  if (score >= 4.0) {
    return { 
      label: "Dissonance", 
      color: "text-orange-500", 
      bg: "bg-orange-500/10", 
      border: "border-orange-500/20",
      rawColor: "#f97316" // Orange
    };
  }
  return { 
    label: "System Failure", 
    color: "text-error", 
    bg: "bg-error/10", 
    border: "border-error/20",
    rawColor: "#ef4444" // Red
  };
}
