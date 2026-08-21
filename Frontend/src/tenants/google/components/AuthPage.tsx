import React, { type FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, ChevronLeft, Eye, EyeOff, LockKeyhole, Mail, Search, UserRound, UsersRound, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, type University } from '../../../services/auth';
import Logo from './Logo';
import GoogleIdentityButton from './GoogleIdentityButton';

type AuthMode = 'login' | 'register';
type AccountType = 'ambassador' | 'student';
type AuthPageProps = { mode: AuthMode };

type RegistrationDraft = {
  step: number;
  name: string;
  nickname: string;
  birth: string;
  state: string;
  city: string;
  userType: AccountType | null;
  universityQuery: string;
  selectedUniversity: University | null;
  creatingUniversity: boolean;
  groupCode: string;
  groupInviteCode: string;
  email: string;
  agreed: boolean;
  emailUpdates: boolean;
};

const draftKey = 'campus-register-draft-v1';
const defaultDraft: RegistrationDraft = {
  step: 1, name: '', nickname: '', birth: '', state: '', city: '', userType: null, universityQuery: '',
  selectedUniversity: null, creatingUniversity: false, groupCode: '', groupInviteCode: '', email: '', agreed: false, emailUpdates: false,
};

const steps = ['Conta', 'Perfil', 'Acesso'];
const brazilianStateOptions = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'], ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'], ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
] as const;

