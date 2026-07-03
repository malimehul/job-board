export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
] as const;

export type JobType = typeof JOB_TYPES[number];
