"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interviewed"
  | "Rejected"
  | "Hired";

interface ApplicationStatusSelectProps {
  currentStatus: ApplicationStatus;
  onChange: (status: string) => void;
  disabled?: boolean;
}

/**
 * Dropdown selector styled dynamically based on selected application status.
 */
export function ApplicationStatusSelect({
  currentStatus,
  onChange,
  disabled = false,
}: ApplicationStatusSelectProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);

  // Sync local state when parent prop changes
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-success-light/20 text-success border-success/30 dark:bg-success-light/5";
      case "Rejected":
        return "bg-error-light/20 text-error border-error/30";
      case "Shortlisted":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-900";
      case "Interviewed":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/10 dark:text-purple-400 dark:border-purple-900";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-250 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    setStatus(newStatus); // update UI immediately
    onChange(newStatus);  // notify parent
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        "h-8 px-2.5 rounded-md text-xs font-semibold border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50 transition-colors bg-white dark:bg-zinc-900",
        getStatusColor(status)
      )}
      aria-label="Change application status"
    >
      <option value="Applied" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">Applied</option>
      <option value="Shortlisted" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">Shortlisted</option>
      <option value="Interviewed" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">Interviewed</option>
      <option value="Rejected" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-medium">Rejected</option>
      <option value="Hired" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold">Hired</option>
    </select>
  );
}

export default ApplicationStatusSelect;
