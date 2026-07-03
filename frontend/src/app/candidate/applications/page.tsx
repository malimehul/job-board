"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import Link from "next/link";
import { Application, ApiResponse } from "@/types";
import { ArrowLeft } from "lucide-react";
import { ApplicationTable } from "@/features/applications/components/application-table";

/**
 * Candidate Applications History page.
 * Fetches applications list and mounts the unified ApplicationTable.
 */
export default function CandidateApplicationsPage() {
  const { data: appsResponse, isLoading, error } = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ applications: Application[] }>>(
        API_ENDPOINTS.APPLICATIONS.MY
      );
      return response;
    },
  });

  const applications = appsResponse?.data?.applications || [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/candidate/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-55 transition-colors focus-visible:outline-hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-55 tracking-tight">
          Application History
        </h1>
        <p className="text-xs text-muted mt-1">
          Monitor status transitions and screen history for your submitted job applications.
        </p>
      </div>

      {/* Applications Grid / Feed */}
      <div>
        <ApplicationTable
          role="Candidate"
          applications={applications}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
