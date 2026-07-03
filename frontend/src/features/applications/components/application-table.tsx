"use client";

import React, { useState } from "react";
import { Application, User, Job } from "@/types";
import { StatusBadge } from "./status-badge";
import { StatusModal } from "./status-modal";
import { ApplicantDrawer } from "./applicant-drawer";
import { Button } from "@/components/ui/button";
import { Eye, Settings, Briefcase, Mail, Calendar, Award, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { APPLICATION_TEXT } from "../constants/application-text.constants";

interface ApplicationTableProps {
  role: "Candidate" | "Recruiter";
  applications: Application[];
  isLoading: boolean;
  error: Error | null;
  onStatusChange?: (appId: string, newStatus: string) => void;
  isUpdatingStatus?: boolean;
}

/**
 * Premium, fully responsive ApplicationTable dashboard list.
 * Integrates slide-over drawers, loading skeletons, error states, and empty panels.
 */
export function ApplicationTable({
  role,
  applications,
  isLoading,
  error,
  onStatusChange,
  isUpdatingStatus = false,
}: ApplicationTableProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusChangeApp, setStatusChangeApp] = useState<Application | null>(null);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-xxs">
        <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 animate-pulse">
          <div className="h-4 bg-zinc-300 dark:bg-zinc-700 w-1/4 rounded" />
        </div>
        <div className="p-6 space-y-4 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-zinc-300 dark:bg-zinc-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-300 dark:bg-zinc-700 w-1/3 rounded" />
                <div className="h-3 bg-zinc-300 dark:bg-zinc-700 w-1/4 rounded" />
              </div>
              <div className="h-8 bg-zinc-300 dark:bg-zinc-700 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-455 rounded-lg flex gap-3 items-center text-sm font-semibold">
        <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500" />
        <div>
          <p>{APPLICATION_TEXT.table.failedToQuery}</p>
          <p className="text-xs font-normal text-muted mt-1">{error.message || APPLICATION_TEXT.table.refreshMsg}</p>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (applications.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
        <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-bold text-ink dark:text-zinc-50">{APPLICATION_TEXT.table.noSubmissionsFound}</h3>
        <p className="text-xs text-muted max-w-xs mx-auto mt-1 leading-relaxed">
          {role === "Candidate"
            ? APPLICATION_TEXT.table.emptyCandidateDesc
            : APPLICATION_TEXT.table.emptyRecruiterDesc}
        </p>
        {role === "Candidate" && (
          <Link href="/jobs" className="mt-4 inline-block">
            <Button size="sm" className="cursor-pointer text-xs flex items-center gap-1.5">
              <span>{APPLICATION_TEXT.table.findVacanciesBtn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* A. Responsive Desktop/Tablet Table Grid */}
      <div className="hidden sm:block border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-xxs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-850 text-muted uppercase tracking-wider text-[10px] font-bold border-b border-zinc-150 dark:border-zinc-800">
            <tr>
              {role === "Candidate" ? (
                <>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.position}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.company}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.dateApplied}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.status}</th>
                  <th className="px-6 py-4 text-right">{APPLICATION_TEXT.table.headers.actions}</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.candidate}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.experience}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.dateApplied}</th>
                  <th className="px-6 py-4">{APPLICATION_TEXT.table.headers.status}</th>
                  <th className="px-6 py-4 text-right">{APPLICATION_TEXT.table.headers.actions}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80">
            {applications.map((app) => {
              const job = app.jobId as Job;
              const candidate = app.candidateId as User;

              const companyName =
                job && typeof job.recruiterId === "object" && job.recruiterId !== null
                  ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
                  : APPLICATION_TEXT.drawer.confidentialRecruiter;

              return (
                <tr key={app._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  {role === "Candidate" ? (
                    <>
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink dark:text-zinc-200">
                          {job?.title || APPLICATION_TEXT.table.deletedVacancy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text dark:text-zinc-300">{companyName}</td>
                      <td className="px-6 py-4 text-muted">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="cursor-pointer text-xs h-8 px-2.5 flex items-center gap-1 border-zinc-250 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {APPLICATION_TEXT.table.detailsBtn}
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-bold text-ink dark:text-zinc-200">{candidate?.name}</p>
                          <p className="text-xxs text-muted mt-0.5">{candidate?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text dark:text-zinc-300">
                        {candidate?.profile?.experience !== undefined
                          ? `${candidate.profile.experience}${APPLICATION_TEXT.drawer.experienceYearsSuffix}`
                          : APPLICATION_TEXT.drawer.notSpecified}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            className="cursor-pointer text-xs h-8 px-2.5 flex items-center gap-1 border-zinc-250"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {APPLICATION_TEXT.table.screenBtn}
                          </Button>
                          {onStatusChange && (
                            <button
                              type="button"
                              onClick={() => setStatusChangeApp(app)}
                              className="p-2 border border-zinc-250 dark:border-zinc-800 rounded-md text-zinc-550 dark:text-zinc-400 hover:border-primary hover:text-primary dark:hover:border-primary transition-all cursor-pointer bg-transparent"
                              title={APPLICATION_TEXT.table.updateStatusTooltip}
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* B. Responsive Mobile Card Layout (Stack) */}
      <div className="sm:hidden space-y-3">
        {applications.map((app) => {
          const job = app.jobId as Job;
          const candidate = app.candidateId as User;

          const companyName =
            job && typeof job.recruiterId === "object" && job.recruiterId !== null
              ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
              : APPLICATION_TEXT.drawer.confidentialRecruiter;

          return (
            <div
              key={app._id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 shadow-xxs"
            >
              {/* Header Badge */}
              <div className="flex justify-between items-center gap-2">
                <StatusBadge status={app.status} />
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(app.appliedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title Identity */}
              <div>
                {role === "Candidate" ? (
                  <>
                    <h3 className="text-sm font-bold text-ink dark:text-zinc-100">
                      {job?.title || APPLICATION_TEXT.table.deletedVacancy}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{companyName}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-ink dark:text-zinc-100">{candidate?.name}</h3>
                    <p className="text-xxs text-muted mt-0.5 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {candidate?.email}
                    </p>
                    {candidate?.profile?.experience !== undefined && (
                      <p className="text-xxs text-muted mt-1 flex items-center gap-1">
                        <Award className="h-3 w-3 text-zinc-400" />
                        {candidate.profile.experience}{APPLICATION_TEXT.table.yearsExperienceSuffix}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(app)}
                  className="cursor-pointer text-xs h-8.5 px-3 flex items-center gap-1 border-zinc-250 flex-1 justify-center"
                >
                  <Eye className="h-4 w-4" />
                  <span>{role === "Candidate" ? APPLICATION_TEXT.table.detailsBtn : APPLICATION_TEXT.table.screenBtn}</span>
                </Button>
                {role === "Recruiter" && onStatusChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusChangeApp(app)}
                    className="cursor-pointer text-xs h-8.5 px-3 flex items-center gap-1 border-zinc-250 flex-1 justify-center text-zinc-650"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{APPLICATION_TEXT.table.statusMobileBtn}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* C. Mount slide drawer for detailed candidate preview screening */}
      {selectedApp && (
        <ApplicantDrawer
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          role={role}
          onStatusChange={
            role === "Recruiter" && onStatusChange
              ? (newStatus) => onStatusChange(selectedApp._id, newStatus)
              : undefined
          }
          isUpdatingStatus={isUpdatingStatus}
        />
      )}

      {/* D. Mount status modal for direct grid screening adjustments */}
      {statusChangeApp && onStatusChange && (
        <StatusModal
          isOpen={!!statusChangeApp}
          onClose={() => setStatusChangeApp(null)}
          currentStatus={statusChangeApp.status}
          onUpdate={(newStatus) => onStatusChange(statusChangeApp._id, newStatus)}
          isPending={isUpdatingStatus}
        />
      )}
    </div>
  );
}

export default ApplicationTable;
