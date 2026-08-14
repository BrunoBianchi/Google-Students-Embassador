import { z } from "zod";

const title = z.string().trim().min(3).max(100);
const description = z.string().trim().min(8).max(1_500);
const optionalDate = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.coerce.date().optional(),
);
const optionalCapacity = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.coerce.number().int().min(1).max(10_000).optional(),
);
const imageUrl = z.string().trim().url().refine(
  (value) => new URL(value).protocol === "https:",
  "Use apenas URLs HTTPS para as imagens do evento.",
);
export const eventTagValues = [
  "workshop", "study-jam", "conference", "meetup", "hackathon", "talk", "panel",
  "networking", "career", "ai", "cloud", "android", "web", "community",
] as const;
const brazilianStateValues = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
const optionalEventCity = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(2).max(100).optional(),
);
const optionalEventState = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().toUpperCase().refine(
    (value): value is (typeof brazilianStateValues)[number] => brazilianStateValues.includes(value as (typeof brazilianStateValues)[number]),
    "Selecione uma UF brasileira válida.",
  ).optional(),
);
const eventCoordinates = z.object({
  lat: z.coerce.number().finite().min(-34.0).max(6.0),
  lng: z.coerce.number().finite().min(-74.0).max(-34.0),
}).optional();

const eventBaseSchema = z.object({
  title,
  description,
  startsAt: z.coerce.date(),
  endsAt: optionalDate,
  location: z.string().trim().min(2).max(280),
  city: optionalEventCity,
  state: optionalEventState,
  coordinates: eventCoordinates,
  capacity: optionalCapacity,
  imageUrls: z.array(imageUrl).max(5).default([]),
  tags: z.array(z.enum(eventTagValues)).max(5).default([]),
  organizerIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(50).default([]),
  groupId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  createForum: z.boolean().default(false),
});

export const eventSchema = eventBaseSchema.refine(
  (event) => !event.endsAt || event.endsAt.getTime() > event.startsAt.getTime(),
  { path: ["endsAt"], message: "O horário de término deve ser posterior ao início." },
).refine(
  (event) => !event.coordinates || Boolean(event.city && event.state),
  { path: ["coordinates"], message: "Informe cidade e UF ao marcar um ponto no mapa." },
);

export const eventUpdateSchema = eventBaseSchema
  .omit({ organizerIds: true, groupId: true, createForum: true })
  .partial()
  .refine((event) => Object.values(event).some((value) => value !== undefined), "Informe uma alteração.");
export const eventOrganizerSchema = z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i) });
export const eventNewsSchema = z.object({ content: z.string().trim().min(1).max(1_500) });

export const groupSchema = z.object({ name: title, description });
export const groupInvitationSchema = z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i) });
export const groupInvitationResponseSchema = z.object({ accept: z.boolean() });
export const forumSchema = z.object({ title, description });
export const forumMessageSchema = z.object({ content: z.string().trim().min(1).max(1_000), parentMessageId: z.string().regex(/^[a-f\d]{24}$/i).optional() });
export const forumMemberModerationSchema = z.object({
  role: z.enum(["admin", "moderator", "member"]).optional(),
  mutedForMinutes: z.coerce.number().int().min(0).max(10_080).optional(),
  readOnly: z.boolean().optional(),
  banned: z.boolean().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), "Informe uma alteração.");

export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type ForumInput = z.infer<typeof forumSchema>;
