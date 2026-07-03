"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/providers/auth-provider";
import { onboardingProfileSchema, OnboardingProfileInput } from "@/features/auth/validators";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Button } from "@/components/ui/button";
import OnboardingStepper from "@/components/ui/onboarding-stepper";
import { LogOut, Plus, X } from "lucide-react";
import { ApiResponse, User } from "@/types";

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  
  // State for interactive skills tags list
  const [skillsList, setSkillsList] = useState<string[]>(
    user?.profile?.skills || []
  );
  const [newSkillInput, setNewSkillInput] = useState("");
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingProfileInput>({
    resolver: zodResolver(onboardingProfileSchema),
    defaultValues: {
      title: user?.profile?.title || "",
      bio: user?.profile?.bio || "",
      experience: user?.profile?.experience ?? undefined,
      skills: user?.profile?.skills ? user.profile.skills.join(", ") : "",
    },
  });

  // Keep React Hook Form in sync when skills tags are modified
  useEffect(() => {
    setValue("skills", skillsList.join(", "), { shouldValidate: true });
  }, [skillsList, setValue]);

  const handleAddSkill = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setSkillsError(null);
    const value = newSkillInput.trim();

    if (!value) {
      setSkillsError("Skill name cannot be empty.");
      return;
    }

    if (skillsList.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillsError("Skill is already added.");
      return;
    }

    setSkillsList([...skillsList, value]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, idx) => idx !== index));
  };

  const { mutate: updateProfile, isPending, error } = useMutation({
    mutationFn: async (data: OnboardingProfileInput) => {
      const payload = {
        profile: {
          title: data.title,
          bio: data.bio,
          experience: Number(data.experience),
          skills: skillsList,
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
        router.push("/candidate/onboarding/resume");
      }
    },
  });

  const onSubmit = (data: OnboardingProfileInput) => {
    updateProfile(data);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row with Logout */}
      <div className="max-w-3xl w-full mx-auto flex justify-between items-center mb-8">
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

      <div className="max-w-xl w-full mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800 p-8">
        <OnboardingStepper currentStep={1} />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-zinc-55">
            Professional Profile
          </h1>
          <p className="text-sm text-muted mt-2">
            Tell us about your background and technical skills to get started
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-light border border-error text-error text-sm rounded-md">
            {error.message || "Failed to update profile. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* 1. Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
              Professional Title <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Senior Full-Stack Engineer"
              {...register("title")}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
            </div>
          </div>

          {/* 2. Years of Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
              Years of Experience <span className="text-error">*</span>
            </label>
            <input
              id="experience"
              type="number"
              min="0"
              placeholder="e.g., 5"
              {...register("experience", { valueAsNumber: true })}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.experience && <p className="text-xs text-error">{errors.experience.message}</p>}
            </div>
          </div>

          {/* 3. Skills Badge Manager */}
          <div>
            <label className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
              Technical Skills <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., React, TypeScript, Node.js"
                value={newSkillInput}
                onChange={(e) => {
                  setSkillsError(null);
                  setNewSkillInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                className="cursor-pointer h-10 px-4 border-zinc-250 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            
            <div className="min-h-[1.25rem] mt-1">
              {(skillsError || errors.skills) && (
                <p className="text-xs text-error">{skillsError || errors.skills?.message}</p>
              )}
            </div>

            {/* Badges list */}
            {skillsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3.5 border border-zinc-200/60 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-800/40">
                {skillsList.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-md text-zinc-750 dark:text-zinc-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-zinc-400 hover:text-error cursor-pointer rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Hidden Input field to register validation with react-hook-form */}
            <input type="hidden" {...register("skills")} />
          </div>

          {/* 4. Biography */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
              Short Bio (minimum 10 characters) <span className="text-error">*</span>
            </label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Write a brief professional summary..."
              {...register("bio")}
              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white resize-none"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-10 cursor-pointer mt-4 font-semibold">
            {isPending ? "Saving Profile..." : "Save and Continue"}
          </Button>
        </form>
      </div>

      <div className="text-center text-xs text-muted mt-8">
        &copy; {new Date().getFullYear()} Job Portal. All rights reserved.
      </div>
    </div>
  );
}
