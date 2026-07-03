export interface CandidateBookmarkQueryDTO {
  page?: number;
  limit?: number;
}

export interface CandidateApplicationsQueryDTO {
  page?: number;
  limit?: number;
  status?: 'Applied' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
}
