"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse, User } from "@/types";
import { ProfileOverview } from "@/features/candidate/components/profile-overview";
import { ProfileForm } from "@/features/candidate/components/profile-form";
import { SkillsManager } from "@/features/candidate/components/skills-manager";
import { ResumeManager } from "@/features/candidate/components/resume-manager";
import { CandidateProfileInput } from "@/features/candidate/validators/candidate.validator";
import { User as UserIcon, Settings, Award, FileText, CheckCircle2 } from "lucide-react";

export default function CandidateProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "skills" | "resume">("overview");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Basic details update mutation
  const { mutate: updateProfile, isPending: isUpdatingProfile, error: profileError } = useMutation({
    mutationFn: async (data: CandidateProfileInput) => {
      const payload = {
        name: data.name,
        profile: {
          title: data.title || "",
          bio: data.bio || "",
          experience: data.experience !== undefined ? Number(data.experience) : undefined,
          skills: user?.profile?.skills || [], // Retain existing skills
          resumeUrl: user?.profile?.resumeUrl || "", // Retain existing resume
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
        setFeedback({ type: "success", message: "Profile details updated successfully!" });
        setActiveTab("overview");
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      }
    },
  });

  // 2. Skills list update mutation
  const { mutate: updateSkills, isPending: isUpdatingSkills } = useMutation({
    mutationFn: async (skills: string[]) => {
      const payload = {
        profile: {
          ...user?.profile,
          skills,
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
        setFeedback({ type: "success", message: "Skills updated successfully!" });
        setActiveTab("overview");
      }
    },
  });

  // 3. Resume upload mutation
  const { mutate: uploadResume, isPending: isUploadingResume, error: resumeError } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await apiClient.post<ApiResponse<{ user: User; resumeUrl: string }>>(
        API_ENDPOINTS.AUTH.UPLOAD_RESUME,
        formData
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.status === "success" && response.data.user) {
        setAuth(response.data.user, accessToken || "", refreshToken || "");
        setFeedback({ type: "success", message: "Resume uploaded and synchronized successfully!" });
        setActiveTab("overview");
      }
    },
  });

  const handleProfileSubmit = (data: CandidateProfileInput) => {
    setFeedback(null);
    updateProfile(data);
  };

  const handleSkillsSave = (skills: string[]) => {
    setFeedback(null);
    updateSkills(skills);
  };

  const handleResumeUpload = (file: File) => {
    setFeedback(null);
    uploadResume(file);
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
        <p className="text-sm text-muted">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
          Candidate Profile Manager
        </h1>
        <p className="text-xs text-muted mt-1">
          Review your biography details, technical qualifications, and resume file attachments.
        </p>
      </div>

      {/* Action Status Feedback */}
      {feedback && (
        <div className="p-4 bg-success-light/20 border border-success text-success text-sm font-semibold rounded-md flex gap-2 items-center">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar Drawer */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible divide-x lg:divide-x-0 lg:divide-y divide-zinc-200 dark:divide-zinc-800">
            {/* Overview */}
            <button
              onClick={() => {
                setFeedback(null);
                setActiveTab("overview");
              }}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-zinc-50 dark:bg-zinc-800/60 text-primary border-b-2 lg:border-b-0 lg:border-l-2 border-primary"
                  : "text-zinc-500 hover:text-ink dark:hover:text-zinc-300"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Overview</span>
            </button>

            {/* Edit details */}
            <button
              onClick={() => {
                setFeedback(null);
                setActiveTab("edit");
              }}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "edit"
                  ? "bg-zinc-50 dark:bg-zinc-800/60 text-primary border-b-2 lg:border-b-0 lg:border-l-2 border-primary"
                  : "text-zinc-500 hover:text-ink dark:hover:text-zinc-300"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Edit Details</span>
            </button>

            {/* Manage Skills */}
            <button
              onClick={() => {
                setFeedback(null);
                setActiveTab("skills");
              }}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "skills"
                  ? "bg-zinc-50 dark:bg-zinc-800/60 text-primary border-b-2 lg:border-b-0 lg:border-l-2 border-primary"
                  : "text-zinc-500 hover:text-ink dark:hover:text-zinc-300"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Manage Skills</span>
            </button>

            {/* Upload Resume */}
            <button
              onClick={() => {
                setFeedback(null);
                setActiveTab("resume");
              }}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "resume"
                  ? "bg-zinc-50 dark:bg-zinc-800/60 text-primary border-b-2 lg:border-b-0 lg:border-l-2 border-primary"
                  : "text-zinc-500 hover:text-ink dark:hover:text-zinc-300"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Upload Resume</span>
            </button>
          </nav>
        </div>

        {/* Dynamic Details Content Panel */}
        <div className="lg:col-span-3">
          {activeTab === "overview" && (
            <ProfileOverview user={user} onEditClick={() => setActiveTab("edit")} />
          )}

          {activeTab === "edit" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                Personal Information
              </h2>
              <ProfileForm
                initialData={{
                  name: user.name,
                  title: user.profile?.title,
                  experience: user.profile?.experience,
                  bio: user.profile?.bio,
                }}
                onSubmit={handleProfileSubmit}
                isPending={isUpdatingProfile}
                error={profileError}
              />
            </div>
          )}

          {activeTab === "skills" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-2">
                Manage Professional Skills
              </h2>
              <p className="text-xs text-muted mb-6">
                Add skills representing your technical experience (e.g. programming languages, libraries, platforms).
              </p>
              <SkillsManager
                initialSkills={user.profile?.skills || []}
                onSave={handleSkillsSave}
                isPending={isUpdatingSkills}
              />
            </div>
          )}

          {activeTab === "resume" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-2">
                Curriculum Vitae / Resume
              </h2>
              <p className="text-xs text-muted mb-6">
                Upload your latest resume as a PDF file. The file is shared with recruiters when submitting job applications.
              </p>
              <ResumeManager
                resumeUrl={user.profile?.resumeUrl}
                onUpload={handleResumeUpload}
                isPending={isUploadingResume}
                error={resumeError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
