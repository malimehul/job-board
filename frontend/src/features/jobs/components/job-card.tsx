"use client";

import React from "react";
import Link from "next/link";
import { Job, User } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Bookmark, MapPin, Briefcase, Calendar, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  isPendingSave?: boolean;
}

/**
 * Premium JobCard component showing title, company profile info, salary ranges,
 * location badges, and optional candidate bookmark controls.
 */
export function JobCard({ job, isSaved = false, onToggleSave, isPendingSave = false }: JobCardProps) {
  const { user } = useAuthStore();
  const isCandidate = user?.role === "Candidate";

  // Safely extract company name if recruiterId is populated
  const companyName =
    typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
      : "Confidential Recruiter";

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave && !isPendingSave) {
      onToggleSave(job._id);
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-primary-light/10 text-primary dark:bg-primary-light/5";
      case "part-time":
        return "bg-success-light/20 text-success dark:bg-success-light/5 dark:text-success";
      case "contract":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      case "internship":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400";
      default:
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-card hover:border-primary dark:hover:border-primary/50 transition-all flex flex-col justify-between relative group">
      <div>
        {/* Title row */}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <Link href={`/jobs/${job._id}`} className="block">
              <h3 className="text-lg font-bold text-ink dark:text-zinc-50 group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
            </Link>
            <p className="text-sm font-semibold text-muted mt-1 truncate">
              {companyName}
            </p>
          </div>

          {/* Bookmark Button - Only shown to Candidates */}
          {isCandidate && onToggleSave && (
            <button
              onClick={handleBookmarkClick}
              disabled={isPendingSave}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? "bg-primary-light/10 border-primary text-primary dark:bg-primary-light/5"
                  : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 hover:border-primary hover:text-primary"
              }`}
              aria-label={isSaved ? "Remove bookmark" : "Bookmark job"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
            </button>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted mt-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
            <span className={`px-2 py-0.5 rounded-full font-semibold ${getJobTypeColor(job.jobType)}`}>
              {job.jobType}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-400">₹</span>
            <span>
              {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-zinc-400" />
            <span>{job.experienceMin} - {job.experienceMax} Yrs</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-muted line-clamp-2 mt-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Required */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="inline-block px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-150/10"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Posted Time */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-6 flex justify-between items-center text-xxs text-muted">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
        </div>
        <span>Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
      </div>
    </div>
  );
}

export default JobCard;
