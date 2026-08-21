import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { extname, join } from "node:path";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { loginSchema } from "../../database/schemas/login.schema";
import { userSchema } from "../../database/schemas/user.schema";
import { profileSchema } from "../../database/schemas/profile.schema";
import { getAuthenticatedUserId, readCookie, requireAuth, SESSION_COOKIE_NAME, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/security.middleware";
import { createServerSession, revokeServerSession } from "../../services/session.services";
import { authenticateGoogleUser, createGoogleUser, createUser, findUserByEmail, findUserById, issueEmailVerification, issuePasswordReset, listAmbassadors, loginUser, resetPassword, restoreEmailVerification, restorePasswordReset, toggleAmbassadorLike, toggleProfileLike, unsubscribeEmailCategory, updateUserProfile, verifyEmail } from "../../services/user.services";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../services/mail.services";
import { getDashboard } from "../../services/community.services";
import { getPublicProfile } from "../../services/community.services";
import { ensureUserInviteCode } from "../../services/user.services";
import { getUserCampuses } from "../../services/campus.services";
import type { User } from "../../database/models/user.model";
import { groupNumberForInviteCode } from "../../config/ambassador-group-codes";
import { getGoogleOAuthClientId, verifyGoogleCredential } from "../../services/google-auth.services";


const userController = Router();
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const isProduction = Bun.env.NODE_ENV === "production";
const avatarDirectory = join(import.meta.dir, "..", "..", "..", "uploads", "avatars");
const emailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });
const tokenSchema = z.object({ token: z.string().min(32).max(256) });
const passwordResetSchema = tokenSchema.extend({ password: z.string().min(8).max(128) });
const unsubscribeSchema = tokenSchema.extend({ category: z.enum(["eventUpdates", "forumUpdates", "productUpdates"]) });
const googleCredentialSchema = z.object({
  credential: z.string().min(100).max(8_192),
  intent: z.enum(["login", "register"]),
});

userController.get("/group-invitations/:code", authRateLimit, (request: Request, response: Response) => {
  const code = String(request.params.code ?? "").trim().toUpperCase();
  const groupNumber = groupNumberForInviteCode(code);
  return groupNumber
    ? response.json({ valid: true, code, groupNumber })
    : response.status(404).json({ valid: false, error: "Código de grupo inválido" });
});

await mkdir(avatarDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: avatarDirectory,
    filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new Error("Avatar deve ser uma imagem PNG, JPEG ou WebP."));
    }
    return callback(null, true);
  },
});

const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? ".studentembassador.com" : undefined);

const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  maxAge: sessionDurationMs,
  path: "/",
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};


const hasValidImageSignature = async (path: string) => {
  const header = await readFile(path);
  const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isWebp = header.subarray(0, 4).toString() === "RIFF" && header.subarray(8, 12).toString() === "WEBP";
  return isPng || isJpeg || isWebp;
};

const publicUser = (user: User) => ({
  id: user._id.toHexString(),
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  state: user.state,
  city: user.city,
  userType: user.userType,
  avatarPath: user.avatarPath,
  bio: user.bio,
  githubUrl: user.githubUrl,
  linkedinUrl: user.linkedinUrl,
  instagramUrl: user.instagramUrl,
  phone: user.phone,
  avatarFrame: user.avatarFrame ?? "none",
  groupCode: user.groupCode,
  groupNumber: user.groupNumber,
});

const startSession = async (user: User, response: Response, status: number) => {
  const session = await createServerSession(user._id);
  return response.status(status).cookie(SESSION_COOKIE_NAME, session.token, { ...sessionCookieOptions, expires: session.expiresAt }).json({ user: publicUser(user) });
};

const issueAndSendVerification = async (user: User) => {
  const previous = {
    emailVerificationTokenHash: user.emailVerificationTokenHash,
    emailVerificationExpiresAt: user.emailVerificationExpiresAt,
  };
  const token = await issueEmailVerification(user);
  try {
    await sendVerificationEmail(user, token);
  } catch (error) {
    await restoreEmailVerification(user, previous);
    throw error;
  }
};

userController.get("/google/config", (_request: Request, response: Response) => {
  return response.json({ clientId: getGoogleOAuthClientId() });
});

userController.post("/google/authenticate", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { credential, intent } = googleCredentialSchema.parse(request.body);
    const identity = await verifyGoogleCredential(credential);
    const existing = await authenticateGoogleUser(identity);
    if (existing) return await startSession(existing, response, 200);
    if (intent === "login") throw new Error("Google account not registered");

    return response.json({
      requiresRegistration: true,
      profile: { name: identity.name, email: identity.email, picture: identity.picture },
    });
  } catch (error) {
    return next(error);
  }
});

userController.post("/google/register", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const credential = z.string().min(100).max(8_192).parse(request.body?.credential);
    const identity = await verifyGoogleCredential(credential);
    const existing = await authenticateGoogleUser(identity);
    if (existing) return await startSession(existing, response, 200);

    const registration = userSchema.parse({
      ...request.body,
      email: identity.email,
      password: randomBytes(32).toString("base64url"),
    });
    return await startSession(await createGoogleUser(registration, identity), response, 201);
  } catch (error) {
    return next(error);
  }
});

