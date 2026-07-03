"use client";

import React from "react";
import { User } from "@/types";
import { Mail, Briefcase, Award, FileText, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CANDIDATE_TEXT } from "../constants/candidate-text.constants";

interface ProfileOverviewProps {
  user: User;
  onEditClick?: () => void;
}

/**
 * Premium Candidate Profile Overview card display.
 * Maps skills, formats avatar fallback labels, and links to saved resumes.
 */
export function ProfileOverview({ user, onEditClick }: ProfileOverviewProps) {
  const profile = user.profile;

  // Generate initials for avatar fallback representation
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : CANDIDATE_TEXT.profileOverview.avatarFallback;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Top Identity Header Row */}
      <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center pb-6 border-b border-zinc-150 dark:border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 text-primary font-bold text-xl rounded-full flex items-center justify-center border border-primary/20 shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink dark:text-zinc-50">{user.name}</h2>
            <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-zinc-400" />
              {user.email}
            </p>
          </div>
        </div>

        {onEditClick && (
          <Button onClick={onEditClick} className="cursor-pointer text-xs h-9 px-4 font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <span>{CANDIDATE_TEXT.profileOverview.editProfileBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Grid containing Experience and Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
          <Briefcase className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xxs font-semibold text-muted uppercase tracking-wider">{CANDIDATE_TEXT.profileOverview.titleLabel}</p>
            <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5">
              {profile?.title || CANDIDATE_TEXT.profileOverview.notSpecified}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
          <Award className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xxs font-semibold text-muted uppercase tracking-wider">{CANDIDATE_TEXT.profileOverview.experienceLabel}</p>
            <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5">
              {profile?.experience !== undefined
                ? `${profile.experience}${CANDIDATE_TEXT.profileOverview.yearsSuffix}`
                : CANDIDATE_TEXT.profileOverview.notSpecified}
            </p>
          </div>
        </div>
      </div>

      {/* Bio Description */}
      <div>
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{CANDIDATE_TEXT.profileOverview.bioHeader}</h3>
        {profile?.bio ? (
          <p className="text-sm text-text dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        ) : (
          <p className="text-sm text-muted italic">{CANDIDATE_TEXT.profileOverview.noBio}</p>
        )}
      </div>

      {/* Technical Skill Tags */}
      <div>
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{CANDIDATE_TEXT.profileOverview.skillsHeader}</h3>
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-150/10"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted italic">{CANDIDATE_TEXT.profileOverview.noSkills}</p>
        )}
      </div>

      {/* Resume Document Link */}
      <div>
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{CANDIDATE_TEXT.profileOverview.resumeHeader}</h3>
        {profile?.resumeUrl ? (
          <div className="flex items-center justify-between p-4 border border-success/30 bg-success-light/10 rounded-lg max-w-md">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-xs font-bold text-ink dark:text-zinc-50">{CANDIDATE_TEXT.profileOverview.resumePdfTitle}</p>
                <p className="text-[10px] text-muted mt-0.5">{CANDIDATE_TEXT.profileOverview.resumePdfSubtitle}</p>
              </div>
            </div>
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="cursor-pointer h-8 px-3 text-xs flex items-center gap-1 border-success/30 text-success hover:bg-success-light/20">
                <Download className="h-3.5 w-3.5" />
                {CANDIDATE_TEXT.profileOverview.downloadBtn}
              </Button>
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted italic">{CANDIDATE_TEXT.profileOverview.noResume}</p>
        )}
      </div>
    </div>
  );
}

export default ProfileOverview;
