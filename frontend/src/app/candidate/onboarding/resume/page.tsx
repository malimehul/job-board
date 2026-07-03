"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/providers/auth-provider";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import OnboardingStepper from "@/components/ui/onboarding-stepper";
import { LogOut } from "lucide-react";
import { ApiResponse, User } from "@/types";
import ResumeManager from "@/features/candidate/components/resume-manager";

interface ResumeUploadResponse {
  resumeUrl: string;
  user: User;
}

export default function ResumeOnboardingPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { setAuth, accessToken, refreshToken } = useAuthStore();

  const { mutate: uploadResume, isPending, error: apiError } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await apiClient.post<ApiResponse<ResumeUploadResponse>>(
        API_ENDPOINTS.AUTH.UPLOAD_RESUME,
        formData
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.status === "success" && response.data.user) {
        // Sync local store and cookies with the newly returned profile record
        setAuth(response.data.user, accessToken || "", refreshToken || "");

        // Onboarding completed, redirect to jobs board
        router.push("/jobs");
      }
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row with Logout Option */}
      <div className="max-w-3xl w-full mx-auto flex justify-between items-center mb-8">
        <span className="text-sm font-semibold tracking-wide uppercase text-primary">
          Job Portal Onboarding
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors focus-visible:outline-hidden"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800 p-8">
        <OnboardingStepper currentStep={2} />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-zinc-50">
            Upload Your Resume
          </h1>
          <p className="text-sm text-muted mt-2">
            Upload a PDF of your resume to complete your application setup
          </p>
        </div>

        <ResumeManager onUpload={uploadResume} isPending={isPending} error={apiError} />
      </div>

      <div className="text-center text-xs text-muted mt-8">
        &copy; {new Date().getFullYear()} Job Portal. All rights reserved.
      </div>
    </div>
  );
}
