"use client";

import React from "react";
import { Job } from "@/types";
import JobCard from "./job-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobListProps {
  jobs: Job[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  savedJobIds?: Set<string>;
  onToggleSave?: (jobId: string) => void;
  isPendingSave?: boolean;
}

/**
 * Responsive grid of job listing cards with paginated offset indicators at the bottom.
 */
export function JobList({
  jobs,
  pagination,
  onPageChange,
  savedJobIds = new Set(),
  onToggleSave,
  isPendingSave = false,
}: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <p className="text-sm text-muted">No jobs found matching your search filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            isSaved={savedJobIds.has(job._id)}
            onToggleSave={onToggleSave}
            isPendingSave={isPendingSave}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-8">
          <span className="text-xs text-muted">
            Showing Page <span className="font-semibold text-ink dark:text-zinc-50">{pagination.page}</span> of{" "}
            <span className="font-semibold text-ink dark:text-zinc-50">{pagination.totalPages}</span> (
            <span className="font-semibold text-ink dark:text-zinc-50">{pagination.total}</span> jobs total)
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobList;
