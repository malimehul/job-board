"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, ApiResponse } from "@/types";
import JobList from "@/features/jobs/components/job-list";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BookmarksPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Candidate Bookmarks
  const { data: bookmarksResponse, isLoading, error } = useQuery({
    queryKey: ["candidate-bookmarks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        API_ENDPOINTS.CANDIDATE.BOOKMARKS
      );
      return response;
    },
  });

  const bookmarks = bookmarksResponse?.data || [];

  // Convert array to Set of IDs for checks
  const savedJobIds = React.useMemo(() => {
    const bookmarksArray = bookmarksResponse?.data || [];
    return new Set(bookmarksArray.map((j) => j._id));
  }, [bookmarksResponse]);

  const { mutate: unbookmarkJob, isPending: isUnsaving } = useMutation({
    mutationFn: async (jobId: string) => {
      return apiClient.delete(API_ENDPOINTS.CANDIDATE.BOOKMARK(jobId));
    },
    onSuccess: () => {
      // Invalidate query to reload bookmarks list
      queryClient.invalidateQueries({ queryKey: ["candidate-bookmarks"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/candidate/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors focus-visible:outline-hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
          Bookmarked Careers
        </h1>
        <p className="text-xs text-muted mt-1">
          Explore and manage job listings you have saved for later review.
        </p>
      </div>

      {/* JobList */}
      <div>
        {error ? (
          <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md">
            Failed to query bookmarked jobs. Please try refreshing.
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-sm text-muted">You haven&apos;t bookmarked any jobs yet.</p>
            <Link href="/jobs" className="mt-4 inline-block">
              <span className="text-xs text-primary font-semibold hover:underline">
                Search Openings
              </span>
            </Link>
          </div>
        ) : (
          <JobList
            jobs={bookmarks}
            savedJobIds={savedJobIds}
            onToggleSave={unbookmarkJob}
            isPendingSave={isUnsaving}
          />
        )}
      </div>
    </div>
  );
}
