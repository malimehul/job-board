export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: 'Candidate' | 'Recruiter' | 'Admin';
  profile?: {
    title?: string;
    bio?: string;
    resumeUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    skills?: string[];
    experience?: number;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  refreshToken?: string | null;
  profile?: {
    title?: string;
    bio?: string;
    resumeUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    skills?: string[];
    experience?: number;
  };
}

export interface CreateUserRepoDTO {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Candidate' | 'Recruiter' | 'Admin';
  profile?: {
    title?: string;
    bio?: string;
    resumeUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    skills?: string[];
    experience?: number;
  };
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}
