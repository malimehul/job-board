"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, ApiResponse } from "@/types";
import JobForm from "@/features/jobs/components/job-form";
import { JobPayload } from "@/features/jobs/validators/job.validator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default function EditJobPage({ params }: PageParams) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch current Job details
  const { data: jobResponse, isLoading, error: fetchError } = useQuery({
    queryKey: ["job-details", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ job: Job }>>(
        API_ENDPOINTS.JOBS.DETAIL(id)
      );
      return response.data;
    },
  });

  // 2. Mutation for updating Job listing
  const { mutate: updateJob, isPending, error: updateError } = useMutation({
    mutationFn: async (payload: JobPayload) => {
      const response = await apiClient.put<ApiResponse<{ job: Job }>>(
        API_ENDPOINTS.JOBS.DETAIL(id),
        payload
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate queries so dashboards show updated name
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-details", id] });
      router.push("/recruiter/dashboard");
    },
  });

  const handleSubmit = (formattedPayload: JobPayload) => {
    updateJob(formattedPayload);
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

      {fetchError ? (
        <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md max-w-2xl mx-auto">
          Failed to fetch job details. Please confirm listing exists.
        </div>
      ) : isLoading || !jobResponse?.job ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 animate-pulse h-96 max-w-2xl mx-auto" />
      ) : (
        <JobForm
          initialJob={jobResponse.job}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={updateError}
        />
      )}
    </div>
  );
}
