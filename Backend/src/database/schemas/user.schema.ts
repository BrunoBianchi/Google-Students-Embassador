import z from "zod";
import { universityNameSchema } from "./university.schema";

export const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const stateSchema = z.string().trim().toUpperCase().refine(
  (value): value is (typeof brazilianStates)[number] => brazilianStates.includes(value as (typeof brazilianStates)[number]),
  "Selecione uma UF brasileira válida.",
);
const citySchema = z.string().trim().min(2, "Informe sua cidade.").max(100, "A cidade é muito longa.")
  .transform((value) => value.replace(/\s+/g, " "));
const optionalNicknameSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(2).max(40).optional(),
);
const booleanFromForm = z.preprocess(
  (value) => value === "true" ? true : value === "false" ? false : value,
  z.boolean(),
);

export const userSchema = z.object({
  name: z.string().trim().min(2).max(80),
  nickname: optionalNicknameSchema,
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
  birth: z.coerce.date(),
  state: stateSchema,
  city: citySchema,
  userType: z.enum(["ambassador", "student"]),
  universityId: z.string().trim().optional(),
  newUniversityName: universityNameSchema.optional(),
  groupNumber: z.preprocess(
    (value) => value === "" || value === undefined ? undefined : Number(value),
    z.number().int().min(1).max(10).optional(),
  ),
  groupInviteCode: z.string().trim().toUpperCase().regex(/^G(?:0[1-9]|10)-[A-HJ-NP-Z2-9]{6}$/).optional(),
  termsAccepted: booleanFromForm.refine((value) => value, "Você precisa aceitar os Termos de Uso e a Política de Privacidade."),
  emailUpdates: booleanFromForm,
  avatarPath: z.string().startsWith("/uploads/avatars/").optional(),
  referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8}$/).optional(),
}).superRefine((user, context) => {
  if (!user.universityId && !user.newUniversityName) {
    context.addIssue({ code: "custom", path: ["universityId"], message: "Selecione uma universidade." });
  }

  if (user.universityId && user.newUniversityName) {
    context.addIssue({ code: "custom", path: ["newUniversityName"], message: "Selecione ou crie apenas uma universidade." });
  }

  if (user.userType === "student" && user.newUniversityName) {
    context.addIssue({ code: "custom", path: ["newUniversityName"], message: "Apenas embaixadores podem criar universidades." });
  }

  if (user.userType === "student" && user.groupNumber) {
    context.addIssue({ code: "custom", path: ["groupNumber"], message: "Apenas embaixadores podem entrar em grupos." });
  }

  if (user.userType === "student" && user.groupInviteCode) {
    context.addIssue({ code: "custom", path: ["groupInviteCode"], message: "Códigos de grupo são exclusivos para embaixadores." });
  }
});

export type RegistrationInput = z.infer<typeof userSchema>;
