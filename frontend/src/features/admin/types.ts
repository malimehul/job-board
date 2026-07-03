import { User, Job, Application } from "@/types";

export interface AdminDashboardStats {
  totalUsers: number;
  totalRecruiters: number;
  totalCandidates: number;
  activeUsers: number;
  suspendedUsers: number;
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplications: number;
  applicationsToday: number;
}

export interface TopRecruiter {
  recruiterId: string;
  recruiterName: string;
  jobsPosted: number;
  applicationsReceived: number;
}

export interface JobAnalyticsItem {
  date: string;
  jobs: number;
}

export interface ApplicationAnalyticsItem {
  date: string;
  applications: number;
}

export interface AdminUsersResponse {
  status: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminJobsResponse {
  status: string;
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminApplicationsResponse {
  status: string;
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
