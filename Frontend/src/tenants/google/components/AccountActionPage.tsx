import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, MailCheck, MailX, ShieldCheck } from "lucide-react";
import { authApi, type EmailPreferenceCategory } from "../../../services/auth";

type AccountAction = "verify" | "forgot" | "reset" | "unsubscribe";
type Props = { action: AccountAction };

const categoryLabels: Record<EmailPreferenceCategory, string> = {
  eventUpdates: "atualiza\u00e7\u00f5es de eventos",
  forumUpdates: "atualiza\u00e7\u00f5es de f\u00f3runs",
  productUpdates: "novidades do Hub",
};

const AccountActionPage = ({ action }: Props) => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token") ?? "";
  const requestedCategory = params.get("category");
  const category = (requestedCategory === "eventUpdates" || requestedCategory === "forumUpdates" || requestedCategory === "productUpdates") ? requestedCategory : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(action === "verify" || action === "unsubscribe");

  useEffect(() => {
    if (action !== "verify" && action !== "unsubscribe") return;
    if (!token || (action === "unsubscribe" && !category)) {
      setError("Este link est\u00e1 incompleto ou j\u00e1 n\u00e3o \u00e9 v\u00e1lido.");
      setLoading(false);
      return;
    }
    const run = async () => {
      try {
        if (action === "verify") {
          await authApi.verifyEmail(token);
          setStatus("E-mail confirmado. Sua conta est\u00e1 pronta para o Hub.");
        } else {
          const result = await authApi.unsubscribeEmailCategory(token, category!);
          setStatus(result.message);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "N\u00e3o foi poss\u00edvel concluir esta solicita\u00e7\u00e3o.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [action, category, token]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (action === "reset" && password !== confirmation) {
      setError("As duas senhas precisam ser iguais.");
      return;
    }
    setLoading(true);
    try {
      const result = action === "forgot"
        ? await authApi.requestPasswordReset(email)
        : await authApi.resetPassword(token, password);
      setStatus(result.message);
      if (action === "reset") setPassword("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "N\u00e3o foi poss\u00edvel concluir esta solicita\u00e7\u00e3o.");
    } finally {
      setLoading(false);
    }
  };

  const copy = action === "verify"
    ? { eyebrow: "Confirma\u00e7\u00e3o de conta", title: "Confirmando seu e-mail", description: "Protegemos a comunidade confirmando que este e-mail pertence a voc\u00ea.", icon: MailCheck }
    : action === "forgot"
      ? { eyebrow: "Recuperar acesso", title: "Vamos ajudar voc\u00ea a entrar", description: "Informe seu e-mail e enviaremos um link seguro para criar uma nova senha.", icon: KeyRound }
      : action === "reset"
        ? { eyebrow: "Nova senha", title: "Crie uma senha segura", description: "Escolha uma senha com pelo menos oito caracteres para voltar ao Hub.", icon: ShieldCheck }
        : { eyebrow: "Prefer\u00eancias de e-mail", title: "Atualiza\u00e7\u00f5es ajustadas", description: category ? `Voc\u00ea pode deixar de receber ${categoryLabels[category]} sem sair da comunidade.` : "Ajuste suas prefer\u00eancias de comunica\u00e7\u00e3o.", icon: MailX };
  const Icon = copy.icon;

  return <main className="min-h-screen bg-[#f7f9fd] px-4 py-6 text-[#1e293b] sm:px-6 sm:py-10">
    <div className="mx-auto max-w-xl">
      <header className="mb-8 flex items-center justify-between"><a href="/" aria-label="Voltar ao Hub"><img src="/logo.png" alt="Google Student Ambassador" className="h-9 w-auto" /></a><a href="/login" className="inline-flex items-center gap-2 text-sm font-black hover:text-[#4285f4]"><ArrowLeft size={17} /> Entrar</a></header>
      <section className="overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid h-2 grid-cols-4"><span className="bg-[#4285f4]" /><span className="bg-[#ea4335]" /><span className="bg-[#fbbc04]" /><span className="bg-[#34a853]" /></div>
        <div className="p-6 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf3fe] text-[#4285f4]"><Icon size={25} /></div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#4285f4]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-600">{copy.description}</p>

          {(action === "forgot" || action === "reset") && !status && <form onSubmit={submit} className="mt-7 space-y-5">
            {action === "forgot" ? <label className="block"><span className="mb-2 block text-sm font-black">E-mail</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@universidade.edu.br" className="input-auth" /></label> : <>
              <label className="block"><span className="mb-2 block text-sm font-black">Nova senha</span><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-auth" /></label>
              <label className="block"><span className="mb-2 block text-sm font-black">Confirmar nova senha</span><input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="input-auth" /></label>
            </>}
            <button disabled={loading} className="button-primary w-full justify-center" type="submit">{loading ? "Aguarde..." : action === "forgot" ? "Enviar link de recupera\u00e7\u00e3o" : "Salvar nova senha"}</button>
          </form>}

          {loading && <p className="mt-7 rounded-xl bg-[#ebf3fe] px-4 py-3 text-sm font-bold text-[#264f91]">Estamos concluindo sua solicita\u00e7\u00e3o...</p>}
          {status && <div className="mt-7 rounded-2xl border border-[#34a853]/30 bg-[#edf8f0] p-4 text-sm font-bold text-[#18723a]"><CheckCircle2 className="mr-2 inline-block" size={19} />{status}</div>}
          {error && <p role="alert" className="mt-7 rounded-2xl border border-[#ea4335]/30 bg-[#fdf0ef] p-4 text-sm font-bold text-[#b3261e]">{error}</p>}
          {status && <div className="mt-6 flex flex-wrap gap-3"><a href={action === "verify" ? "/dashboard" : "/login"} className="button-primary">{action === "verify" ? "Ir para o Hub" : "Ir para entrar"}</a>{action === "forgot" && <a href="/login" className="button-secondary">Voltar</a>}</div>}
        </div>
      </section>
      <p className="mt-8 text-center text-xs font-medium text-slate-500">Projeto acad\u00eamico independente, sem v\u00ednculo oficial com a Google LLC.</p>
    </div>
  </main>;
};

export default AccountActionPage;
