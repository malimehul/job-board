"use client";

import React from "react";
import { Application, User, Job } from "@/types";
import { X, Mail, Briefcase, Award, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApplicationStatusSelect from "@/components/ui/application-status-select";
import { APPLICATION_TEXT } from "../constants/application-text.constants";

interface ApplicantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  role: "Candidate" | "Recruiter";
  onStatusChange?: (newStatus: string) => void;
  isUpdatingStatus?: boolean;
}

/**
 * Premium slide-over ApplicantDrawer component.
 * Displays candidate details, cover letters, resume attachments, and screening actions.
 */
export function ApplicantDrawer({
  isOpen,
  onClose,
  application,
  role,
  onStatusChange,
  isUpdatingStatus = false,
}: ApplicantDrawerProps) {
  if (!isOpen) return null;

  const candidate = application.candidateId as User;
  const job = application.jobId as Job;
  const profile = candidate?.profile;

  // Resolve recruiter details
  const companyName =
    job && typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
      : APPLICATION_TEXT.drawer.confidentialRecruiter;

  // Generate initials for avatar fallback representation
  const initials =
    role === "Recruiter" && candidate?.name
      ? candidate.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "CA";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between animate-slide-left h-full">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Top Close Row */}
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
              <h2 className="text-md font-bold text-ink dark:text-zinc-50">
                {role === "Recruiter" ? APPLICATION_TEXT.drawer.titleRecruiter : APPLICATION_TEXT.drawer.titleCandidate}
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile/Vacancy Card Header */}
            {role === "Recruiter" && candidate ? (
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
                <div className="h-12 w-12 bg-primary/10 text-primary font-bold text-md rounded-full flex items-center justify-center shrink-0 border border-primary/10">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-ink dark:text-zinc-50 truncate">
                    {candidate.name}
                  </h3>
                  <p className="text-xxs text-muted mt-0.5 flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0 text-zinc-400" />
                    {candidate.email}
                  </p>
                </div>
              </div>
            ) : (
              job && (
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55 space-y-1">
                  <span className="text-xxs font-bold text-primary uppercase tracking-wider block">
                    {APPLICATION_TEXT.drawer.appliedPositionHeader}
                  </span>
                  <h3 className="text-sm font-extrabold text-ink dark:text-zinc-50 truncate leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xxs text-muted">{companyName}</p>
                </div>
              )
            )}

            {/* Screening Status Selector (For Recruiters) */}
            {role === "Recruiter" && onStatusChange && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
                <label className="block text-xxs font-bold text-muted uppercase tracking-wider mb-2">
                  {APPLICATION_TEXT.drawer.updateScreeningStatusLabel}
                </label>
                <ApplicationStatusSelect
                  currentStatus={application.status}
                  onChange={onStatusChange}
                  disabled={isUpdatingStatus}
                />
              </div>
            )}

            {/* Details Panel */}
            {role === "Recruiter" && profile && (
              <div className="space-y-4 text-xs">
                {/* Professional Title & Experience */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/20 rounded-md border border-zinc-150/10">
                    <Briefcase className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted">Title</p>
                      <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5 truncate">
                        {profile.title || APPLICATION_TEXT.drawer.notSpecified}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/20 rounded-md border border-zinc-150/10">
                    <Award className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted">Experience</p>
                      <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5">
                        {profile.experience !== undefined
                          ? `${profile.experience}${APPLICATION_TEXT.drawer.experienceYearsSuffix}`
                          : APPLICATION_TEXT.drawer.notSpecified}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h4 className="text-xxs font-bold text-muted uppercase tracking-wider mb-1.5">
                      {APPLICATION_TEXT.drawer.biographyHeader}
                    </h4>
                    <p className="text-xs text-text dark:text-zinc-355 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-md border border-zinc-150/10 leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h4 className="text-xxs font-bold text-muted uppercase tracking-wider mb-2">
                      {APPLICATION_TEXT.drawer.technicalSkillsHeader}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-650 dark:text-zinc-350"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <div>
                <h4 className="text-xxs font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  {APPLICATION_TEXT.drawer.submittedCoverLetterHeader}
                </h4>
                <p className="text-xs text-text dark:text-zinc-355 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-md border border-zinc-150/10 leading-relaxed whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Resume attachment details */}
            {role === "Recruiter" && profile?.resumeUrl && (
              <div className="p-4 border border-success/30 bg-success-light/10 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink dark:text-zinc-50">{APPLICATION_TEXT.drawer.resumeAttachmentHeader}</p>
                    <p className="text-[10px] text-muted mt-0.5">{APPLICATION_TEXT.drawer.resumeAttachmentSub}</p>
                  </div>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="cursor-pointer h-8 px-3 text-xs flex items-center gap-1 border-success/30 text-success hover:bg-success-light/20">
                      <FileDown className="h-4 w-4" />
                      {APPLICATION_TEXT.drawer.downloadBtn}
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Drawer Footer info */}
          <div className="bg-zinc-50 dark:bg-zinc-850/50 p-6 border-t border-zinc-150 dark:border-zinc-800/80 text-center text-[10px] text-muted">
            {APPLICATION_TEXT.drawer.appliedOnFooter(
              new Date(application.appliedAt).toLocaleDateString(),
              new Date(application.appliedAt).toLocaleTimeString()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ApplicantDrawer;
