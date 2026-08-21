import { z } from "zod";

export const normalizeCampusSlug = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
};

export const normalizeEmailDomain = (domain: string): string => {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[\s/]/g, "");
};

export const campusSlugSchema = z
  .string()
  .trim()
  .min(2, "O identificador (slug) do campus deve ter pelo menos 2 caracteres.")
  .max(60, "O identificador do campus é muito longo.")
  .transform(normalizeCampusSlug)
  .refine((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), {
    message: "O identificador deve conter apenas letras minúsculas, números e hífens.",
  });

export const emailDomainSchema = z
  .string()
  .trim()
  .min(3, "Domínio de e-mail institucional inválido.")
  .max(120)
  .transform(normalizeEmailDomain)
  .refine((domain) => /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain), {
    message: "Informe um formato válido de domínio institucional (ex.: unifei.edu.br).",
  });

export const campusCreateSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome da universidade ou campus.").max(140),
  slug: campusSlugSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  emailDomains: z.array(emailDomainSchema).min(1, "Cadastre ao menos um domínio de e-mail institucional para este campus."),
  city: z.string().trim().min(2).max(100).optional(),
  state: z.string().trim().length(2).toUpperCase().optional(),
  country: z.string().trim().length(2).toUpperCase().default("BR"),
  logoUrl: z.string().trim().url().optional(),
  coverImageUrl: z.string().trim().url().optional(),
});

export const campusUpdateSchema = campusCreateSchema.partial();

export const campusJoinSchema = z.object({
  institutionalEmail: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
});

export type CampusCreateInput = z.infer<typeof campusCreateSchema>;
export type CampusUpdateInput = z.infer<typeof campusUpdateSchema>;
export type CampusJoinInput = z.infer<typeof campusJoinSchema>;
