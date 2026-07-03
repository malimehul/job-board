"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateProfileSchema, CandidateProfileInput } from "../validators/candidate.validator";
import { Button } from "@/components/ui/button";
import { CANDIDATE_TEXT } from "../constants/candidate-text.constants";

interface ProfileFormProps {
  initialData: {
    name: string;
    title?: string;
    experience?: number;
    bio?: string;
  };
  onSubmit: (data: CandidateProfileInput) => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Reusable Candidate Profile details form.
 * Enforces validation rules on experience types, bio string lengths, and basic names.
 */
export function ProfileForm({ initialData, onSubmit, isPending, error }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateProfileInput>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      name: initialData.name,
      title: initialData.title || "",
      experience: initialData.experience ?? undefined,
      bio: initialData.bio || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div className="p-3 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || CANDIDATE_TEXT.profileForm.errorMsg}
        </div>
      )}

      {/* 1. Full Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {CANDIDATE_TEXT.profileForm.nameLabel} <span className="text-error">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder={CANDIDATE_TEXT.profileForm.namePlaceholder}
          {...register("name")}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
        </div>
      </div>

      {/* 2. Professional Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {CANDIDATE_TEXT.profileForm.titleLabel}
        </label>
        <input
          id="title"
          type="text"
          placeholder={CANDIDATE_TEXT.profileForm.titlePlaceholder}
          {...register("title")}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
        </div>
      </div>

      {/* 3. Years of Experience */}
      <div>
        <label htmlFor="experience" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {CANDIDATE_TEXT.profileForm.experienceLabel}
        </label>
        <input
          id="experience"
          type="number"
          min="0"
          placeholder={CANDIDATE_TEXT.profileForm.experiencePlaceholder}
          {...register("experience", { valueAsNumber: true })}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.experience && <p className="text-xs text-error">{errors.experience.message}</p>}
        </div>
      </div>

      {/* 4. Biography */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {CANDIDATE_TEXT.profileForm.bioLabel}
        </label>
        <textarea
          id="bio"
          rows={5}
          placeholder={CANDIDATE_TEXT.profileForm.bioPlaceholder}
          {...register("bio")}
          className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white resize-none"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending} className="w-full cursor-pointer h-10 font-semibold mt-2">
        {isPending ? CANDIDATE_TEXT.profileForm.submittingBtn : CANDIDATE_TEXT.profileForm.submitBtn}
      </Button>
    </form>
  );
}

export default ProfileForm;
