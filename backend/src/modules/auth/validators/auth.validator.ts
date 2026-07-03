import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["Candidate", "Recruiter", "Admin"], {
    message: "Role must be 'Candidate', 'Recruiter', or 'Admin'",
  }),
  profile: z
    .object({
      title: z.string().optional(),
      bio: z.string().optional(),
      resumeUrl: z.url({ error: "Invalid resume URL" }).optional().or(z.literal("")),
      companyName: z.string().optional(),
      companyWebsite: z.url({ error: "Invalid company URL" }).optional().or(z.literal("")),
      skills: z.array(z.string().min(1)).optional(),
      experience: z.number().nonnegative().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  profile: z
    .object({
      title: z.string().optional(),
      bio: z.string().optional(),
      resumeUrl: z.url({ error: "Invalid resume URL" }).optional().or(z.literal("")),
      companyName: z.string().optional(),
      companyWebsite: z.url({ error: "Invalid company URL" }).optional().or(z.literal("")),
      skills: z.array(z.string().min(1)).optional(),
      experience: z.number().nonnegative().optional(),
    })
    .optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character"
    ),
});
