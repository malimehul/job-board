"use client";

import React, { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, ApiResponse, Application } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApplicationTable } from "@/features/applications/components/application-table";

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Recruiter Job Applicants screening queue page.
 * Fetches applications lists and mounts the unified ApplicationTable dashboard widget.
 */
export default function JobApplicationsPage({ params }: PageParams) {
  const { id: jobId } = use(params);
  const queryClient = useQueryClient();

  // 1. Fetch Job Details to show Title
  const { data: jobResponse } = useQuery({
    queryKey: ["job-details", jobId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ job: Job }>>(
        API_ENDPOINTS.JOBS.DETAIL(jobId)
      );
      return response.data;
    },
  });

  // 2. Fetch applications list for this Job
  const { data: appsResponse, isLoading, error } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ applications: Application[] }>>(
        API_ENDPOINTS.JOBS.APPLICATIONS(jobId)
      );
      return response.data;
    },
  });

  // 3. Mutation for updating application status
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      const response = await apiClient.patch(API_ENDPOINTS.APPLICATIONS.STATUS(appId), {
        status,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate applications query cache to reload list
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
    },
  });

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateStatus({ appId, status: newStatus });
  };

  const applications = appsResponse?.applications || [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/recruiter/jobs"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-55 transition-colors focus-visible:outline-hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manage Jobs
        </Link>
      </div>

      {/* Header Title */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
          Applicant Screening Queue
        </h1>
        {jobResponse?.job && (
          <p className="text-xs text-muted mt-1">
            Reviewing submissions for: <span className="font-semibold text-primary">{jobResponse.job.title}</span>
          </p>
        )}
      </div>

      {/* Applicants List using reusable ApplicationTable */}
      <div>
        <ApplicationTable
          role="Recruiter"
          applications={applications}
          isLoading={isLoading}
          error={error}
          onStatusChange={handleStatusChange}
          isUpdatingStatus={isUpdating}
        />
      </div>
    </div>
  );
}
