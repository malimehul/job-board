"use client";

import React from "react";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse, User } from "@/types";
import { RecruiterProfileForm } from "@/features/recruiter/components/recruiter-profile-form";
import { RecruiterProfileInput, recruiterOnboardingSchema } from "@/features/recruiter/validators/recruiter.validator";
import { ShieldCheck, Building, LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function RecruiterOnboardingPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Profile update mutation
  const { mutate: updateProfile, isPending, error } = useMutation({
    mutationFn: async (data: RecruiterProfileInput) => {
      const payload = {
        name: data.name,
        profile: {
          ...user?.profile,
          companyName: data.companyName || "",
          companyWebsite: data.companyWebsite || "",
        },
      };

      const response = await apiClient.put<ApiResponse<{ user: User }>>(
        API_ENDPOINTS.AUTH.PROFILE,
        payload
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.status === "success" && response.data.user) {
        // Enforce immediately updating user role and profileCompleted in Zustand & cookies
        setAuth(response.data.user, accessToken || "", refreshToken || "");
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
        // Redirect to recruiter dashboard via hard reload to propagate cookies to middleware
        if (typeof window !== "undefined") {
          window.location.href = "/recruiter/dashboard";
        }
      }
    },
  });

  const handleFormSubmit = (data: RecruiterProfileInput) => {
    updateProfile(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center max-w-sm w-full">
          <p className="text-sm text-muted">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto">
        {/* Top Header Row with Logout */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm font-semibold tracking-wide uppercase text-primary">
            Job Portal Onboarding
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors focus-visible:outline-hidden cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="max-w-xl w-full mx-auto space-y-6">
          {/* Banner Headers */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 mb-3">
              <Building className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
              Recruiter Onboarding
            </h1>
            <p className="text-sm text-muted mt-2">
              To start posting job openings and tracking applicants, please provide your company details.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-zinc-150 dark:border-zinc-850 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-ink dark:text-zinc-250">
                Verify Company Information
              </h2>
            </div>

            <RecruiterProfileForm
              initialData={{
                name: user.name,
                companyName: user.profile?.companyName,
                companyWebsite: user.profile?.companyWebsite,
              }}
              onSubmit={handleFormSubmit}
              isPending={isPending}
              error={error}
              validationSchema={recruiterOnboardingSchema}
            />
          </div>
        </div>
      </div>
      <div></div> {/* Visual Spacer */}
    </div>
  );
}
