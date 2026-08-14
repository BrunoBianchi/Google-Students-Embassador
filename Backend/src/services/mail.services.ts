import type { EmailPreferences, User } from "../database/models/user.model";

const appUrl = (process.env.PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const mailgunApiKey = process.env.MAILGUN_API_KEY;
// This address must be an authorized sender in the configured Mailgun domain.
const mailgunFrom = "Google Student Ambassador Hub <no-reply@studentembassador.com>";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const displayName = (user: Pick<User, "name" | "nickname">) => user.nickname ?? user.name;
const actionUrl = (path: string) => `${appUrl}${path}`;

const emailShell = ({ eyebrow, title, intro, actionLabel, actionHref, detail, unsubscribeHref }: { eyebrow: string; title: string; intro: string; actionLabel: string; actionHref: string; detail: string; unsubscribeHref?: string }) => {
  const safeTitle = escapeHtml(title);
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f5f7fb;font-family:Arial,'Google Sans',sans-serif;color:#17233a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #d9e2f0;border-radius:24px;overflow:hidden"><tr><td style="height:8px;background:linear-gradient(90deg,#4285f4 0 25%,#ea4335 25% 50%,#fbbc04 50% 75%,#34a853 75% 100%)"></td></tr><tr><td style="padding:34px 38px 22px"><p style="margin:0;color:#4285f4;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">${escapeHtml(eyebrow)}</p><h1 style="margin:14px 0 16px;font-size:30px;line-height:1.18;color:#17233a">${safeTitle}</h1><p style="margin:0;color:#41546f;font-size:16px;line-height:1.65">${escapeHtml(intro)}</p><p style="margin:26px 0"><a href="${actionHref}" style="display:inline-block;background:#4285f4;border:2px solid #17233a;border-radius:12px;box-shadow:4px 4px 0 #17233a;color:#fff;font-weight:700;padding:13px 20px;text-decoration:none">${escapeHtml(actionLabel)} →</a></p><p style="margin:0;color:#60728d;font-size:13px;line-height:1.6">${escapeHtml(detail)}</p></td></tr><tr><td style="padding:18px 38px;background:#f8faff;border-top:1px solid #e6edf7;color:#6b7c94;font-size:12px;line-height:1.5">Google Student Ambassador Hub<br/>Projeto acadêmico independente.${unsubscribeHref ? ` <a href="${unsubscribeHref}" style="color:#4285f4">Gerenciar e-mails</a>` : ""}</td></tr></table></td></tr></table></body></html>`;
};

export const sendMail = async ({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) => {
  if (!mailgunDomain || !mailgunApiKey) {
    const message = "Mailgun não configurado. Defina MAILGUN_DOMAIN e MAILGUN_API_KEY.";
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.warn(message, { to, subject });
    return;
  }
  const body = new URLSearchParams({ from: mailgunFrom, to, subject, html, text });
  const authorization = `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString("base64")}`;
  const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error(`Mailgun não aceitou o e-mail (${response.status}).`);
};

export const preferenceUrl = (user: Pick<User, "emailPreferenceToken">, category: keyof EmailPreferences) => actionUrl(`/unsubscribe?token=${encodeURIComponent(user.emailPreferenceToken ?? "")}&category=${category}`);

export const sendVerificationEmail = async (user: User, token: string) => {
  const url = actionUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  const name = displayName(user);
  await sendMail({ to: user.email, subject: "Confirme seu e-mail no Google Student Ambassador Hub", html: emailShell({ eyebrow: "Confirmação de conta", title: "Seu lugar na comunidade começa aqui.", intro: `Olá, ${name}. Confirme seu e-mail para ativar a conta e participar de eventos, fóruns e grupos.`, actionLabel: "Confirmar meu e-mail", actionHref: url, detail: "Este link expira em 24 horas. Se você não criou esta conta, pode ignorar esta mensagem." }), text: `Olá, ${name}. Confirme seu e-mail: ${url}` });
};

export const sendPasswordResetEmail = async (user: User, token: string) => {
  const url = actionUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  const name = displayName(user);
  await sendMail({ to: user.email, subject: "Redefina sua senha do Google Student Ambassador Hub", html: emailShell({ eyebrow: "Segurança da conta", title: "Vamos recuperar seu acesso.", intro: `Olá, ${name}. Recebemos um pedido para redefinir a senha da sua conta.`, actionLabel: "Criar nova senha", actionHref: url, detail: "O link expira em uma hora e só pode ser usado uma vez. Se não foi você, ignore este e-mail." }), text: `Olá, ${name}. Redefina sua senha: ${url}` });
};

export const sendEventUpdateEmail = async (user: User, event: { id: string; title: string }, content: string) => {
  const url = actionUrl(`/events/${event.id}`);
  const name = displayName(user);
  await sendMail({ to: user.email, subject: `Atualização: ${event.title}`, html: emailShell({ eyebrow: "Atualização de evento", title: event.title, intro: `Olá, ${name}. A organização publicou uma novidade: “${content.slice(0, 220)}”`, actionLabel: "Ver atualização", actionHref: url, detail: "Você recebe este aviso porque confirmou presença neste evento.", unsubscribeHref: preferenceUrl(user, "eventUpdates") }), text: `Atualização de ${event.title}: ${content}\n${url}` });
};

export const sendForumUpdateEmail = async (user: User, forum: { id: string; title: string }, content: string) => {
  const url = actionUrl(`/forums/${forum.id}`);
  const name = displayName(user);
  await sendMail({ to: user.email, subject: `Nova mensagem em ${forum.title}`, html: emailShell({ eyebrow: "Atividade no fórum", title: forum.title, intro: `Olá, ${name}. Uma nova mensagem foi publicada: “${content.slice(0, 220)}”`, actionLabel: "Abrir conversa", actionHref: url, detail: "Você recebe este aviso porque participa deste fórum.", unsubscribeHref: preferenceUrl(user, "forumUpdates") }), text: `Nova mensagem em ${forum.title}: ${content}\n${url}` });
};
