import React from "react";
import { AdminDashboardStats } from "../types";
import {
  Users,
  Briefcase,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DashboardMetricsProps {
  stats: AdminDashboardStats;
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const cards = [
    {
      title: "Total Recruiters",
      value: stats.totalRecruiters,
      description: "Platform-registered employers",
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      description: "Job seekers registered",
      icon: UserCheck,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      description: `${stats.openJobs} active, ${stats.closedJobs} closed`,
      icon: Briefcase,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      description: `${stats.applicationsToday} submitted today`,
      icon: FileText,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      description: "Non-suspended accounts",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Suspended Users",
      value: stats.suspendedUsers,
      description: "Temporarily blocked accounts",
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-3xl font-extrabold text-ink dark:text-zinc-50 block">
                {card.value}
              </span>
              <span className="text-xs text-muted block mt-1">
                {card.description}
              </span>
            </div>
            <div className={`h-12 w-12 rounded-full ${card.bgColor} flex items-center justify-center ${card.iconColor} shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardMetrics;
