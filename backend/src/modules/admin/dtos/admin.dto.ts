export interface UserQueryDTO {
  page?: number;
  limit?: number;
  role?: 'Candidate' | 'Recruiter' | 'Admin';
  status?: 'active' | 'suspended';
  search?: string;
}

export interface JobQueryDTO {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed';
  recruiterId?: string;
}

export interface ApplicationQueryDTO {
  page?: number;
  limit?: number;
  status?: 'Applied' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
  jobId?: string;
  candidateId?: string;
}

export interface AnalyticsQueryDTO {
  period?: 'today' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
}
