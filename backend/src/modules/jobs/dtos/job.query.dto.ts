export interface JobSearchQueryDTO {
  page?: number;
  limit?: number;
  keyword?: string;
  skills?: string; // Comma-separated string of skills
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'open' | 'closed';
  recruiterId?: string;
  hasApplications?: string;
}
