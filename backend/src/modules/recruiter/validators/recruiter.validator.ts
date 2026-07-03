import { z } from "zod";

export const updateRecruiterProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  profile: z
    .object({
      companyName: z.string().optional(),
      companyWebsite: z.url({ error: "Invalid company website URL" }).optional().or(z.literal("")),
    })
    .optional(),
});
