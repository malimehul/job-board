"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { AdminUsersResponse } from "@/features/admin/types";
import UserTable from "@/features/admin/components/user-table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Read URL query parameters
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  const [searchInput, setSearchInput] = useState(search);

  // Sync search input if URL search param changes directly
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  // 1. Fetch Users
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, limit, search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (status) params.set("status", status);

      const response = await apiClient.get<AdminUsersResponse>(
        `${API_ENDPOINTS.ADMIN.USERS}?${params.toString()}`
      );
      return response;
    },
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // 2. Suspend user mutation
  const { mutate: suspendUser, isPending: isSuspending } = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(API_ENDPOINTS.ADMIN.SUSPEND_USER(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  // 3. Activate user mutation
  const { mutate: activateUser, isPending: isActivating } = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(API_ENDPOINTS.ADMIN.ACTIVATE_USER(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  const isPendingAction = isSuspending || isActivating;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

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
    setSearchInput("");
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
            User Management
          </h1>
          <p className="text-xs text-muted mt-1">
            Browse registered platform candidates and recruiters, audit active states, or suspend accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9.5 w-full text-sm border border-zinc-250 dark:border-zinc-850 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary bg-transparent text-ink dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="h-9.5 px-3 text-sm border border-zinc-250 dark:border-zinc-850 rounded-md bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">All Roles</option>
              <option value="Candidate">Candidate</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Admin">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="h-9.5 px-3 text-sm border border-zinc-250 dark:border-zinc-850 rounded-md bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Reset Button */}
            {(search || role || status) && (
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

            <Button type="submit" size="sm" className="h-9.5 text-xs px-4 cursor-pointer">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Main user list table */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
          <div className="h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full" />
        </div>
      ) : error ? (
        <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
          Failed to load users list. Please try again.
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            onSuspend={suspendUser}
            onActivate={activateUser}
            isPendingAction={isPendingAction}
          />

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-xs text-muted">
                Showing page <span className="font-semibold text-ink dark:text-zinc-250">{page}</span> of{" "}
                <span className="font-semibold text-ink dark:text-zinc-250">{pagination.totalPages}</span> (
                {pagination.total} users total)
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
                  // Render pagination numbers dynamically
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
