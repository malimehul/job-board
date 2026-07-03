"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit2, Users, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import DeleteJobModal from "@/features/recruiter/components/delete-Job-modal";

interface JobTableProps {
  jobs: Job[];
  onDelete: (id: string) => void;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  isPendingAction?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

/**
 * Recruiters dashboard table displaying their posted jobs, active listings,
 * and direct management control hooks.
 */
export function JobTable({
  jobs,
  onDelete,
  onClose,
  onReopen,
  isPendingAction = false,
  sortBy = "",
  sortOrder = "desc",
  onSort,
}: JobTableProps) {
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const renderSortIndicator = (field: string) => {
    if (!onSort) return null;
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 text-zinc-400 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1 inline" />
    );
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <p className="text-sm text-muted">No jobs found matching your search filters.</p>
        <Link href="/recruiter/jobs/new" className="mt-4 inline-block">
          <Button size="sm" className="cursor-pointer">Post a Job now</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-250/60 dark:border-zinc-800 text-xxs font-bold text-muted uppercase tracking-wider">
                <th
                  className={`px-6 py-4 ${onSort ? "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-850/80 transition-colors" : ""}`}
                  onClick={() => onSort?.("title")}
                >
                  <div className="flex items-center">
                    <span>Job Details</span>
                    {renderSortIndicator("title")}
                  </div>
                </th>
                <th
                  className={`px-6 py-4 ${onSort ? "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-850/80 transition-colors" : ""}`}
                  onClick={() => onSort?.("location")}
                >
                  <div className="flex items-center">
                    <span>Location</span>
                    {renderSortIndicator("location")}
                  </div>
                </th>
                <th
                  className={`px-6 py-4 ${onSort ? "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-850/80 transition-colors" : ""}`}
                  onClick={() => onSort?.("jobType")}
                >
                  <div className="flex items-center">
                    <span>Job Type</span>
                    {renderSortIndicator("jobType")}
                  </div>
                </th>
                <th
                  className={`px-6 py-4 ${onSort ? "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-850/80 transition-colors" : ""}`}
                  onClick={() => onSort?.("status")}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {renderSortIndicator("status")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-ink dark:text-zinc-250">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50">{job.title}</div>
                    <div className="text-xs text-muted mt-1">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-muted">{job.location}</td>
                  <td className="px-6 py-4 align-middle text-muted">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {job.jobType}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${job.status === "open"
                        ? "bg-success-light/20 text-success"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                    >
                      {job.status === "open" ? "Active" : "Closed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex gap-2 justify-end items-center">
                      {/* View Applicants */}
                      <Link href={`/recruiter/jobs/${job._id}`} title="View Applicants">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer h-8 w-8 p-0 flex items-center justify-center border-zinc-200"
                        >
                          <Users className="h-4 w-4 text-muted" />
                        </Button>
                      </Link>

                      {/* Edit Job */}
                      <Link href={`/recruiter/jobs/${job._id}/edit`} title="Edit Job">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer h-8 w-8 p-0 flex items-center justify-center border-zinc-200"
                        >
                          <Edit2 className="h-4 w-4 text-muted" />
                        </Button>
                      </Link>

                      {/* Close / Reopen Toggle */}
                      {job.status === "open" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onClose(job._id)}
                          disabled={isPendingAction}
                          title="Close Job"
                          className="cursor-pointer h-8 w-8 p-0 flex items-center justify-center border-zinc-200"
                        >
                          <EyeOff className="h-4 w-4 text-muted" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReopen(job._id)}
                          disabled={isPendingAction}
                          title="Reopen Job"
                          className="cursor-pointer h-8 w-8 p-0 flex items-center justify-center border-zinc-200"
                        >
                          <Eye className="h-4 w-4 text-muted" />
                        </Button>
                      )}

                      {/* Delete Job */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setJobToDelete(job._id)}
                        disabled={isPendingAction}
                        title="Delete Job"
                        className="cursor-pointer h-8 w-8 p-0 flex items-center justify-center border-zinc-200 hover:border-error hover:bg-error-light/10 group"
                      >
                        <Trash2 className="h-4 w-4 text-zinc-400 group-hover:text-error" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteJobModal
        open={!!jobToDelete}
        title="Delete Job"
        onClose={() => setJobToDelete(null)}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Are you sure you want to permanently delete this job listing?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setJobToDelete(null)}
            disabled={isPendingAction}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              if (!jobToDelete) return;

              onDelete(jobToDelete);
              setJobToDelete(null);
            }}
            disabled={isPendingAction}
            className="bg-red-600 text-white cursor-pointer hover:bg-red-700"
          >
            Delete Job
          </Button>
        </div>
      </DeleteJobModal>
    </>
  );
}

export default JobTable;
