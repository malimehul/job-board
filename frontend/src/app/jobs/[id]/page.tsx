"use client";

import React, { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, ApiResponse, Application } from "@/types";
import JobDetails from "@/features/jobs/components/job-details";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailsPage({ params }: PageParams) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isCandidate = user?.role === "Candidate";

  // 1. Fetch Job details
  const { data: jobResponse, isLoading: isLoadingJob, error: jobError } = useQuery({
    queryKey: ["job-details", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ job: Job }>>(
        API_ENDPOINTS.JOBS.DETAIL(id)
      );
      return response.data;
    },
  });

  // 2. Fetch bookmarks to check if current job is saved
  const { data: bookmarksResponse } = useQuery({
    queryKey: ["candidate-bookmarks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        API_ENDPOINTS.CANDIDATE.BOOKMARKS
      );
      return response;
    },
    enabled: isCandidate,
  });

  const isBookmarked = React.useMemo(() => {
    if (!bookmarksResponse?.data) return false;
    return bookmarksResponse.data.some((j) => j._id === id);
  }, [bookmarksResponse, id]);

  // 3. Fetch candidate's applications list to determine if they already applied to this jobId
  const { data: applicationsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ applications: Application[] }>>(
        API_ENDPOINTS.APPLICATIONS.MY
      );
      return response;
    },
    enabled: isCandidate,
  });

  const hasApplied = React.useMemo(() => {
    if (!applicationsResponse?.data?.applications) return false;
    return applicationsResponse.data.applications.some((app) => {
      const jobRecordId =
        typeof app.jobId === "object" && app.jobId !== null
          ? (app.jobId as Job)._id
          : String(app.jobId);
      return jobRecordId === id;
    });
  }, [applicationsResponse, id]);

  // Bookmark Toggle Mutation
  const { mutate: toggleBookmark, isPending: isPendingBookmark } = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        return apiClient.delete(API_ENDPOINTS.CANDIDATE.BOOKMARK(id));
      } else {
        return apiClient.post(API_ENDPOINTS.CANDIDATE.BOOKMARK(id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-bookmarks"] });
    },
  });

  const handleToggleBookmark = () => {
    toggleBookmark();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Back to Browse */}
      <div>
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors focus-visible:outline-hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse Jobs
        </Link>
      </div>

      {jobError ? (
        <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md">
          Job listing not found or failed to load.
        </div>
      ) : isLoadingJob || !jobResponse?.job ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 animate-pulse h-96" />
      ) : (
        <JobDetails
          job={jobResponse.job}
          initialHasApplied={hasApplied}
          initialIsBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          isPendingBookmark={isPendingBookmark}
          isLoadingApps={isLoadingApps}
        />
      )}
    </div>
  );
}
