import z from "zod";

export const normalizeUniversityName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

export const universityNameSchema = z
  .string()
  .trim()
  .min(3, "Informe o nome da universidade.")
  .max(140, "O nome da universidade é muito longo.")
  .transform(normalizeUniversityName);
