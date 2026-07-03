"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { AdminApplicationsResponse } from "@/features/admin/types";
import ApplicationTable from "@/features/admin/components/application-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const status = searchParams.get("status") || "";

  // Fetch Applications
  const { data: appsResponse, isLoading, error } = useQuery({
    queryKey: ["admin-applications", page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status) params.set("status", status);

      const response = await apiClient.get<AdminApplicationsResponse>(
        `${API_ENDPOINTS.ADMIN.APPLICATIONS}?${params.toString()}`
      );
      return response;
    },
  });

  const applications = appsResponse?.data || [];
  const pagination = appsResponse?.pagination;

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
            Application Management (Read-Only)
          </h1>
          <p className="text-xs text-muted mt-1">
            Browse and inspect all candidate job applications submitted across the platform.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-9.5 px-3 text-sm border border-zinc-250 dark:border-zinc-850 rounded-md bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Reset Button */}
          {status && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="cursor-pointer h-9.5 text-xs flex items-center gap-1 border-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Applications Table */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
          <div className="h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full" />
        </div>
      ) : error ? (
        <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
          Failed to load applications. Please try again.
        </div>
      ) : (
        <>
          <ApplicationTable applications={applications} />

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-xs text-muted">
                Showing page <span className="font-semibold text-ink dark:text-zinc-250">{page}</span> of{" "}
                <span className="font-semibold text-ink dark:text-zinc-250">{pagination.totalPages}</span> (
                {pagination.total} applications total)
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="cursor-pointer h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  if (
                    pNum === 1 ||
                    pNum === pagination.totalPages ||
                    (pNum >= page - 1 && pNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pNum}
                        variant={page === pNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pNum)}
                        className={`cursor-pointer h-8 w-8 text-xs ${
                          page === pNum ? "bg-primary text-white border-primary" : ""
                        }`}
                      >
                        {pNum}
                      </Button>
                    );
                  }
                  if (pNum === 2 || pNum === pagination.totalPages - 1) {
                    return (
                      <span key={pNum} className="text-zinc-400 px-1 text-xs select-none">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="cursor-pointer h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
