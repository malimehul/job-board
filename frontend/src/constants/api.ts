export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
    UPLOAD_RESUME: "/auth/upload-resume",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  CANDIDATE: {
    DASHBOARD: "/candidate/dashboard",
    BOOKMARKS: "/candidate/bookmarks",
    BOOKMARK: (jobId: string) => `/candidate/jobs/${jobId}/bookmark`,
    APPLICATIONS: "/candidate/applications",
  },
  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
    PROFILE: "/recruiter/profile",
  },
  JOBS: {
    BASE: "/jobs",
    MY_JOBS: "/jobs/my-jobs",
    DETAIL: (id: string) => `/jobs/${id}`,
    CLOSE: (id: string) => `/jobs/${id}/close`,
    REOPEN: (id: string) => `/jobs/${id}/reopen`,
    APPLICATIONS: (jobId: string) => `/jobs/${jobId}/applications`,
  },
  APPLICATIONS: {
    BASE: "/applications",
    MY: "/applications/my",
    STATUS: (id: string) => `/applications/${id}/status`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    SUSPEND_USER: (id: string) => `/admin/users/${id}/suspend`,
    ACTIVATE_USER: (id: string) => `/admin/users/${id}/activate`,
    JOBS: "/admin/jobs",
    APPLICATIONS: "/admin/applications",
    ANALYTICS_JOBS: "/admin/analytics/jobs",
    ANALYTICS_APPLICATIONS: "/admin/analytics/applications",
    ANALYTICS_TOP_RECRUITERS: "/admin/analytics/top-recruiters",
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
export default API_ENDPOINTS;
