"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import JobTable from "@/features/jobs/components/job-table";

interface PaginatedJobsResponse {
  status: string;
  data: {
    jobs: Job[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Read URL query parameters
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const keyword = searchParams.get("keyword") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const hasApplications = searchParams.get("hasApplications") || "false";

  const [searchInput, setSearchInput] = useState(keyword);

  // 1. Fetch Recruiter's jobs list with pagination, search, and sorting
  const { data: jobsResponse, isLoading, error } = useQuery({
    queryKey: ["recruiter-jobs", page, limit, keyword, sortBy, sortOrder, hasApplications],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (keyword) params.set("keyword", keyword);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (hasApplications === "true") params.set("hasApplications", "true");

      const response = await apiClient.get<PaginatedJobsResponse>(
        `${API_ENDPOINTS.JOBS.MY_JOBS}?${params.toString()}`
      );
      return response;
    },
  });

  const jobs = jobsResponse?.data?.jobs || [];
  const pagination = jobsResponse?.pagination;

  // 2. Mutations for managing status states
  const { mutate: closeJob, isPending: isClosing } = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(API_ENDPOINTS.JOBS.CLOSE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-dashboard"] });
    },
  });

  const { mutate: reopenJob, isPending: isReopening } = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(API_ENDPOINTS.JOBS.REOPEN(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-dashboard"] });
    },
  });

  const { mutate: deleteJob, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(API_ENDPOINTS.JOBS.DETAIL(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-dashboard"] });
    },
  });

  const isPendingAction = isClosing || isReopening || isDeleting;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (searchInput.trim()) {
      params.set("keyword", searchInput.trim());
    } else {
      params.delete("keyword");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("limit", String(newLimit));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (sortBy === field) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleHasApplicationsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (checked) {
      params.set("hasApplications", "true");
    } else {
      params.delete("hasApplications");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
            Manage Posted Jobs
          </h1>
          <p className="text-xs text-muted mt-1">
            Search, filter, sort, and paginate through all your company career listings.
          </p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button className="cursor-pointer h-10 px-5 flex items-center gap-2 font-semibold">
            <Plus className="h-5 w-5" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search jobs by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-10 pr-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" className="cursor-pointer h-10 font-semibold px-4">
            Search
          </Button>
          {(keyword || searchInput || hasApplications === "true") && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="cursor-pointer h-10 w-10 p-0 flex items-center justify-center border-zinc-200"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4 text-zinc-500" />
            </Button>
          )}
        </form>

        {/* Filters Group (Has Applications & Page Size) */}
        <div className="flex items-center gap-6 text-xs">
          <label className="flex items-center gap-2 font-semibold text-text dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasApplications === "true"}
              onChange={handleHasApplicationsToggle}
              className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-primary focus:ring-primary"
            />
            <span>Only with applications</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-muted font-semibold">Show</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary text-ink dark:text-zinc-200"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Job listings Table */}
      <div>
        {error ? (
          <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
            Failed to query your job openings. Please reload the page.
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800" />
            <div className="h-32 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800" />
          </div>
        ) : (
          <div className="space-y-6">
            <JobTable
              jobs={jobs}
              onDelete={deleteJob}
              onClose={closeJob}
              onReopen={reopenJob}
              isPendingAction={isPendingAction}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-850 pt-4 text-xs">
                <span className="text-muted font-semibold">
                  Showing Page <span className="text-ink dark:text-zinc-50">{pagination.page}</span> of{" "}
                  <span className="text-ink dark:text-zinc-50">{pagination.totalPages}</span> (
                  <span className="text-ink dark:text-zinc-50">{pagination.total}</span> jobs total)
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="cursor-pointer flex items-center gap-1.5 h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="cursor-pointer flex items-center gap-1.5 h-8 px-3"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
