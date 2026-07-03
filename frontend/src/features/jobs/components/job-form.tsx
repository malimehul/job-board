"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Job } from "@/types";
import { jobFormSchema, JobFormInput, JobPayload } from "../validators/job.validator";
import { Button } from "@/components/ui/button";
import { JOB_TYPES } from "../constants/job.constants";
import { JOB_TEXT } from "../constants/job-text.constants";

interface JobFormProps {
  initialJob?: Job;
  onSubmit: (payload: JobPayload) => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Dual-purpose Job form (Create and Edit).
 * Parses dates, formats comma-separated skills to string arrays, and enforces salary constraints.
 */
export function JobForm({ initialJob, onSubmit, isPending, error }: JobFormProps) {
  // Pre-populate defaults in edit mode
  const defaultValues: Partial<JobFormInput> = {
    title: initialJob?.title || "",
    description: initialJob?.description || "",
    skills: initialJob?.skills ? initialJob.skills.join(", ") : "",
    salaryMin: initialJob?.salaryMin ?? undefined,
    salaryMax: initialJob?.salaryMax ?? undefined,
    experienceMin: initialJob?.experienceMin ?? undefined,
    experienceMax: initialJob?.experienceMax ?? undefined,
    jobType: (initialJob?.jobType as JobPayload["jobType"]) || "Full-time",
    location: initialJob?.location || "",
    applicationDeadline: initialJob?.applicationDeadline
      ? new Date(initialJob.applicationDeadline).toISOString().split("T")[0]
      : "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormInput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: defaultValues as Record<string, unknown>,
  });

  const handleFormSubmit = (data: JobFormInput) => {
    // Format payload for backend specifications
    const formattedPayload = {
      title: data.title,
      description: data.description,
      skills: data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: Number(data.salaryMin),
      salaryMax: Number(data.salaryMax),
      experienceMin: Number(data.experienceMin),
      experienceMax: Number(data.experienceMax),
      jobType: data.jobType,
      location: data.location,
      applicationDeadline: new Date(data.applicationDeadline).toISOString(),
    };
    onSubmit(formattedPayload);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8 max-w-2xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold text-ink dark:text-zinc-50 border-b border-zinc-150 dark:border-zinc-800/80 pb-4 mb-6">
        {initialJob ? JOB_TEXT.form.titleEdit : JOB_TEXT.form.titleCreate}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || JOB_TEXT.form.errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        {/* 1. Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
            {JOB_TEXT.form.jobTitleLabel} <span className="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder={JOB_TEXT.form.jobTitlePlaceholder}
            {...register("title")}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          <div className="min-h-[1.25rem] mt-1">
            {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
          </div>
        </div>

        {/* 2. Job Type and Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jobType" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.jobTypeLabel} <span className="text-error">*</span>
            </label>
            <select
              id="jobType"
              {...register("jobType")}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">
                  {type}
                </option>
              ))}
            </select>
            <div className="min-h-[1.25rem] mt-1">
              {errors.jobType && <p className="text-xs text-error">{errors.jobType.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.locationLabel} <span className="text-error">*</span>
            </label>
            <input
              id="location"
              type="text"
              placeholder={JOB_TEXT.form.locationPlaceholder}
              {...register("location")}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.location && <p className="text-xs text-error">{errors.location.message}</p>}
            </div>
          </div>
        </div>

        {/* 3. Experience Required Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="experienceMin" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.minExperienceLabel} <span className="text-error">*</span>
            </label>
            <input
              id="experienceMin"
              type="number"
              min="0"
              placeholder={JOB_TEXT.form.minExperiencePlaceholder}
              {...register("experienceMin", { valueAsNumber: true })}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.experienceMin && <p className="text-xs text-error">{errors.experienceMin.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="experienceMax" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.maxExperienceLabel} <span className="text-error">*</span>
            </label>
            <input
              id="experienceMax"
              type="number"
              min="0"
              placeholder={JOB_TEXT.form.maxExperiencePlaceholder}
              {...register("experienceMax", { valueAsNumber: true })}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.experienceMax && <p className="text-xs text-error">{errors.experienceMax.message}</p>}
            </div>
          </div>
        </div>

        {/* 4. Salary Range Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salaryMin" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.minSalaryLabel} <span className="text-error">*</span>
            </label>
            <input
              id="salaryMin"
              type="number"
              min="0"
              placeholder={JOB_TEXT.form.minSalaryPlaceholder}
              {...register("salaryMin", { valueAsNumber: true })}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.salaryMin && <p className="text-xs text-error">{errors.salaryMin.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="salaryMax" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
              {JOB_TEXT.form.maxSalaryLabel} <span className="text-error">*</span>
            </label>
            <input
              id="salaryMax"
              type="number"
              min="0"
              placeholder={JOB_TEXT.form.maxSalaryPlaceholder}
              {...register("salaryMax", { valueAsNumber: true })}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.salaryMax && <p className="text-xs text-error">{errors.salaryMax.message}</p>}
            </div>
          </div>
        </div>

        {/* 4. Application Deadline */}
        <div>
          <label htmlFor="applicationDeadline" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
            {JOB_TEXT.form.deadlineLabel} <span className="text-error">*</span>
          </label>
          <input
            id="applicationDeadline"
            type="date"
            {...register("applicationDeadline")}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          <div className="min-h-[1.25rem] mt-1">
            {errors.applicationDeadline && (
              <p className="text-xs text-error">{errors.applicationDeadline.message}</p>
            )}
          </div>
        </div>

        {/* 5. Required Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
            {JOB_TEXT.form.skillsLabel} <span className="text-error">*</span>
          </label>
          <input
            id="skills"
            type="text"
            placeholder={JOB_TEXT.form.skillsPlaceholder}
            {...register("skills")}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          <div className="min-h-[1.25rem] mt-1">
            {errors.skills && <p className="text-xs text-error">{errors.skills.message}</p>}
          </div>
        </div>

        {/* 6. Job Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-text dark:text-zinc-300 mb-1">
            {JOB_TEXT.form.descriptionLabel} <span className="text-error">*</span>
          </label>
          <textarea
            id="description"
            rows={8}
            placeholder={JOB_TEXT.form.descriptionPlaceholder}
            {...register("description")}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white resize-none"
          />
          <div className="min-h-[1.25rem] mt-1">
            {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
          </div>
        </div>

        {/* Submit Buttons */}
        <Button type="submit" disabled={isPending} className="w-full cursor-pointer h-10">
          {isPending
            ? JOB_TEXT.form.submittingBtn
            : initialJob
            ? JOB_TEXT.form.submitBtnEdit
            : JOB_TEXT.form.submitBtnCreate}
        </Button>
      </form>
    </div>
  );
}

export default JobForm;
