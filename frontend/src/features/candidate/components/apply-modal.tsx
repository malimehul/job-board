"use client";

import React, { useState } from "react";
import { Job, User, ApiResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CANDIDATE_TEXT } from "../constants/candidate-text.constants";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSuccess: () => void;
}

const applySchema = z.object({
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters").max(2000, "Limit to 2000 characters"),
});

type ApplyInput = z.infer<typeof applySchema>;

/**
 * Premium pop-up Apply Modal Dialog overlay.
 * Takes cover letters, runs validation, and posts data to /applications.
 */
export function ApplyModal({ isOpen, onClose, job, onSuccess }: ApplyModalProps) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyInput>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const { mutate: submitApplication, isPending, error } = useMutation({
    mutationFn: async (data: ApplyInput) => {
      const payload = {
        jobId: job._id,
        coverLetter: data.coverLetter,
      };
      const response = await apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.APPLICATIONS.BASE,
        payload
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.status === "success") {
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
        queryClient.invalidateQueries({ queryKey: ["job-details", job._id] });
        reset();
        
        // Let the parent know application is complete after a brief moment
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      }
    },
  });

  const onSubmit = (data: ApplyInput) => {
    submitApplication(data);
  };

  const handleModalClose = () => {
    reset();
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  // Resolve company names
  const companyName =
    typeof job.recruiterId === "object" && job.recruiterId !== null
      ? (job.recruiterId as User).profile?.companyName || (job.recruiterId as User).name
      : CANDIDATE_TEXT.applyModal.confidentialRecruiter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop background blur */}
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleModalClose}
      />

      {/* Modal Container Box */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-card w-full max-w-lg overflow-hidden animate-slide-up z-10 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          /* Success Screen Panel */
          <div className="text-center py-8 space-y-4 animate-scale-up">
            <div className="h-16 w-16 bg-success-light/20 text-success rounded-full flex items-center justify-center mx-auto border border-success/20">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-ink dark:text-zinc-50">{CANDIDATE_TEXT.applyModal.successHeader}</h2>
            <p className="text-sm text-muted max-w-xs mx-auto">
              {CANDIDATE_TEXT.applyModal.successText(companyName)}
            </p>
          </div>
        ) : (
          /* Main Input Form Portal */
          <div className="space-y-5">
            <div>
              <span className="text-xxs font-bold text-primary uppercase tracking-wider block">
                {CANDIDATE_TEXT.applyModal.formTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-ink dark:text-zinc-50 mt-1 leading-tight">
                {job.title}
              </h2>
              <p className="text-xs font-semibold text-muted mt-1">{companyName}</p>
            </div>

            {/* Warning block disclaimer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/55 flex gap-2.5 items-start text-xxs text-muted leading-relaxed">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {CANDIDATE_TEXT.applyModal.warningText(companyName)}
              </span>
            </div>

            {error && (
              <div className="p-3 bg-error-light border border-error text-error text-xs rounded-md">
                {error.message || CANDIDATE_TEXT.applyModal.errorFallback}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="coverLetter" className="block text-xs font-semibold text-text dark:text-zinc-350 mb-1">
                  {CANDIDATE_TEXT.applyModal.coverLetterLabel} <span className="text-error">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  rows={5}
                  placeholder={CANDIDATE_TEXT.applyModal.coverLetterPlaceholder}
                  {...register("coverLetter")}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white resize-none"
                />
                <div className="min-h-[1.25rem] mt-1">
                  {errors.coverLetter && (
                    <p className="text-xs text-error">{errors.coverLetter.message}</p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2 justify-end border-t border-zinc-150 dark:border-zinc-800/80 pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModalClose}
                  className="cursor-pointer text-xs h-9 px-4"
                >
                  {CANDIDATE_TEXT.applyModal.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="cursor-pointer text-xs h-9 px-4 flex items-center gap-1.5 font-semibold"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isPending ? CANDIDATE_TEXT.applyModal.submittingBtn : CANDIDATE_TEXT.applyModal.submitBtn}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default ApplyModal;
