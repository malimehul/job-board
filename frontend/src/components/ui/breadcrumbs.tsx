"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const segmentLabels: Record<string, string> = {
  candidate: "Candidate",
  recruiter: "Recruiter",
  admin: "Admin",
  jobs: "Jobs",
  applications: "Applications",
  bookmarks: "Bookmarks",
  dashboard: "Dashboard",
  new: "New Job",
  users: "Users",
  onboarding: "Onboarding",
  profile: "Profile",
  resume: "Resume",
};

/**
 * Dynamic Breadcrumbs component parsing the URL path segments and formatting them.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium text-muted" aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center hover:text-ink dark:hover:text-zinc-50 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, idx) => {
        const href = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;
        const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={href} className="flex items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
            {isLast ? (
              <span className="text-ink dark:text-zinc-50 font-semibold select-none">
                {label}
              </span>
            ) : (
              <span
                className="text-ink dark:text-zinc-50 transition-colors"
              >
                {label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
