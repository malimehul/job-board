"use client";

import React from "react";
import { DashboardLayout, NavigationItem } from "@/components/layouts/dashboard-layout";
import { LayoutDashboard, Users, Briefcase, FileText } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";

const adminNavigation: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Manage Applications", icon: FileText },
];

/**
 * Admin Area Layout mapping role-specific sidebars.
 */
export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout role="Admin" navigationItems={adminNavigation}>
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
