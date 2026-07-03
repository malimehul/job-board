export interface CreateJobDTO {
  title: string;
  description: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  jobType: string;
  location: string;
  applicationDeadline: Date | string;
}

export interface UpdateJobDTO {
  title?: string;
  description?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  jobType?: string;
  location?: string;
  applicationDeadline?: Date | string;
  status?: 'open' | 'closed';
}
