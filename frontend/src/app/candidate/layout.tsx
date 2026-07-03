"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout, NavigationItem } from "@/components/layouts/dashboard-layout";
import { LayoutDashboard, Bookmark, FileText, Search, User } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";

const candidateNavigation: NavigationItem[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Find Jobs", icon: Search },
  { href: "/candidate/bookmarks", label: "Saved Jobs", icon: Bookmark },
  { href: "/candidate/applications", label: "My Applications", icon: FileText },
  { href: "/candidate/profile", label: "My Profile", icon: User },
];

/**
 * Candidate Area Layout mapping role-specific sidebars.
 * Automatically excludes layouts on onboarding sub-paths.
 */
export default function CandidateLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/candidate/onboarding");

  // Onboarding screens render without dashboard sidebar wrapper to ensure step progression focus
  if (isOnboarding) {
    return <RoleGuard allowedRoles={["Candidate"]}>{children}</RoleGuard>;
  }

  return (
    <RoleGuard allowedRoles={["Candidate"]}>
      <DashboardLayout role="Candidate" navigationItems={candidateNavigation}>
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
