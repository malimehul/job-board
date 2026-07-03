"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout, NavigationItem } from "@/components/layouts/dashboard-layout";
import { LayoutDashboard, Briefcase, User } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";

const recruiterNavigation: NavigationItem[] = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Manage Jobs", icon: Briefcase },
  { href: "/recruiter/profile", label: "Company Profile", icon: User },
];

/**
 * Recruiter Area Layout mapping role-specific sidebars.
 */
export default function RecruiterLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/recruiter/onboarding";

  if (isOnboarding) {
    return <RoleGuard allowedRoles={["Recruiter"]}>{children}</RoleGuard>;
  }

  return (
    <RoleGuard allowedRoles={["Recruiter"]}>
      <DashboardLayout role="Recruiter" navigationItems={recruiterNavigation}>
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
