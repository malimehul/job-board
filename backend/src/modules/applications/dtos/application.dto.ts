export interface CreateApplicationDTO {
  jobId: string;
  coverLetter: string;
}

export interface UpdateApplicationStatusDTO {
  status: 'Applied' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
}
