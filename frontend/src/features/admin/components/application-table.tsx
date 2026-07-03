"use client";

import React, { useState } from "react";
import { Application } from "@/types";
import { Button } from "@/components/ui/button";
import { Eye, FileText, X } from "lucide-react";

interface ApplicationTableProps {
  applications: Application[];
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <p className="text-sm text-muted">No applications found matching the selected filters.</p>
      </div>
    );
  }

  // Safely extract candidate details
  const getCandidateName = (app: Application) => {
    if (typeof app.candidateId === "object" && app.candidateId !== null) {
      return app.candidateId.name || "Guest Candidate";
    }
    return "Guest Candidate";
  };

  const getCandidateEmail = (app: Application) => {
    if (typeof app.candidateId === "object" && app.candidateId !== null) {
      return app.candidateId.email || "";
    }
    return "";
  };

  const getCandidateResume = (app: Application) => {
    if (typeof app.candidateId === "object" && app.candidateId !== null && app.candidateId.profile) {
      return app.candidateId.profile.resumeUrl || "";
    }
    return "";
  };

  const getCandidateTitle = (app: Application) => {
    if (typeof app.candidateId === "object" && app.candidateId !== null && app.candidateId.profile) {
      return app.candidateId.profile.title || "N/A";
    }
    return "N/A";
  };

  // Safely extract job/recruiter details
  const getJobTitle = (app: Application) => {
    if (typeof app.jobId === "object" && app.jobId !== null) {
      return app.jobId.title || "Unknown Job";
    }
    return "Unknown Job";
  };

  const getRecruiterCompanyName = (app: Application) => {
    if (
      typeof app.jobId === "object" &&
      app.jobId !== null &&
      typeof app.jobId.recruiterId === "object" &&
      app.jobId.recruiterId !== null &&
      app.jobId.recruiterId.profile
    ) {
      return app.jobId.recruiterId.profile.companyName || "N/A";
    }
    return "N/A";
  };

  // Format Status Badge Styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-350";
      case "Shortlisted":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-350";
      case "Interviewed":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-350";
      case "Rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-350";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-500";
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-250/60 dark:border-zinc-800 text-xxs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Applied Job / Recruiter</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-ink dark:text-zinc-250">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {getCandidateName(app)}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{getCandidateEmail(app)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-medium">{getJobTitle(app)}</div>
                    <div className="text-xs text-muted mt-0.5">{getRecruiterCompanyName(app)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-muted">
                    {new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      className="cursor-pointer text-xs border-zinc-200 dark:border-zinc-800"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 inline" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 shadow-xl px-6 py-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xxs uppercase tracking-wider font-extrabold text-primary">
                  Application Submission Detail (Read-Only)
                </span>
                <h2 className="font-extrabold text-lg text-ink dark:text-zinc-50">
                  {getCandidateName(selectedApp)}
                </h2>
              </div>
              <button onClick={() => setSelectedApp(null)}>
                <X className="h-5 w-5 text-muted hover:text-ink cursor-pointer" />
              </button>
            </div>

            <div className="py-5 space-y-6 text-sm text-text dark:text-zinc-300">
              {/* Profile details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-850 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-muted block">Professional Title</span>
                  <span className="font-semibold text-ink dark:text-zinc-200">{getCandidateTitle(selectedApp)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Resume Document</span>
                  {getCandidateResume(selectedApp) ? (
                    <a
                      href={getCandidateResume(selectedApp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1.5 mt-0.5"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span>Download Resume</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted">No resume uploaded</span>
                  )}
                </div>
              </div>

              {/* Submission metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted block">Applied Job</span>
                  <span className="font-medium text-ink dark:text-zinc-200">{getJobTitle(selectedApp)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Employer</span>
                  <span className="font-medium text-ink dark:text-zinc-200">{getRecruiterCompanyName(selectedApp)}</span>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="font-bold text-ink dark:text-zinc-100 border-b pb-1 mb-2">Cover Letter / Note</h4>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-850 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {selectedApp.coverLetter || "No cover letter provided."}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button onClick={() => setSelectedApp(null)} className="cursor-pointer">
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApplicationTable;
