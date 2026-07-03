"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse, User } from "@/types";
import { RecruiterProfileForm } from "@/features/recruiter/components/recruiter-profile-form";
import { RecruiterProfileInput } from "@/features/recruiter/validators/recruiter.validator";
import { Building2, Globe, Mail, User as UserIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecruiterProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Profile details update mutation
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
        setAuth(response.data.user, accessToken || "", refreshToken || "");
        setFeedback({ type: "success", message: "Company profile updated successfully!" });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      }
    },
  });

  const handleFormSubmit = (data: RecruiterProfileInput) => {
    setFeedback(null);
    updateProfile(data);
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
        <p className="text-sm text-muted">You must be logged in to view this page.</p>
      </div>
    );
  }

  const profile = user.profile;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CO";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
          Company Profile Manager
        </h1>
        <p className="text-xs text-muted mt-1">
          Review and update company information and recruiter contact profiles.
        </p>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className="p-4 bg-success-light/20 border border-success text-success text-sm font-semibold rounded-md flex gap-2 items-center">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
        {isEditing ? (
          /* Form Editor Panel */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50">Edit Company Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeedback(null);
                  setIsEditing(false);
                }}
                className="cursor-pointer text-xs h-8"
              >
                Cancel
              </Button>
            </div>
            <RecruiterProfileForm
              initialData={{
                name: user.name,
                companyName: profile?.companyName,
                companyWebsite: profile?.companyWebsite,
              }}
              onSubmit={handleFormSubmit}
              isPending={isPending}
              error={error}
            />
          </div>
        ) : (
          /* Details Overview Card */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center pb-6 border-b border-zinc-150 dark:border-zinc-800/80">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 text-primary font-bold text-xl rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink dark:text-zinc-55">
                    {profile?.companyName || "Acme Corporation"}
                  </h2>
                  <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                    {user.name} (Recruiter Account)
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setFeedback(null);
                  setIsEditing(true);
                }}
                className="cursor-pointer text-xs h-9 px-4 font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <span>Edit Profile</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid containing Contact/Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Contact Email */}
              <div className="flex items-center gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Contact Email</p>
                  <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5 truncate">{user.email}</p>
                </div>
              </div>

              {/* Company Website */}
              <div className="flex items-center gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
                <Globe className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Website URL</p>
                  {profile?.companyWebsite ? (
                    <a
                      href={profile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline mt-0.5 block truncate"
                    >
                      {profile.companyWebsite}
                    </a>
                  ) : (
                    <p className="text-ink dark:text-zinc-350 mt-0.5 italic">Not Specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Name Overview */}
            <div className="flex items-center gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xxs font-semibold text-muted uppercase tracking-wider">Company Legal Name</p>
                <p className="font-semibold text-ink dark:text-zinc-200 mt-0.5">
                  {profile?.companyName || "Not Specified"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
