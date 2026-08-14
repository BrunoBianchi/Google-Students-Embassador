import express from "express";
import helmet from "helmet";
import * as dotenv from "dotenv";
import apiController from "./src/controllers/api.controller";
import { validateCurrentApiURL } from "./src/controllers/middleware/validateCurrentApiURL";
import { AppDataSource } from "./src/database/AppDataSource";
import { join } from "node:path";
import { ensureUniversityIndex } from "./src/services/university.services";
import { ensureUserIndexes } from "./src/services/user.services";
import { ensureSessionIndexes } from "./src/services/session.services";
import { allowCors, apiRateLimit, requireTrustedOrigin } from "./src/controllers/middleware/security.middleware";

dotenv.config();

export const app = express();
const isProduction = process.env.NODE_ENV === "production";
const canonicalFrontendOrigin = "https://google.studentembassador.com";
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN ?? (isProduction ? canonicalFrontendOrigin : "http://localhost:3000"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const isAllowedOrigin = (origin: string) => allowedOrigins.has(origin)
  || (!isProduction && /^http:\/\/(?:[a-z0-9-]+\.)?localhost:3000$/i.test(origin));

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: isProduction ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use(allowCors);
app.use(requireTrustedOrigin);
app.set("trust proxy", isProduction ? 1 : false);
app.use((request, response, next) => {
  const origin = request.headers.origin;

  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Cache-Control", "no-store");

  if (origin && isAllowedOrigin(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  }

  if (request.method === "OPTIONS") {
    return origin && isAllowedOrigin(origin)
      ? response.sendStatus(204)
      : response.sendStatus(403);
  }

  // State-changing browser requests must come from the configured frontend.
  // Requests without Origin (CLI/server-to-server) can still call the API.
  if (origin && !isAllowedOrigin(origin)) {
    return response.status(403).json({ error: "Origem não autorizada" });
  }

  return next();
});
app.use(express.json({ limit: "16kb" }));
app.use("/uploads", express.static(join(import.meta.dir, "uploads"), { fallthrough: false, maxAge: isProduction ? "7d" : 0 }));

app.use("/api/:year/:company/", apiRateLimit, validateCurrentApiURL, apiController);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error && error.name === "ZodError") {
    const issue = (error as Error & { issues?: Array<{ message?: string; path?: PropertyKey[] }> }).issues?.[0];
    return response.status(400).json({
      error: issue?.message ?? "Dados inválidos",
      field: typeof issue?.path?.[0] === "string" ? issue.path[0] : undefined,
    });
  }

  if (error instanceof Error && error.message === "User with this email already exists!") {
    return response.status(409).json({ error: "Já existe uma conta com este e-mail" });
  }

  if (error instanceof Error && error.message === "Email not verified") {
    return response.status(403).json({ error: "Confirme seu e-mail antes de entrar. Se precisar, solicite um novo link de confirmação." });
  }

  if (error instanceof Error && (error.message === "Invalid or expired verification token" || error.message === "Invalid or expired reset token" || error.message === "Invalid unsubscribe token")) {
    return response.status(400).json({ error: "Este link é inválido ou expirou. Solicite um novo link para continuar." });
  }

  if (error instanceof Error && error.message.startsWith("Mailgun")) {
    return response.status(503).json({ error: "O envio de e-mails está temporariamente indisponível. Tente novamente em instantes." });
  }

  if (error instanceof Error && error.message === "Invalid credentials") {
    return response.status(401).json({ error: "E-mail ou senha inválidos" });
  }

  if (error instanceof Error && error.message === "Cannot like own profile") {
    return response.status(400).json({ error: "Você não pode curtir o seu próprio perfil" });
  }

  if (error instanceof Error && error.message === "Resource not found") {
    return response.status(404).json({ error: "Recurso nao encontrado" });
  }

  if (error instanceof Error && error.message === "Event is full") {
    return response.status(409).json({ error: "As vagas deste evento já foram preenchidas" });
  }

  if (error instanceof Error && error.message === "Forum participation required") {
    return response.status(403).json({ error: "Entre no forum antes de enviar uma mensagem" });
  }

  if (error instanceof Error && error.message === "Forum access denied") {
    return response.status(403).json({ error: "Voce nao pode acessar este forum" });
  }

  if (error instanceof Error && error.message === "Forum is read only") {
    return response.status(403).json({ error: "Voce nao pode enviar mensagens neste forum agora" });
  }

  if (error instanceof Error && error.message === "Forum moderation denied") {
    return response.status(403).json({ error: "Voce nao tem permissao para moderar este membro" });
  }

  if (error instanceof Error && error.message === "Event management denied") {
    return response.status(403).json({ error: "Você não tem permissão para gerenciar este evento" });
  }

  if (error instanceof Error && error.message === "Resource management denied") {
    return response.status(403).json({ error: "Você não tem permissão para editar este recurso" });
  }

  if (error instanceof Error && error.message === "Group invitee not found") {
    return response.status(404).json({ error: "Embaixador não encontrado para este convite" });
  }

  if (error instanceof Error && error.message === "Group invitation not found") {
    return response.status(404).json({ error: "Este convite para grupo não está mais disponível" });
  }

  if (error instanceof Error && error.message === "Group management denied") {
    return response.status(403).json({ error: "Você só pode usar um grupo que administra" });
  }

  if (error instanceof Error && error.message === "Event organizer not found") {
    return response.status(404).json({ error: "A pessoa escolhida para a organização não foi encontrada" });
  }

  if (error instanceof Error && error.message === "Event owner cannot be removed") {
    return response.status(400).json({ error: "A pessoa que criou o evento não pode ser removida da organização" });
  }

  if (error instanceof Error && error.message === "Forum rate limit") {
    return response.status(429).json({ error: "Envie mensagens com um pequeno intervalo entre elas" });
  }

  if (error instanceof Error && error.message === "University not found") {
    return response.status(400).json({ error: "Universidade não encontrada" });
  }

  if (error instanceof Error && (error.message.includes("Avatar deve ser") || error.message.includes("não é uma imagem válida"))) {
    return response.status(400).json({ error: error.message });
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "LIMIT_FILE_SIZE") {
    return response.status(400).json({ error: "A imagem de perfil deve ter no máximo 4 MB" });
  }

  console.error("Erro na API", error);
  return response.status(500).json({ error: "Erro interno do servidor" });
});

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST ?? (isProduction ? "127.0.0.1" : "0.0.0.0");

AppDataSource.initialize()
  .then(async () => {
    await ensureUniversityIndex();
    await ensureUserIndexes();
    await ensureSessionIndexes();
    app.listen(port, host, () => {
      console.log(`API conectada ao MongoDB e escutando em ${host}:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Não foi possível conectar ao MongoDB.", error);
    process.exit(1);
  });
