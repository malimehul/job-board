export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Candidate" | "Recruiter" | "Admin";
  status: "active" | "suspended";
  profile?: {
    title?: string;
    bio?: string;
    resumeUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    skills?: string[];
    experience?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  recruiterId: string | User;
  title: string;
  description: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  jobType: string;
  location: string;
  applicationDeadline: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  jobId: string | Job;
  candidateId: string | User;
  coverLetter: string;
  status: "Applied" | "Shortlisted" | "Interviewed" | "Rejected" | "Hired";
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  status: "success";
  data: T;
  message?: string;
}
