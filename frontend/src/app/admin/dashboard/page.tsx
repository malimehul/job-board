"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types";
import {
  AdminDashboardStats,
  JobAnalyticsItem,
  ApplicationAnalyticsItem,
  TopRecruiter,
} from "@/features/admin/types";
import DashboardMetrics from "@/features/admin/components/dashboard-metrics";
import AnalyticsCharts from "@/features/admin/components/analytics-charts";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";

type DatePeriod = "today" | "week" | "month" | "custom";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<DatePeriod>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customRangeTrigger, setCustomRangeTrigger] = useState<{ start: string; end: string } | null>(null);
  const hasAppliedCustomRange = Boolean(customRangeTrigger?.start && customRangeTrigger?.end);
  const canFetchDateFilteredAnalytics = period !== "custom" || hasAppliedCustomRange;

  // 1. Fetch overall Dashboard Metrics
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-dashboard-stats", period, customRangeTrigger],
    queryFn: async ({ queryKey }) => {
      const [, p, range] = queryKey as [string, DatePeriod, { start: string; end: string } | null];
      const params = new URLSearchParams();
      if (p === "custom") {
        if (range?.start) {
          params.set("startDate", new Date(range.start).toISOString());
        }
        if (range?.end) {
          const end = new Date(range.end);
          end.setHours(23, 59, 59, 999);
          params.set("endDate", end.toISOString());
        }
      } else {
        params.set("period", p);
      }

      const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(
        `${API_ENDPOINTS.ADMIN.DASHBOARD}?${params.toString()}`
      );
      return response.data;
    },
    enabled: canFetchDateFilteredAnalytics,
    staleTime: 0,
  });

  // 2. Fetch Jobs Analytics
  const {
    data: jobsAnalytics,
    isLoading: isJobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["admin-analytics-jobs", period, customRangeTrigger],
    queryFn: async ({ queryKey }) => {
      const [, p, range] = queryKey as [string, DatePeriod, { start: string; end: string } | null];
      const params = new URLSearchParams();
      if (p === "custom") {
        if (range?.start) {
          params.set("startDate", new Date(range.start).toISOString());
        }
        if (range?.end) {
          const end = new Date(range.end);
          end.setHours(23, 59, 59, 999);
          params.set("endDate", end.toISOString());
        }
      } else {
        params.set("period", p);
      }

      const response = await apiClient.get<ApiResponse<JobAnalyticsItem[]>>(
        `${API_ENDPOINTS.ADMIN.ANALYTICS_JOBS}?${params.toString()}`
      );
      return response.data;
    },
    enabled: canFetchDateFilteredAnalytics,
    staleTime: 0,
  });

  // 3. Fetch Applications Analytics
  const {
    data: appsAnalytics,
    isLoading: isAppsLoading,
    error: appsError,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ["admin-analytics-applications", period, customRangeTrigger],
    queryFn: async ({ queryKey }) => {
      const [, p, range] = queryKey as [string, DatePeriod, { start: string; end: string } | null];
      const params = new URLSearchParams();
      if (p === "custom") {
        if (range?.start) {
          params.set("startDate", new Date(range.start).toISOString());
        }
        if (range?.end) {
          const end = new Date(range.end);
          end.setHours(23, 59, 59, 999);
          params.set("endDate", end.toISOString());
        }
      } else {
        params.set("period", p);
      }

      const response = await apiClient.get<ApiResponse<ApplicationAnalyticsItem[]>>(
        `${API_ENDPOINTS.ADMIN.ANALYTICS_APPLICATIONS}?${params.toString()}`
      );
      return response.data;
    },
    enabled: canFetchDateFilteredAnalytics,
    staleTime: 0,
  });

  // 4. Fetch Top Recruiters (does not accept date filter, returns top 10)
  const {
    data: topRecruiters,
    isLoading: isRecruitersLoading,
    error: recruitersError,
    refetch: refetchRecruiters,
  } = useQuery({
    queryKey: ["admin-analytics-recruiters"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TopRecruiter[]>>(
        API_ENDPOINTS.ADMIN.ANALYTICS_TOP_RECRUITERS
      );
      return response.data;
    },
    staleTime: 0,
  });

  const handleRefresh = () => {
    if (canFetchDateFilteredAnalytics) {
      refetchStats();
      refetchJobs();
      refetchApps();
    }
    refetchRecruiters();
  };

  const handlePeriodChange = (newPeriod: DatePeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === "custom") {
      if (startDate && endDate) {
        setCustomRangeTrigger({ start: startDate, end: endDate });
      }
    } else {
      setCustomRangeTrigger(null);
    }
  };

  const handleCustomRangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startDate && endDate) {
      setCustomRangeTrigger({ start: startDate, end: endDate });
    }
  };

  const isLoading = isStatsLoading || isJobsLoading || isAppsLoading || isRecruitersLoading;
  const hasError = statsError || jobsError || appsError || recruitersError;

  return (
    <div className="space-y-8">
      {/* Header controls row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
            System Administration Dashboard
          </h1>
          <p className="text-xs text-muted mt-1">
            Platform-wide operational analytics, users audit, and job/application metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="cursor-pointer h-9 px-3 flex items-center gap-1.5 border-zinc-200 dark:border-zinc-800"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Date filters selector */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-ink dark:text-zinc-200">Analytics Range:</span>
          <div className="inline-flex rounded-md shadow-xs bg-zinc-50 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700">
            {(["today", "week", "month", "custom"] as DatePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer capitalize ${period === p
                  ? "bg-white dark:bg-zinc-750 text-primary shadow-xs"
                  : "text-muted hover:text-ink dark:hover:text-zinc-200"
                  }`}
              >
                {p === "week" ? "This Week" : p === "month" ? "This Month" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {period === "custom" && (
          <form onSubmit={handleCustomRangeSubmit} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary bg-transparent"
            />
            <span className="text-xs text-muted">to</span>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary bg-transparent"
            />
            <Button type="submit" size="sm" className="h-7 text-xs px-3 cursor-pointer" disabled={!startDate || !endDate}>
              Apply
            </Button>
          </form>
        )}
      </div>

      {hasError && (
        <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
          Failed to load some dashboard metrics. Please check connection and try again.
        </div>
      )}

      {/* Stats Cards Section */}
      {statsData ? (
        <DashboardMetrics stats={statsData} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {/* Analytics Charts Section */}
      <div>
        <h2 className="text-lg font-bold text-ink dark:text-zinc-50 mb-4">Platform Growth & Activity</h2>
        <AnalyticsCharts
          jobsData={jobsAnalytics || []}
          applicationsData={appsAnalytics || []}
          topRecruiters={topRecruiters || []}
        />
      </div>
    </div>
  );
}