const loadDraft = (): RegistrationDraft => {
  try {
    const queryCode = new URLSearchParams(window.location.search).get('groupCode')?.trim().toUpperCase() ?? '';
    const saved = sessionStorage.getItem(draftKey) || sessionStorage.getItem('gsa-register-draft-v1');
    const restored = saved ? JSON.parse(saved) : {};
    const base = { ...defaultDraft, ...restored, step: Math.min(Math.max(Number(restored.step) || 1, 1), 3) };
    const match = queryCode.match(/^G(0[1-9]|10)-[A-HJ-NP-Z2-9]{6}$/);
    return match
      ? { ...base, userType: 'ambassador', groupCode: String(Number(match[1])), groupInviteCode: queryCode }
      : base;
  } catch {
    return defaultDraft;
  }
};

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const isLogin = mode === 'login';
  const { login, register, authenticateWithGoogle, registerWithGoogle } = useAuth();
  const [draft, setDraft] = useState<RegistrationDraft>(loadDraft);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  const updateDraft = (changes: Partial<RegistrationDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setStatus('');
  };

  useEffect(() => {
    if (!isLogin) sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, isLogin]);

  useEffect(() => {
    if (isLogin || !draft.groupInviteCode) return;
    let active = true;
    authApi.validateGroupInviteCode(draft.groupInviteCode)
      .then(({ groupNumber }) => active && setDraft((current) => ({ ...current, userType: 'ambassador', groupCode: String(groupNumber) })))
      .catch(() => active && setStatus('O código de convite informado na URL é inválido ou expirou.'));
    return () => { active = false; };
  }, [draft.groupInviteCode, isLogin]);

  useEffect(() => {
    if (isLogin || draft.universityQuery.trim().length < 2 || draft.selectedUniversity || draft.creatingUniversity) {
      setUniversities([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      authApi.searchUniversities(draft.universityQuery)
        .then((results) => active && setUniversities(results))
        .catch(() => active && setUniversities([]));
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [draft.creatingUniversity, draft.selectedUniversity, draft.universityQuery, isLogin]);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!draft.name.trim()) { setStatus('Informe seu nome completo.'); return false; }
      if (!draft.userType) { setStatus('Selecione seu tipo de participação.'); return false; }
      return true;
    }
    if (step === 2) {
      if (!draft.birth) { setStatus('Informe sua data de nascimento.'); return false; }
      const age = (Date.now() - new Date(draft.birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (Number.isNaN(age) || age < 16) { setStatus('Você precisa ter pelo menos 16 anos para se cadastrar.'); return false; }
      if (!draft.state || !draft.city.trim()) { setStatus('Informe estado e cidade.'); return false; }
      if (!draft.selectedUniversity && !draft.creatingUniversity) {
        setStatus(draft.userType === 'ambassador' ? 'Selecione ou crie sua universidade.' : 'Selecione sua universidade.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!draft.email.includes('@')) { setStatus('Informe um e-mail válido.'); return false; }
      if (!googleCredential && password.length < 8) { setStatus('A senha precisa ter pelo menos 8 caracteres.'); return false; }
      if (!draft.agreed) { setStatus('Você precisa aceitar os Termos de Uso e a Política de Privacidade.'); return false; }
      return true;
    }
    return true;
  };

  const handleGoogleCredential = async (credential: string) => {
    setIsSubmitting(true);
    setStatus('Validando sua conta Google...');
    try {
      const result = await authenticateWithGoogle(credential, isLogin ? 'login' : 'register');
      if ('user' in result) {
        sessionStorage.removeItem(draftKey);
        window.location.assign('/');
        return;
      }

      setGoogleCredential(credential);
      updateDraft({ name: result.profile.name, email: result.profile.email, step: 1 });
      setStatus('Conta Google validada. Complete os dados do seu perfil para finalizar o cadastro.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível entrar com o Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(draft.step)) updateDraft({ step: Math.min(draft.step + 1, 3) });
  };

  const submitRegistration = async () => {
    if (!validateStep(1)) { setDraft((current) => ({ ...current, step: 1 })); return; }
    if (!validateStep(2)) { setDraft((current) => ({ ...current, step: 2 })); return; }
    if (!validateStep(3) || !draft.userType) return;
    const referralCode = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase();

    if (googleCredential) {
      setIsSubmitting(true);
      setStatus('');
      try {
        await registerWithGoogle({
          credential: googleCredential,
          name: draft.name,
          nickname: draft.nickname || undefined,
          birth: draft.birth,
          state: draft.state,
          city: draft.city.trim(),
          userType: draft.userType,
          universityId: draft.selectedUniversity?.id,
          newUniversityName: draft.creatingUniversity ? draft.universityQuery : undefined,
          groupNumber: draft.userType === 'ambassador' && draft.groupCode ? Number(draft.groupCode) : undefined,
          groupInviteCode: draft.userType === 'ambassador' && draft.groupInviteCode ? draft.groupInviteCode : undefined,
          termsAccepted: draft.agreed,
          emailUpdates: draft.emailUpdates,
          referralCode: referralCode && /^[A-Z0-9]{8}$/.test(referralCode) ? referralCode : undefined,
        });
        sessionStorage.removeItem(draftKey);
        window.location.assign('/');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Não foi possível criar sua conta com o Google.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const formData = new FormData();
    formData.set('name', draft.name);
    formData.set('nickname', draft.nickname);
    formData.set('birth', draft.birth);
    formData.set('state', draft.state);
    formData.set('city', draft.city.trim());
    formData.set('userType', draft.userType);
    formData.set('email', draft.email);
    formData.set('password', password);
    formData.set('termsAccepted', String(draft.agreed));
    formData.set('emailUpdates', String(draft.emailUpdates));
    if (draft.selectedUniversity) formData.set('universityId', draft.selectedUniversity.id);
    if (draft.creatingUniversity) formData.set('newUniversityName', draft.universityQuery);
    if (draft.userType === 'ambassador' && draft.groupCode) formData.set('groupNumber', draft.groupCode);
    if (draft.userType === 'ambassador' && draft.groupInviteCode) formData.set('groupInviteCode', draft.groupInviteCode);
    if (referralCode && /^[A-Z0-9]{8}$/.test(referralCode)) formData.set('referralCode', referralCode);

    setIsSubmitting(true);
    setStatus('');
    try {
      const result = await register(formData);
      sessionStorage.removeItem(draftKey);
      setPassword('');
      setStatus(result.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLogin) return draft.step === 3 ? submitRegistration() : nextStep();
    setIsSubmitting(true);
    setStatus('');
    try {
      await login(draft.email, password);
      window.location.assign('/');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível entrar no Hub.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerification = async () => {
    if (!draft.email) return setStatus('Informe seu e-mail para receber um novo link de confirmação.');
    setIsSubmitting(true);
    try {
      setStatus((await authApi.resendVerification(draft.email)).message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível reenviar a confirmação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAccountType = (userType: AccountType) => updateDraft({
    userType,
    groupCode: userType === 'student' ? '' : draft.groupCode,
    groupInviteCode: userType === 'student' ? '' : draft.groupInviteCode,
    creatingUniversity: userType === 'student' ? false : draft.creatingUniversity,
  });

  const universityInput = (value: string) => updateDraft({ universityQuery: value, selectedUniversity: null, creatingUniversity: false });

  return (
    <main className="min-h-screen bg-[#FAFAFE] text-[#1e293b] relative px-3 py-4 sm:px-6 sm:py-8">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4F46E5] via-[#06B6D4] to-[#10B981]" />
      <div className="relative max-w-5xl mx-auto">
        <header className="flex items-center justify-between py-3 sm:py-4">
          <a href="/" aria-label="Voltar para a página inicial"><Logo size="md" /></a>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-600 hover:text-[#4F46E5]"><ArrowLeft size={16} />Voltar ao início</a>
        </header>

        <section className="mt-4 sm:mt-6 overflow-hidden rounded-3xl border-2 border-[#1e293b] bg-white shadow-[6px_6px_0px_0px_#1e293b]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[#EEF2FF] p-6 sm:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-[#1e293b] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F46E5]/40 bg-white px-3 py-1 text-2xs sm:text-xs font-black uppercase text-[#4F46E5]">Comunidade Estudantil 2026</span>
                <h1 className="mt-4 text-2xl sm:text-3xl font-black leading-tight text-[#1e293b]">Sua rede independente de universitários e embaixadores.</h1>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">Conecte-se por campus, organize eventos acadêmicos, compartilhe conhecimento em IA e colabore em âmbito nacional.</p>
                <ul className="mt-6 space-y-3 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" />Espaços dedicados para cada universidade</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" />Ambiente seguro e aderente à LGPD</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#10B981]" />Certificados e trilhas de aprendizagem</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-indigo-100 text-2xs text-slate-500 font-medium">Plataforma independente criada pela comunidade estudantil.</div>
            </div>

            <div className="p-6 sm:p-10">
              {!isLogin && <div className="mb-6"><div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500"><span>Cadastro</span><span>Etapa {draft.step} de 3</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#4F46E5] transition-all duration-300" style={{ width: `${(draft.step / 3) * 100}%` }} /></div></div>}
              <span className="text-xs font-black uppercase tracking-wider text-[#4F46E5]">{isLogin ? 'Acesse sua conta' : `Etapa ${draft.step}: ${steps[draft.step - 1]}`}</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{isLogin ? 'Entrar no Hub' : draft.step === 1 ? 'Vamos começar' : draft.step === 2 ? 'Seu perfil no campus' : 'Proteja seu acesso'}</h2>
              <p className="mt-3 text-sm text-slate-600 font-medium">{isLogin ? 'Entre com seu e-mail e senha para acessar a comunidade.' : draft.step === 1 ? 'Conte como você participa da comunidade.' : draft.step === 2 ? 'Essas informações ajudam a conectar sua rede local.' : 'Revise e crie sua conta.'}</p>

              {!googleCredential ? (
                <div className="mt-6">
                  <div className="flex justify-center">
                    <GoogleIdentityButton
                      mode={mode}
                      disabled={isSubmitting}
                      onCredential={(credential) => void handleGoogleCredential(credential)}
                      onError={setStatus}
                    />
                  </div>
                  <div className="my-5 flex items-center gap-3 text-2xs font-black uppercase tracking-widest text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    ou continue com e-mail
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-[#34A853]/30 bg-[#E6F4EA] px-4 py-3 text-xs font-bold text-[#137333]">
                  <span className="flex items-center gap-2"><Check size={16} /> Conta Google confirmada: {draft.email}</span>
                  <button type="button" onClick={() => setGoogleCredential(null)} className="mt-2 font-black underline">Usar outra forma de cadastro</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isLogin && <>
                  <label className="block"><span className="mb-2 block text-sm font-black">E-mail</span><span className="relative block"><Mail size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} type="email" autoComplete="email" placeholder="voce@universidade.edu.br" className="input-auth input-auth-leading-icon" /></span></label>
                  <PasswordField password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} login />
                </>}

                {!isLogin && draft.step === 1 && <>
                  <label className="block"><span className="mb-2 block text-sm font-black">Nome completo</span><span className="relative block"><UserRound size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} autoComplete="name" placeholder="Como podemos chamar você?" className="input-auth input-auth-leading-icon" /></span></label>
                  <fieldset><legend className="mb-2 text-sm font-black">Você é Embaixador Estudantil 2026?</legend><div className="grid gap-3 sm:grid-cols-2"><AccountTypeCard selected={draft.userType === 'ambassador'} onClick={() => selectAccountType('ambassador')} type="ambassador" /><AccountTypeCard selected={draft.userType === 'student'} onClick={() => selectAccountType('student')} type="student" /></div></fieldset>
                </>}

                {!isLogin && draft.step === 2 && <>
                  <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-black">Apelido <em className="font-medium text-slate-500">(opcional)</em></span><input value={draft.nickname} onChange={(event) => updateDraft({ nickname: event.target.value })} maxLength={40} placeholder="Como quer aparecer?" className="input-auth" /></label><label className="block"><span className="mb-2 block text-sm font-black">Nascimento</span><input required value={draft.birth} onChange={(event) => updateDraft({ birth: event.target.value })} type="date" max={new Date().toISOString().slice(0, 10)} className="input-auth" /></label></div>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"><label className="block"><span className="mb-2 block text-sm font-black">Estado (UF)</span><select required value={draft.state} onChange={(event) => updateDraft({ state: event.target.value })} className="input-auth"><option value="">Selecione</option>{brazilianStateOptions.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-black">Cidade</span><input required value={draft.city} onChange={(event) => updateDraft({ city: event.target.value })} maxLength={100} autoComplete="address-level2" placeholder="Ex.: Belo Horizonte" className="input-auth" /></label></div>
                  {draft.userType === 'ambassador' && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-black">
                        Grupo de Embaixadores <em className="font-medium text-slate-500">(Grupo 1 até 10)</em>
                      </span>
                      <select
                        value={draft.groupCode}
                        onChange={(event) => updateDraft({ groupCode: event.target.value, groupInviteCode: '' })}
                        className="input-auth"
                      >
                        <option value="">Selecione seu grupo (opcional)</option>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={String(num)}>
                            Grupo {num}
                          </option>
                        ))}
                      </select>
                      {draft.groupInviteCode && <span className="mt-2 flex items-center gap-2 rounded-xl border border-[#34A853]/30 bg-[#E6F4EA] px-3 py-2 text-xs font-black text-[#137333]"><Check size={14} /> Convite {draft.groupInviteCode} aplicado ao Grupo {draft.groupCode}</span>}
                      <span className="mt-1.5 block text-2xs text-slate-500 font-medium">
                        Caso não escolha agora, você poderá definir seu grupo uma única vez nas configurações do seu perfil.
                      </span>
                    </label>
                  )}
                </>}

                {!isLogin && draft.step === 3 && <>
                  <div className="rounded-2xl bg-[#EEF2FF] p-4 text-xs sm:text-sm border border-[#4F46E5]/20">
                    <strong className="text-slate-900 font-black">{draft.name}</strong>{draft.nickname && ` · ${draft.nickname}`}<br />
                    <span className="text-slate-600 font-medium">{draft.userType === 'ambassador' ? 'Embaixador estudantil 2026' : 'Estudante'} · {draft.selectedUniversity?.name ?? draft.universityQuery.toLowerCase()}</span>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black">E-mail institucional ou de acesso</span>
                    <span className="relative block">
                      <Mail size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required disabled={Boolean(googleCredential)} value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} type="email" autoComplete="email" placeholder="voce@universidade.edu.br" className="input-auth input-auth-leading-icon disabled:bg-slate-100 disabled:text-slate-500" />
                    </span>
                  </label>

                  {!googleCredential && <PasswordField password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} />}

                  {/* Minimalist Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 font-medium cursor-pointer select-none">
                      <input
                        required
                        checked={draft.agreed}
                        onChange={(event) => updateDraft({ agreed: event.target.checked })}
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 accent-[#4285F4] cursor-pointer shrink-0"
                      />
                      <span>
                        Li e concordo com os <a href="/terms" target="_blank" rel="noreferrer" className="font-black text-[#4285F4] hover:underline">Termos de Uso</a> e com a <a href="/privacy" target="_blank" rel="noreferrer" className="font-black text-[#34A853] hover:underline">Política de Privacidade</a>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 font-medium cursor-pointer select-none">
                      <input
                        checked={draft.emailUpdates}
                        onChange={(event) => updateDraft({ emailUpdates: event.target.checked })}
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 accent-[#4285F4] cursor-pointer shrink-0"
                      />
                      <span>
                        Eu desejo receber comunicação via e-mail
                      </span>
                    </label>
                  </div>

                  <p className="text-2xs text-slate-400">{googleCredential ? 'Sua identidade será confirmada novamente pelo Google ao criar a conta.' : 'Por segurança, sua senha nunca é gravada em rascunhos temporários.'}</p>
                </>}

                <div className="flex gap-3 pt-1">
                  {!isLogin && draft.step > 1 && <button type="button" onClick={() => updateDraft({ step: draft.step - 1 })} className="button-secondary"><ChevronLeft size={18} />Voltar</button>}
                  <button disabled={isSubmitting} type="submit" className="button-primary flex-1">{isSubmitting ? 'Aguarde…' : isLogin ? 'Entrar no Hub' : draft.step === 3 ? googleCredential ? 'Criar conta com Google' : 'Criar minha conta' : 'Avançar'} <ArrowRight size={18} /></button>
                </div>
              </form>
              {status && <div role="status" className="mt-5 rounded-xl bg-[#EEF2FF] px-4 py-3 text-xs font-bold border border-[#4F46E5]/30"><p>{status}</p>{isLogin && draft.email && <button type="button" disabled={isSubmitting} onClick={resendVerification} className="mt-2 font-black text-[#4F46E5] hover:underline">Reenviar confirmação por e-mail</button>}</div>}
              <p className="mt-6 text-center text-sm font-medium text-slate-600">{isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'} <a href={isLogin ? '/register' : '/login'} className="font-black text-[#4F46E5] hover:underline">{isLogin ? 'Cadastre-se' : 'Entrar'}</a></p>
            </div>
          </div>
        </section>
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">Campus Ambassador Hub · Projeto independente sem vínculo oficial com a Google LLC ou Amplifica.</p>
      </div>
    </main>
  );
};

const PasswordField = ({ password, setPassword, showPassword, setShowPassword, login = false }: { password: string; setPassword: (value: string) => void; showPassword: boolean; setShowPassword: (value: boolean | ((current: boolean) => boolean)) => void; login?: boolean }) => <label className="block"><span className="mb-2 flex justify-between text-sm font-black">Senha{login && <a href="/forgot-password" className="text-xs text-[#4F46E5] hover:underline">Esqueci minha senha</a>}</span><span className="relative block"><LockKeyhole size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} type={showPassword ? 'text' : 'password'} autoComplete={login ? 'current-password' : 'new-password'} placeholder="Mínimo de 8 caracteres" className="input-auth input-auth-leading-and-trailing-icon" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-1.5 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>;

const AccountTypeCard = ({ selected, onClick, type }: { selected: boolean; onClick: () => void; type: AccountType }) => { const ambassador = type === 'ambassador'; return <button type="button" onClick={onClick} className={`rounded-xl border-2 p-4 text-left ${selected ? ambassador ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-[#10B981] bg-[#EFFBF3]' : 'border-slate-200 hover:border-[#4F46E5]/50'}`}>{ambassador ? <UsersRound size={21} className="mb-2 text-[#4F46E5]" /> : <UserRound size={21} className="mb-2 text-[#10B981]" />}<strong className="block text-sm">{ambassador ? 'Sim, sou embaixador' : 'Sou estudante'}</strong><span className="text-xs text-slate-600">{ambassador ? 'Posso cadastrar iniciativas e criar grupos.' : 'Posso descobrir eventos e a comunidade.'}</span></button>; };

const UniversityPicker = ({ draft, universities, onInput, onSelect, onCreate, onClear }: { draft: RegistrationDraft; universities: University[]; onInput: (value: string) => void; onSelect: (university: University) => void; onCreate: () => void; onClear: () => void }) => <div className="relative"><span className="mb-2 block text-sm font-black">Universidade</span><span className="relative block"><Search size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={draft.universityQuery} onChange={(event) => onInput(event.target.value)} placeholder="Busque sua universidade" className="input-auth input-auth-leading-icon" /></span>{draft.selectedUniversity && <div className="mt-2 flex items-center justify-between rounded-lg bg-[#EFFBF3] px-3 py-2 text-sm font-bold"><span>{draft.selectedUniversity.name}</span><button type="button" onClick={onClear} aria-label="Remover universidade"><X size={16} /></button></div>}{universities.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border-2 border-[#1e293b] bg-white p-1 shadow-lg">{universities.map((university) => <button type="button" key={university.id} onClick={() => onSelect(university)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-[#EEF2FF]">{university.name}</button>)}</div>}{draft.userType === 'ambassador' && !draft.selectedUniversity && !draft.creatingUniversity && draft.universityQuery.trim().length >= 3 && <button type="button" onClick={onCreate} className="mt-2 inline-flex items-center gap-2 text-sm font-black text-[#4F46E5] hover:underline"><Building2 size={17} />Não encontrou? Criar “{draft.universityQuery.trim().toLowerCase()}”</button>}{draft.userType === 'student' && !draft.selectedUniversity && draft.universityQuery.trim().length >= 3 && <p className="mt-2 text-xs font-medium text-slate-500">Não encontrou? Peça a um embaixador para cadastrar a universidade.</p>}{draft.creatingUniversity && <p className="mt-2 rounded-lg bg-[#EEF2FF] p-3 text-xs font-bold">A universidade será criada em minúsculas e reutilizada caso já exista no banco.</p>}</div>;

export default AuthPage;
