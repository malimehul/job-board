export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CANDIDATE: {
    DASHBOARD: "/candidate/dashboard",
    BOOKMARKS: "/candidate/bookmarks",
    APPLICATIONS: "/candidate/applications",
  },
  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
    JOBS_NEW: "/recruiter/jobs/new",
    JOBS_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
  },
  JOBS: {
    LIST: "/jobs",
    DETAIL: (id: string) => `/jobs/${id}`,
  },
} as const;

export type Routes = typeof ROUTES;
export default ROUTES;
