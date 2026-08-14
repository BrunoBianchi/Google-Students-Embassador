import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { z } from "zod";
import {
  banForumMemberByAutomod,
  muteForumMemberByAutomod,
  redactForumMessageByAutomod,
  removeForumMemberByAutomod,
} from "../forum-message.services";

type ModerationInput = {
  forumId: string;
  messageId: string;
  authorId: string;
  content: string;
};
type ImmediateModerationAction = "allow" | "delete" | "mute";
type ImmediateModerationDecision = {
  action: ImmediateModerationAction;
  reason?: "abusive_language" | "personal_data" | "credible_threat";
};
export type ImmediateModerationResult = {
  deleted: boolean;
  muted: boolean;
  action: ImmediateModerationAction;
};
const moderationDecisionSchema = z.object({
  action: z.enum(["allow", "delete", "mute", "remove", "ban"]),
  muteMinutes: z.number().int().min(0).max(10_080),
});
type ModerationDecision = z.infer<typeof moderationDecisionSchema>;

const prompt = readFileSync(join(import.meta.dir, "prompt.md"), "utf8");
const skills = readFileSync(join(import.meta.dir, "skills.md"), "utf8");
const systemPrompt = `${prompt}\n\n${skills}`;
const apiUrl = () =>
  (Bun.env.MIMO_API_URL ?? "https://api.xiaomimimo.com/v1").replace(/\/$/, "");
const apiKey = () => Bun.env.MIMO_API_KEY?.trim();
const modelName = () => Bun.env.MIMO_MODEL?.trim() || "mimo-v2.5-pro";

// This is deliberately a small, high-confidence safety net. It keeps clearly
// abusive content from becoming visible while the contextual MiMo review runs
// asynchronously. Contextual or ambiguous cases are still left to the agent.
const normalizeForSafety = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s");

const hasStandaloneTerm = (content: string, terms: string[]) => {
  const escapedTerms = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(
    `(^|[^a-z0-9])(?:${escapedTerms.join("|")})(?=$|[^a-z0-9])`,
    "i",
  ).test(content);
};

export const classifyImmediateForumModeration = (
  content: string,
): ImmediateModerationDecision => {
  const normalized = normalizeForSafety(content);
  const credibleThreat =
    /\b(?:vou|vamos|irei|quero)\b.{0,24}\b(?:matar|ferir|agredir|espancar|atirar|estuprar)\b|\b(?:te|voce|voces)\s+(?:mato|matamos|ferimos|agredimos)\b/i.test(
      normalized,
    );
  if (credibleThreat) return { action: "mute", reason: "credible_threat" };

  const exposesPersonalData =
    /\b(?:cpf|rg|endereco|telefone|celular|whatsapp)\b.{0,32}\b\d(?:[\s().-]*\d){7,13}\b/i.test(
      normalized,
    );
  if (exposesPersonalData) return { action: "delete", reason: "personal_data" };

  if (
    hasStandaloneTerm(normalized, [
      "cu",
      "buceta",
      "caralho",
      "porra",
      "puta",
      "piranha",
      "arrombado",
      "otario",
      "idiota",
      "imbecil",
      "babaca",
      "retardado",
      "foder",
      "foda",
    ]) ||
    /\b(?:vai\s+(?:tomar\s+no\s+)?cu|vai\s+se\s+foder|foda[ -]?se)\b/i.test(
      normalized,
    )
  ) {
    return { action: "delete", reason: "abusive_language" };
  }

  return { action: "allow" };
};

export const applyImmediateForumModeration = async (
  input: ModerationInput,
): Promise<ImmediateModerationResult> => {
  const decision = classifyImmediateForumModeration(input.content);
  if (decision.action === "allow") {
    return { deleted: false, muted: false, action: "allow" };
  }

  const deleted = Boolean(
    await redactForumMessageByAutomod(input.forumId, input.messageId),
  );
  const muted =
    decision.action === "mute"
      ? await muteForumMemberByAutomod(input.forumId, input.authorId, 24 * 60)
      : false;
  return { deleted, muted, action: decision.action };
};

const createModeratorAgent = () => {
  const model = new ChatOpenAI({
    apiKey: apiKey(),
    model: modelName(),
    temperature: 0,
    maxTokens: 240,
    timeout: 15_000,
    configuration: { baseURL: apiUrl() },
  });
  return createAgent({
    name: "mimo_forum_moderator",
    model: model.withConfig({ response_format: { type: "json_object" } }),
    tools: [],
    systemPrompt,
  });
};

const decisionFromAgent = async (
  content: string,
): Promise<ModerationDecision> => {
  const result = await createModeratorAgent().invoke(
    {
      messages: [
        {
          role: "user",
          content: `UNTRUSTED_FORUM_MESSAGE\n---\n${content}\n---\nClassifique agora.`,
        },
      ],
    },
    { recursionLimit: 2 },
  );
  const finalContent = result.messages.at(-1)?.content;
  if (typeof finalContent !== "string") {
    throw new Error("Invalid moderation response");
  }
  return moderationDecisionSchema.parse(JSON.parse(finalContent));
};

const redactMessage = async (forumId: string, messageId: string) =>
  Boolean(await redactForumMessageByAutomod(forumId, messageId));

export const moderateForumMessage = async (input: ModerationInput) => {
  if (!apiKey()) return;
  const decision = await decisionFromAgent(input.content);
  if (decision.action === "allow") return;

  await redactMessage(input.forumId, input.messageId);
  if (decision.action === "delete") return;

  if (decision.action === "mute") {
    const muted = await muteForumMemberByAutomod(
      input.forumId,
      input.authorId,
      Math.max(1, decision.muteMinutes),
    );
    if (muted) return;
    return;
  }

  if (decision.action === "remove") {
    const removed = await removeForumMemberByAutomod(
      input.forumId,
      input.authorId,
    );
    if (removed) return;
    return;
  }

  const banned = await banForumMemberByAutomod(input.forumId, input.authorId);
  if (banned) return;
};

export const scheduleForumAutoModeration = (input: ModerationInput) => {
  void moderateForumMessage(input).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    // Do not log forum content, prompts or credentials if the provider fails.
    console.error(`Falha no moderador automático: ${message.slice(0, 180)}`);
  });
};
