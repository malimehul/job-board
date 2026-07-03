"use client";

import React from "react";
import { Application } from "@/types";

interface StatusBadgeProps {
  status: Application["status"] | string;
  className?: string;
}

/**
 * Premium StatusBadge presentation element.
 * Maps application screening status strings to strict theme styles.
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStyles = (currentStatus: string) => {
    switch (currentStatus) {
      case "Hired":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
      case "Rejected":
        return "bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
      case "Shortlisted":
        return "bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60";
      case "Interviewed":
        return "bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60";
      case "Applied":
      default:
        return "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-650 dark:text-zinc-350 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-bold border transition-colors ${getStyles(
        status
      )} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
}

export default StatusBadge;
