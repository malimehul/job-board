"use client";

import React, { useState } from "react";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

interface JobTableProps {
  jobs: Job[];
}

export function JobTable({ jobs }: JobTableProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <p className="text-sm text-muted">No jobs found matching the selected filters.</p>
      </div>
    );
  }

  // Safely extract recruiter details
  const getRecruiterName = (job: Job) => {
    if (typeof job.recruiterId === "object" && job.recruiterId !== null) {
      return job.recruiterId.name || "Unknown Recruiter";
    }
    return "Unknown Recruiter";
  };

  const getCompanyName = (job: Job) => {
    if (typeof job.recruiterId === "object" && job.recruiterId !== null && job.recruiterId.profile) {
      return job.recruiterId.profile.companyName || "N/A";
    }
    return "N/A";
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-250/60 dark:border-zinc-800 text-xxs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Job Details</th>
                <th className="px-6 py-4">Recruiter / Company</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Job Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-ink dark:text-zinc-250">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50">{job.title}</div>
                    <div className="text-xs text-muted mt-0.5">
                      Salary: ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-medium">{getRecruiterName(job)}</div>
                    <div className="text-xs text-muted mt-0.5">{getCompanyName(job)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle text-muted">{job.location}</td>
                  <td className="px-6 py-4 align-middle">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-300">
                      {job.jobType}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        job.status === "open"
                          ? "bg-success-light/20 text-success"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {job.status === "open" ? "Active" : "Closed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                      className="cursor-pointer text-xs border-zinc-200 dark:border-zinc-800"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 inline" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Job details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 shadow-xl px-6 py-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xxs uppercase tracking-wider font-extrabold text-primary">
                  Job details (Read-Only)
                </span>
                <h2 className="font-extrabold text-lg text-ink dark:text-zinc-50">
                  {selectedJob.title}
                </h2>
              </div>
              <button onClick={() => setSelectedJob(null)}>
                <X className="h-5 w-5 text-muted hover:text-ink cursor-pointer" />
              </button>
            </div>

            <div className="py-5 space-y-6 text-sm text-text dark:text-zinc-300">
              {/* Job Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-850 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-muted block">Location</span>
                  <span className="font-semibold text-ink dark:text-zinc-200">{selectedJob.location}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Job Type</span>
                  <span className="font-semibold text-ink dark:text-zinc-200">{selectedJob.jobType}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Salary Range</span>
                  <span className="font-semibold text-ink dark:text-zinc-200">
                    ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Experience</span>
                  <span className="font-semibold text-ink dark:text-zinc-200">
                    {selectedJob.experienceMin} - {selectedJob.experienceMax} years
                  </span>
                </div>
              </div>

              {/* Recruiter Section */}
              <div>
                <h4 className="font-bold text-ink dark:text-zinc-100 border-b pb-1 mb-2">Recruiter Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted block">Contact Name</span>
                    <span className="font-medium text-ink dark:text-zinc-200">{getRecruiterName(selectedJob)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block">Company Name</span>
                    <span className="font-medium text-ink dark:text-zinc-200">{getCompanyName(selectedJob)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-ink dark:text-zinc-100 border-b pb-1 mb-2">Description</h4>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-bold text-ink dark:text-zinc-100 border-b pb-1 mb-2">Skills Required</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedJob.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-105 dark:bg-zinc-800 text-ink dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button onClick={() => setSelectedJob(null)} className="cursor-pointer">
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JobTable;
