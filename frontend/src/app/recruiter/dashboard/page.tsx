"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Briefcase,
  Users,
  FileText,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplications: number;
  totalCandidates: number;
  recentApplications: Array<{
    _id: string;
    status: string;
    createdAt: string;
    candidateId?: {
      name: string;
      email: string;
    };
    jobId?: {
      _id: string;
      title: string;
    };
  }>;
  recentJobs: Array<{
    _id: string;
    title: string;
    location: string;
    jobType: string;
    status: string;
    createdAt: string;
  }>;
  applicationsPerJob: Array<{
    jobId: string;
    title: string;
    applicationsCount: number;
    status: string;
  }>;
  upcomingDeadlines: Array<{
    _id: string;
    title: string;
    applicationDeadline: string;
  }>;
}

export default function RecruiterDashboardPage() {
  // Fetch Recruiter Dashboard analytics data
  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: ["recruiter-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.RECRUITER.DASHBOARD
      );
      return response.data;
    },
  });

  const stats = dashboardResponse || {
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    recentApplications: [],
    recentJobs: [],
    applicationsPerJob: [],
    upcomingDeadlines: [],
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg" />
          <div className="h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
        Failed to load recruiter analytics. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Post Job Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-zinc-50 tracking-tight">
            Recruiter Analytics Dashboard
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time insights on your active vacancies, application volume, and recruitment deadlines.
          </p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button className="cursor-pointer h-10 px-5 flex items-center gap-2 font-semibold">
            <Plus className="h-5 w-5" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Active Openings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Active Jobs
            </span>
            <span className="text-3xl font-extrabold text-success mt-1 block">
              {stats.openJobs}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-success-light/10 flex items-center justify-center text-success">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        {/* Closed Listings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Closed Jobs
            </span>
            <span className="text-3xl font-extrabold text-zinc-500 mt-1 block">
              {stats.closedJobs}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Total Applications
            </span>
            <span className="text-3xl font-extrabold text-primary mt-1 block">
              {stats.totalApplications}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Total Candidates */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Total Candidates
            </span>
            <span className="text-3xl font-extrabold text-amber-500 mt-1 block">
              {stats.totalCandidates}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid containing Quick Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications Feed */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <h2 className="text-md font-bold text-ink dark:text-zinc-50 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              Recent Applications Received
            </h2>
            <Link
              href="/recruiter/jobs"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Jobs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {stats.recentApplications.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No applications received yet.</p>
            ) : (
              stats.recentApplications.map((app) => {
                const jobTitle = app.jobId?.title || "Unknown Job";
                const candidateName = app.candidateId?.name || "Guest Applicant";
                const candidateEmail = app.candidateId?.email || "";
                return (
                  <div key={app._id} className="py-3 flex justify-between items-start gap-4 text-xs">
                    <div>
                      <p className="font-bold text-ink dark:text-zinc-200">{candidateName}</p>
                      <p className="text-muted dark:text-zinc-400 mt-0.5">{candidateEmail}</p>
                      <p className="text-xxs text-primary font-semibold mt-1">
                        Applied to:{" "}
                        {app.jobId?._id ? (
                          <Link href={`/recruiter/jobs/${app.jobId._id}`} className="underline hover:text-primary-dark transition-colors">
                            {jobTitle}
                          </Link>
                        ) : (
                          <span className="underline">{jobTitle}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded-full font-bold bg-primary-light/10 text-primary text-[10px]">
                        {app.status}
                      </span>
                      <p className="text-[10px] text-muted mt-1.5 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(app.createdAt))} ago
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Applications per Job stats (Quick Insights) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <h2 className="text-md font-bold text-ink dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Applications Volume per Job
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            {stats.applicationsPerJob.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No posted openings to measure.</p>
            ) : (
              stats.applicationsPerJob.map((job) => {
                const maxApp = Math.max(...stats.applicationsPerJob.map((j) => j.applicationsCount), 1);
                const percentage = Math.round((job.applicationsCount / maxApp) * 100);
                return (
                  <div key={job.jobId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <Link
                        href={`/recruiter/jobs/${job.jobId}`}
                        className="text-ink dark:text-zinc-200 hover:text-primary truncate max-w-[70%]"
                      >
                        {job.title}
                      </Link>
                      <span className="text-primary font-bold">{job.applicationsCount} apps</span>
                    </div>
                    {/* Custom themed progress bar */}
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid containing Recently Posted Jobs & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Posted Jobs */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <h2 className="text-md font-bold text-ink dark:text-zinc-50 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-primary" />
              Recently Posted Positions
            </h2>
            <Link
              href="/recruiter/jobs"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Jobs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {stats.recentJobs.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No posted jobs yet.</p>
            ) : (
              stats.recentJobs.map((job) => (
                <div key={job._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-ink dark:text-zinc-200">{job.title}</p>
                    <p className="text-muted dark:text-zinc-400 mt-0.5">{job.location} • {job.jobType}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-full font-bold text-[10px] ${job.status === "open" ? "bg-success-light/20 text-success" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                    >
                      {job.status === "open" ? "Active" : "Closed"}
                    </span>
                    <p className="text-[10px] text-muted mt-1.5 flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(job.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <h2 className="text-md font-bold text-ink dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              Upcoming Application Deadlines
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No active deadlines approaching.</p>
            ) : (
              stats.upcomingDeadlines.map((job) => {
                const diffTime = new Date(job.applicationDeadline).getTime() - new Date().getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isOverdue = daysRemaining < 0;
                return (
                  <div key={job._id} className="py-3 flex justify-between items-center text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-ink dark:text-zinc-200 truncate">{job.title}</p>
                      <p className="text-muted mt-0.5">
                        Due Date: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {isOverdue ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-full font-bold bg-error-light/20 text-error text-[10px]">
                          Expired
                        </span>
                      ) : daysRemaining === 0 ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 text-[10px]">
                          Due Today
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded-full font-bold bg-primary-light/10 text-primary text-[10px]">
                          {daysRemaining} day{daysRemaining > 1 ? "s" : ""} left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
