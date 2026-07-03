"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job, User } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, DollarSign, Calendar, FileText, CheckCircle2, Briefcase } from "lucide-react";
import ApplyModal from "@/features/candidate/components/apply-modal";

interface JobDetailsProps {
  job: Job;
  initialHasApplied?: boolean;
  initialIsBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isPendingBookmark?: boolean;
  isLoadingApps?: boolean;
}

/**
 * Premium JobDetails component rendering complete job descriptions, recruiter profiles,
 * and launches the pop-up cover letter application modal for candidates.
 */
export function JobDetails({
  job,
  initialHasApplied = false,
  initialIsBookmarked = false,
  onToggleBookmark,
  isPendingBookmark = false,
  isLoadingApps = false,
}: JobDetailsProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Synchronize initialHasApplied prop changes to local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasApplied(initialHasApplied);
  }, [initialHasApplied]);

  const isCandidate = user?.role === "Candidate";
  const isGuest = !user;
  const showApplyCard = isCandidate || isGuest;

  const autoApply = searchParams.get("apply") === "true";

  useEffect(() => {
    // Only auto-trigger apply modal if we are done checking existing applications
    if (isLoadingApps) return;

    if (autoApply && isCandidate && !hasApplied) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsApplyModalOpen(true);
      // Clean up URL search parameters to prevent modal reopening on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("apply");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [autoApply, isCandidate, hasApplied, isLoadingApps, router]);

  const handleApplyClick = () => {
    if (isGuest) {
      const fromUrl = `/jobs/${job._id}?apply=true`;
      router.push(`/login?from=${encodeURIComponent(fromUrl)}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  // Safely resolve company names
  const companyName =
    typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
      : "Confidential Recruiter";

  const companyWebsite =
    typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).profile?.companyWebsite
      : undefined;

  const recruiterEmail =
    typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).email
      : undefined;

  const handleApplySuccess = () => {
    setHasApplied(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Details Portlet */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
          {/* Header Row */}
          <div className="flex justify-between items-start gap-4 border-b border-zinc-150 dark:border-zinc-800/80 pb-6">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 bg-primary-light/10 text-primary dark:bg-primary-light/5`}>
                {job.jobType}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
                {job.title}
              </h1>
              <p className="text-md font-semibold text-muted mt-2">
                {companyName}
              </p>
            </div>

            {/* Bookmark button */}
            {isCandidate && onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                disabled={isPendingBookmark}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  initialIsBookmarked ? "bg-primary-light/10 border-primary text-primary" : "bg-transparent border-zinc-250 dark:border-zinc-800 text-zinc-400 hover:border-primary hover:text-primary"
                }`}
                aria-label={initialIsBookmarked ? "Remove saved job" : "Save job"}
              >
                <Bookmark className={`h-5 w-5 ${initialIsBookmarked ? "fill-primary" : ""}`} />
              </button>
            )}
          </div>

          {/* Quick Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-150 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Location</p>
                <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5 truncate">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Salary (INR)</p>
                <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5 truncate">
                  ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Experience</p>
                <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5 truncate">
                  {job.experienceMin} - {job.experienceMax} Years
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Deadline</p>
                <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="py-6 border-b border-zinc-150 dark:border-zinc-800/80">
            <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-3">Job Description</h2>
            <div className="text-sm text-text dark:text-zinc-350 space-y-4 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="py-6">
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-3">Required Technical Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-350 border border-zinc-150/10 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Candidate / Guest Apply Card Form */}
        {showApplyCard && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-3">Application Status</h2>

            {hasApplied ? (
              <div className="mt-3 flex items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-md border border-zinc-200 dark:border-zinc-800">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="text-sm font-medium">You have already applied for this job listing.</span>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-muted mb-4">
                  Please review the qualifications before applying. Once submitted, your profile (including your saved resume) will be shared with the recruiter.
                </p>
                <Button onClick={handleApplyClick} className="w-full cursor-pointer h-10 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Apply Now
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar Recruiter Info Card */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-md font-bold text-ink dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
            Recruiter Profile
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Company Name</p>
              <p className="text-sm font-semibold text-ink dark:text-zinc-200 mt-0.5">{companyName}</p>
            </div>

            {companyWebsite && (
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Website</p>
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline block truncate mt-0.5"
                >
                  {companyWebsite}
                </a>
              </div>
            )}

            {recruiterEmail && (
              <div>
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Contact Email</p>
                <p className="text-sm font-semibold text-ink dark:text-zinc-200 truncate mt-0.5">
                  {recruiterEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal popup */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
}

export default JobDetails;
