"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, PaginatedResponse, ApiResponse } from "@/types";
import JobSearch from "@/features/jobs/components/job-search";
import JobFilters from "@/features/jobs/components/job-filters";
import JobList from "@/features/jobs/components/job-list";

export default function JobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Read URL query parameters
  const page = Number(searchParams.get("page")) || 1;
  const keyword = searchParams.get("keyword") || "";
  const location = searchParams.get("location") || "";
  const jobType = searchParams.get("jobType") || "";
  const salaryMin = searchParams.get("salaryMin") || "";
  const salaryMax = searchParams.get("salaryMax") || "";
  const skills = searchParams.get("skills") || "";

  // 1. Fetch filtered jobs list from backend
  const { data: jobsResponse, isLoading, error } = useQuery({
    queryKey: ["jobs", page, keyword, location, jobType, salaryMin, salaryMax, skills],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (keyword) params.set("keyword", keyword);
      if (location) params.set("location", location);
      if (jobType) params.set("jobType", jobType);
      if (salaryMin) params.set("salaryMin", salaryMin);
      if (salaryMax) params.set("salaryMax", salaryMax);
      if (skills) params.set("skills", skills);
      params.set("status", "open"); // Display only open positions

      const response = await apiClient.get<PaginatedResponse<Job>>(
        `${API_ENDPOINTS.JOBS.BASE}?${params.toString()}`
      );
      return response;
    },
  });

  // 2. Fetch candidate's current bookmarks to cross-reference saved status in lists
  const { data: bookmarksResponse } = useQuery({
    queryKey: ["candidate-bookmarks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        API_ENDPOINTS.CANDIDATE.BOOKMARKS
      );
      return response;
    },
    enabled: !!user && user.role === "Candidate",
  });

  // Convert bookmarks array to a Set of IDs for O(1) checks in map renders
  const savedJobIds = React.useMemo(() => {
    if (!bookmarksResponse?.data) return new Set<string>();
    return new Set(bookmarksResponse.data.map((j) => j._id));
  }, [bookmarksResponse]);

  // 3. Toggle Bookmark mutations for Candidates
  const { mutate: toggleBookmark, isPending: isPendingSave } = useMutation({
    mutationFn: async (jobId: string) => {
      const isSaved = savedJobIds.has(jobId);
      if (isSaved) {
        return apiClient.delete(API_ENDPOINTS.CANDIDATE.BOOKMARK(jobId));
      } else {
        return apiClient.post(API_ENDPOINTS.CANDIDATE.BOOKMARK(jobId));
      }
    },
    onSuccess: () => {
      // Refresh candidate bookmarks list in cache
      queryClient.invalidateQueries({ queryKey: ["candidate-bookmarks"] });
    },
  });

  const handleSearch = (newKeyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (newKeyword) {
      params.set("keyword", newKeyword);
    } else {
      params.delete("keyword");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilters = (filters: {
    jobType?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
    skills?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
          Explore Job Opportunities
        </h1>
        <p className="text-xs text-muted mt-1">
          Search and apply for open positions submitted by top recruitment firms.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="w-full">
        <JobSearch initialValue={keyword} onSearch={handleSearch} />
      </div>

      {/* Grid containing Filters sidebar and Job listing cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <JobFilters
            initialValues={{ jobType, location, salaryMin, salaryMax, skills }}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        <div className="lg:col-span-3">
          {error ? (
            <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md">
              Failed to load jobs. Please try refreshing.
            </div>
          ) : isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6" />
                ))}
              </div>
            </div>
          ) : (
            <JobList
              jobs={jobsResponse?.data || []}
              pagination={jobsResponse?.pagination}
              onPageChange={handlePageChange}
              savedJobIds={savedJobIds}
              onToggleSave={toggleBookmark}
              isPendingSave={isPendingSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
