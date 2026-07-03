"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, Application, ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Bookmark, FileText, Search, ArrowRight, User } from "lucide-react";

export default function CandidateDashboardPage() {
  // 1. Fetch saved bookmarks to show count
  const { data: bookmarksResponse, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ["candidate-bookmarks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        API_ENDPOINTS.CANDIDATE.BOOKMARKS
      );
      return response;
    },
  });

  // 2. Fetch applications list to show count
  const { data: appsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ applications: Application[] }>>(
        API_ENDPOINTS.APPLICATIONS.MY
      );
      return response;
    },
  });

  const bookmarksCount = bookmarksResponse?.data?.length || 0;
  const applicationsCount = appsResponse?.data?.applications?.length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome row */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-55 tracking-tight">
          Applicant Dashboard
        </h1>
        <p className="text-xs text-muted mt-1">
          Review your bookmarks, track your pending applications, and manage search preferences.
        </p>
      </div>

      {/* Analytics Counter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Bookmarked Jobs */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col justify-between shadow-xs relative group hover:border-primary/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Saved Positions
              </span>
              <span className="text-3xl font-extrabold text-ink dark:text-zinc-50 mt-1 block">
                {isLoadingBookmarks ? "..." : bookmarksCount}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-500">
              <Bookmark className="h-5 w-5" />
            </div>
          </div>
          <Link href="/candidate/bookmarks" className="mt-6 flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            <span>View Saved Jobs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Applications Count */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col justify-between shadow-xs relative group hover:border-primary/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Submitted Applications
              </span>
              <span className="text-3xl font-extrabold text-ink dark:text-zinc-50 mt-1 block">
                {isLoadingApps ? "..." : applicationsCount}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <Link href="/candidate/applications" className="mt-6 flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            <span>Track Application Progress</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recommended Quick Actions Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink dark:text-zinc-55 mb-2">
          Discover New Opportunities
        </h2>
        <p className="text-sm text-muted leading-relaxed max-w-xl">
          Complete your profile details, upload your latest resume PDF, and browse matching vacancies from top companies around the globe.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/jobs">
            <Button className="cursor-pointer h-10 px-5 flex items-center gap-2 font-semibold">
              <Search className="h-4 w-4" />
              Explore Open Jobs
            </Button>
          </Link>
          <Link href="/candidate/profile">
            <Button variant="outline" className="cursor-pointer h-10 px-5 flex items-center gap-2 border-zinc-250">
              <User className="h-4 w-4 text-zinc-500" />
              Update Resume / Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