userController.post("/register", authRateLimit, upload.single("avatar"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (request.file && !(await hasValidImageSignature(request.file.path))) {
      throw new Error("O arquivo enviado não é uma imagem válida.");
    }
    const avatarPath = request.file ? `/uploads/avatars/${request.file.filename}` : undefined;
    const user = await createUser(userSchema.parse({ ...request.body, avatarPath }));
    try {
      await issueAndSendVerification(user);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Mailgun")) {
        return response.status(202).json({
          email: user.email,
          message: "Sua conta está pendente de confirmação. O envio do e-mail está indisponível agora; use ‘Reenviar confirmação’ em alguns instantes.",
        });
      }
      throw error;
    }
    return response.status(201).json({
      email: user.email,
      message: "Enviamos um link de confirma\u00e7\u00e3o para o seu e-mail. Confirme sua conta para entrar no Hub.",
    });
  } catch (error) {
    if (request.file) await unlink(request.file.path).catch(() => undefined);
    return next(error);
  }
});

userController.post("/email-verification/verify", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    return await startSession(await verifyEmail(tokenSchema.parse(request.body).token), response, 200);
  } catch (error) {
    return next(error);
  }
});

userController.post("/email-verification/resend", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = emailSchema.parse(request.body);
    const user = await findUserByEmail(email);
    if (user && !user.emailVerifiedAt) {
      await issueAndSendVerification(user);
    }
    return response.json({ message: "Se houver uma conta pendente para este e-mail, enviaremos um novo link de confirma\u00e7\u00e3o." });
  } catch (error) {
    return next(error);
  }
});

userController.post("/password-reset/request", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = emailSchema.parse(request.body);
    const user = await findUserByEmail(email);
    if (user) {
      const previous = { passwordResetTokenHash: user.passwordResetTokenHash, passwordResetExpiresAt: user.passwordResetExpiresAt };
      const result = await issuePasswordReset(email);
      if (result) {
        try {
          await sendPasswordResetEmail(result.user, result.token);
        } catch (error) {
          await restorePasswordReset(result.user, previous);
          throw error;
        }
      }
    }
    return response.json({ message: "Se este e-mail estiver cadastrado, enviaremos as instru\u00e7\u00f5es para redefinir a senha." });
  } catch (error) {
    return next(error);
  }
});

userController.post("/password-reset/confirm", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { token, password } = passwordResetSchema.parse(request.body);
    await resetPassword(token, password);
    return response.json({ message: "Senha redefinida com sucesso. Agora voc\u00ea j\u00e1 pode entrar." });
  } catch (error) {
    return next(error);
  }
});

userController.post("/email-preferences/unsubscribe", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { token, category } = unsubscribeSchema.parse(request.body);
    const preferences = await unsubscribeEmailCategory(token, category);
    return response.json({ message: "Voc\u00ea n\u00e3o receber\u00e1 mais esse tipo de atualiza\u00e7\u00e3o.", preferences });
  } catch (error) {
    return next(error);
  }
});

userController.post("/login", authRateLimit, async (request: Request, response: Response, next: NextFunction) => {
  try {
    return await startSession(await loginUser(loginSchema.parse(request.body)), response, 200);
  } catch (error) {
    return next(error);
  }
});

userController.get("/me", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const user = await findUserById(request.userId!);
    if (!user) return response.status(401).json({ error: "Sessão inválida ou expirada" });
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

userController.get("/me/campuses", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const campuses = await getUserCampuses(request.userId!);
    return response.json({ campuses });
  } catch (error) {
    return next(error);
  }
});


userController.get("/dashboard", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const user = await findUserById(request.userId!);
    if (!user) return response.status(401).json({ error: "Sessao invalida ou expirada" });
    return response.json(await getDashboard(await ensureUserInviteCode(user)));
  } catch (error) {
    return next(error);
  }
});

userController.get("/ambassadors", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    return response.json({ ambassadors: await listAmbassadors(viewerId) });
  } catch (error) {
    return next(error);
  }
});

userController.post("/ambassadors/:userId/like", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    return response.json(await toggleAmbassadorLike(String(request.params.userId), request.userId!));
  } catch (error) {
    return next(error);
  }
});

userController.get("/public/:userId", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const profile = await getPublicProfile(String(request.params.userId), await getAuthenticatedUserId(request));
    if (!profile) return response.status(404).json({ error: "Perfil nao encontrado" });
    return response.json(profile);
  } catch (error) {
    return next(error);
  }
});

userController.post("/public/:userId/like", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    return response.json(await toggleProfileLike(String(request.params.userId), request.userId!));
  } catch (error) {
    return next(error);
  }
});

userController.patch("/profile", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const user = await updateUserProfile(request.userId!, profileSchema.parse(request.body));
    if (!user) return response.status(401).json({ error: "Sessao invalida ou expirada" });
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

userController.post("/logout", async (request: Request, response: Response, next: NextFunction) => {
  try {
    await revokeServerSession(readCookie(request, SESSION_COOKIE_NAME));
    response.clearCookie(SESSION_COOKIE_NAME, { ...sessionCookieOptions, maxAge: undefined });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default userController;
