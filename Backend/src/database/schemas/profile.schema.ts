import { z } from "zod";

const optionalUrl = z.string().trim().max(240).transform((value) => value || undefined).refine(
  (value) => !value || /^https:\/\/.+/i.test(value),
  "Use um link seguro iniciado por https://",
);

export const profileSchema = z.object({
  nickname: z.string().trim().min(2).max(40).optional().or(z.literal("")).transform((value) => value || undefined),
  bio: z.string().trim().max(280).optional().or(z.literal("")).transform((value) => value || undefined),
  githubUrl: optionalUrl.optional(),
  linkedinUrl: optionalUrl.optional(),
  instagramUrl: optionalUrl.optional(),
  phone: z.string().trim().regex(/^[+0-9 ()-]{8,24}$/).optional().or(z.literal("")).transform((value) => value || undefined),
  avatarFrame: z.enum(["none", "google", "gold", "rainbow", "campus", "gemini", "orbit", "pixel", "network", "constellation", "chrome", "android", "cloud", "firebase", "maps", "codejam", "community", "prism", "devfest", "studio", "spark", "material"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
