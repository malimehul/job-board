import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

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
});

export const onboardingProfileSchema = z.object({
  title: z.string().min(2, "Professional title must be at least 2 characters").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),
  experience: z.number({ error: "Experience must be a number" }).int().nonnegative("Experience must be a positive number"),
  skills: z.string().min(1, "Please enter at least one skill"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
});

export const resetPasswordSchema = z.object({
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
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export default loginSchema;
