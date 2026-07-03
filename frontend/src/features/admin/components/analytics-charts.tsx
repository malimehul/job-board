"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { JobAnalyticsItem, ApplicationAnalyticsItem, TopRecruiter } from "../types";

interface AnalyticsChartsProps {
  jobsData: JobAnalyticsItem[];
  applicationsData: ApplicationAnalyticsItem[];
  topRecruiters: TopRecruiter[];
}

export function AnalyticsCharts({
  jobsData,
  applicationsData,
  topRecruiters,
}: AnalyticsChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 h-80 animate-pulse" />
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 h-80 animate-pulse" />
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 h-96 lg:col-span-2 animate-pulse" />
      </div>
    );
  }

  // Format date values for easier reading in chart
  const formattedJobs = jobsData.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  const formattedApps = applicationsData.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Jobs Over Time Area Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col">
        <div className="mb-4">
          <h3 className="text-md font-bold text-ink dark:text-zinc-50">Jobs Posted Over Time</h3>
          <p className="text-xs text-muted">Daily job post submissions trends</p>
        </div>
        <div className="relative h-72 w-full">
          {formattedJobs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <AreaChart data={formattedJobs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="jobsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #E4232A)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary, #E4232A)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} className="fill-zinc-400" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} className="fill-zinc-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="var(--color-primary, #E4232A)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#jobsColor)"
                  name="Jobs Posted"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Applications Over Time Area Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col">
        <div className="mb-4">
          <h3 className="text-md font-bold text-ink dark:text-zinc-50">Applications Submitted Over Time</h3>
          <p className="text-xs text-muted">Daily job applications submissions trends</p>
        </div>
        <div className="relative h-72 w-full">
          {formattedApps.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <AreaChart data={formattedApps} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} className="fill-zinc-400" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} className="fill-zinc-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#appsColor)"
                  name="Applications"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Top Recruiters Dual Horizontal Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-md font-bold text-ink dark:text-zinc-50">Top Recruiters</h3>
          <p className="text-xs text-muted">Comparing recruiter activity across jobs posted and applications received</p>
        </div>
        <div className="relative h-96 w-full">
          {topRecruiters.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              No top recruiters data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <BarChart
                data={topRecruiters}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-zinc-400" />
                <YAxis
                  type="category"
                  dataKey="recruiterName"
                  tick={{ fontSize: 10 }}
                  className="fill-zinc-500 font-medium"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="jobsPosted" fill="var(--color-primary, #E4232A)" name="Jobs Posted" radius={[0, 4, 4, 0]} />
                <Bar dataKey="applicationsReceived" fill="#3B82F6" name="Applications Received" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
