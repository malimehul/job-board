"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recruiterProfileSchema, RecruiterProfileInput } from "../validators/recruiter.validator";
import { Button } from "@/components/ui/button";
import { RECRUITER_TEXT } from "../constants/recruiter-text.constants";

interface RecruiterProfileFormProps {
  initialData: {
    name: string;
    companyName?: string;
    companyWebsite?: string;
  };
  onSubmit: (data: RecruiterProfileInput) => void;
  isPending: boolean;
  error: Error | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema?: z.ZodType<any, any, any>;
}

/**
 * Reusable Recruiter Profile and Onboarding Form.
 * Validates recruiter's name, company name, and optionally company website URL.
 */
export function RecruiterProfileForm({
  initialData,
  onSubmit,
  isPending,
  error,
  validationSchema,
}: RecruiterProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterProfileInput>({
    resolver: zodResolver(validationSchema || recruiterProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      companyName: initialData.companyName || "",
      companyWebsite: initialData.companyWebsite || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div className="p-3 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || RECRUITER_TEXT.profileForm.errorMsg}
        </div>
      )}

      {/* 1. Full Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {RECRUITER_TEXT.profileForm.nameLabel} <span className="text-error">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder={RECRUITER_TEXT.profileForm.namePlaceholder}
          {...register("name")}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
        </div>
      </div>

      {/* 2. Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {RECRUITER_TEXT.profileForm.companyLabel}
        </label>
        <input
          id="companyName"
          type="text"
          placeholder={RECRUITER_TEXT.profileForm.companyPlaceholder}
          {...register("companyName")}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.companyName && <p className="text-xs text-error">{errors.companyName.message}</p>}
        </div>
      </div>

      {/* 3. Company Website URL */}
      <div>
        <label htmlFor="companyWebsite" className="block text-sm font-semibold text-text dark:text-zinc-350 mb-1">
          {RECRUITER_TEXT.profileForm.websiteLabel}
        </label>
        <input
          id="companyWebsite"
          type="url"
          placeholder={RECRUITER_TEXT.profileForm.websitePlaceholder}
          {...register("companyWebsite")}
          className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
        <div className="min-h-[1.25rem] mt-1">
          {errors.companyWebsite && <p className="text-xs text-error">{errors.companyWebsite.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isPending} className="w-full cursor-pointer h-10 font-semibold mt-2">
        {isPending ? RECRUITER_TEXT.profileForm.submittingBtn : RECRUITER_TEXT.profileForm.submitBtn}
      </Button>
    </form>
  );
}

export default RecruiterProfileForm;
