"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types";
import JobForm from "@/features/jobs/components/job-form";
import { JobPayload } from "@/features/jobs/validators/job.validator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createJob, isPending, error } = useMutation({
    mutationFn: async (payload: JobPayload) => {
      const response = await apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.JOBS.BASE,
        payload
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate recruiter jobs list query cache
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      // Redirect to recruiter manager dashboard
      router.push("/recruiter/dashboard");
    },
  });

  const handleSubmit = (formattedPayload: JobPayload) => {
    createJob(formattedPayload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/recruiter/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors focus-visible:outline-hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <JobForm onSubmit={handleSubmit} isPending={isPending} error={error} />
    </div>
  );
}
