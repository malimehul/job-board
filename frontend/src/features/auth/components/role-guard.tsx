"use client";

import React from "react";
import { useAuthStore } from "@/store/auth-store";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"Candidate" | "Recruiter" | "Admin">;
  fallback?: React.ReactNode;
}

/**
 * Reusable client-side helper to restrict component nodes
 * to specific authenticated user roles (e.g., Admin or Recruiter).
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in or role is not allowed, render fallback content
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;
