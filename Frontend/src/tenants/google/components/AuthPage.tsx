import React, { type ChangeEvent, type DragEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, ChevronLeft, Eye, EyeOff, ImagePlus, LockKeyhole, Mail, Search, UserRound, UsersRound, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, type University } from '../../../services/auth';

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
  email: string;
  agreed: boolean;
  emailUpdates: '' | 'yes' | 'no';
};

const draftKey = 'gsa-register-draft-v1';
const defaultDraft: RegistrationDraft = {
  step: 1, name: '', nickname: '', birth: '', state: '', city: '', userType: null, universityQuery: '',
  selectedUniversity: null, creatingUniversity: false, groupCode: '', email: '', agreed: false, emailUpdates: '',
};

const steps = ['Conta', 'Perfil', 'Acesso'];
const brazilianStateOptions = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'], ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'], ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
] as const;

const loadDraft = (): RegistrationDraft => {
  try {
    const saved = sessionStorage.getItem(draftKey);
    if (!saved) return defaultDraft;
    return { ...defaultDraft, ...JSON.parse(saved), step: Math.min(Math.max(Number(JSON.parse(saved).step) || 1, 1), 3) };
  } catch {
    return defaultDraft;
  }
};

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const [draft, setDraft] = useState<RegistrationDraft>(loadDraft);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDraft = (changes: Partial<RegistrationDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setStatus('');
  };

  useEffect(() => {
    if (!isLogin) sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, isLogin]);

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

  useEffect(() => {
    if (!avatar) return setAvatarPreview('');
    const previewUrl = URL.createObjectURL(avatar);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatar]);

  const chooseAvatar = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setStatus('Escolha uma imagem PNG, JPEG ou WebP de até 4 MB.');
      return;
    }
    setAvatar(file);
    setStatus('');
  };

  const validateStep = (step: number) => {
    if (step === 1 && (draft.name.trim().length < 2 || !draft.userType)) {
      setStatus('Informe seu nome e escolha seu tipo de participação.');
      return false;
    }
    if (step === 2) {
      if (!draft.birth) { setStatus('Informe sua data de nascimento.'); return false; }
      if (!brazilianStateOptions.some(([code]) => code === draft.state) || draft.city.trim().length < 2) { setStatus('Informe um estado (UF) válido e sua cidade.'); return false; }
      if (!draft.selectedUniversity && !draft.creatingUniversity) { setStatus('Selecione a sua universidade.'); return false; }
      if (draft.creatingUniversity && draft.universityQuery.trim().length < 3) { setStatus('Informe o nome completo da nova universidade.'); return false; }
    }
    if (step === 3 && (!draft.email || password.length < 8 || !draft.agreed || !draft.emailUpdates)) {
      setStatus('Informe um e-mail, uma senha de ao menos 8 caracteres e aceite os termos.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(draft.step)) updateDraft({ step: Math.min(draft.step + 1, 3) });
  };

  const submitRegistration = async () => {
    if (!validateStep(1)) { setDraft((current) => ({ ...current, step: 1 })); return; }
    if (!validateStep(2)) { setDraft((current) => ({ ...current, step: 2 })); return; }
    if (!validateStep(3) || !draft.userType) return;
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
    formData.set('emailUpdates', String(draft.emailUpdates === 'yes'));
    if (draft.selectedUniversity) formData.set('universityId', draft.selectedUniversity.id);
    if (draft.creatingUniversity) formData.set('newUniversityName', draft.universityQuery);
    if (draft.userType === 'ambassador' && draft.groupCode) formData.set('groupCode', draft.groupCode);
    const referralCode = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase();
    if (referralCode && /^[A-Z0-9]{8}$/.test(referralCode)) formData.set('referralCode', referralCode);
    if (avatar) formData.set('avatar', avatar);

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
    creatingUniversity: userType === 'student' ? false : draft.creatingUniversity,
  });

  const universityInput = (value: string) => updateDraft({ universityQuery: value, selectedUniversity: null, creatingUniversity: false });

  return (
    <main className="min-h-screen bg-[#FAFAFE] text-[#1e293b] relative px-3 py-4 sm:px-6 sm:py-8">
      <div className="absolute top-0 left-0 right-0 grid grid-cols-4 h-2.5"><div className="bg-[#4285F4]" /><div className="bg-[#EA4335]" /><div className="bg-[#FBBC04]" /><div className="bg-[#34A853]" /></div>
      <div className="relative max-w-5xl mx-auto">
        <header className="flex items-center justify-between py-3 sm:py-4">
          <a href="/" aria-label="Voltar para a página inicial"><img src="/logo.png" alt="Google Student Ambassador" className="h-8 sm:h-10 w-auto object-contain" /></a>
          <a href="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-black hover:text-[#4285F4]"><ArrowLeft size={16} /> Voltar ao Hub</a>
        </header>

        <section className="mt-5 sm:mt-8 grid items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden lg:block sticky top-8 rounded-3xl border-3 border-[#1e293b] bg-[#1e293b] p-8 text-white shadow-hard-black">
            <span className="inline-flex bg-[#FBBC04] text-[#1e293b] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md -rotate-2">GSA Brasil Hub</span>
            <h1 className="mt-5 text-3xl font-black leading-tight">{isLogin ? 'Que bom ter você de volta.' : 'Sua comunidade começa aqui.'}</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 font-medium">{isLogin ? 'Entre para acompanhar sua rede local.' : 'Três etapas rápidas para completar seu perfil.'}</p>
            {!isLogin && <ol className="mt-7 space-y-4">{steps.map((label, index) => <li key={label} className={`flex items-center gap-3 text-sm font-black ${draft.step >= index + 1 ? 'text-white' : 'text-slate-500'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${draft.step > index + 1 ? 'bg-[#34A853] border-[#34A853]' : draft.step === index + 1 ? 'border-[#FBBC04] text-[#FBBC04]' : 'border-slate-600'}`}>{draft.step > index + 1 ? <Check size={15} /> : index + 1}</span>{label}</li>)}</ol>}
          </aside>

          <div className="rounded-3xl border-3 border-[#1e293b] bg-white p-6 sm:p-8 shadow-hard-black">
            <div className="max-w-xl mx-auto">
              {!isLogin && <div className="mb-6"><div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500"><span>Cadastro</span><span>Etapa {draft.step} de 3</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#4285F4] transition-all duration-300" style={{ width: `${(draft.step / 3) * 100}%` }} /></div></div>}
              <span className="text-xs font-black uppercase tracking-wider text-[#4285F4]">{isLogin ? 'Acesse sua conta' : `Etapa ${draft.step}: ${steps[draft.step - 1]}`}</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{isLogin ? 'Entrar no Hub' : draft.step === 1 ? 'Vamos começar' : draft.step === 2 ? 'Seu perfil no campus' : 'Proteja seu acesso'}</h2>
              <p className="mt-3 text-sm text-slate-600 font-medium">{isLogin ? 'Entre com seu e-mail e senha para acessar a comunidade.' : draft.step === 1 ? 'Conte como você participa da comunidade.' : draft.step === 2 ? 'Essas informações ajudam a conectar sua rede local.' : 'Revise e crie sua conta.'}</p>

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
                  <UniversityPicker draft={draft} universities={universities} onInput={universityInput} onSelect={(university) => { updateDraft({ selectedUniversity: university, universityQuery: university.name, creatingUniversity: false }); setUniversities([]); }} onCreate={() => { updateDraft({ creatingUniversity: true }); setUniversities([]); }} onClear={() => updateDraft({ selectedUniversity: null, universityQuery: '' })} />
                  {draft.userType === 'ambassador' && <label className="block"><span className="mb-2 block text-sm font-black">Código de grupo <em className="font-medium text-slate-500">(opcional)</em></span><input value={draft.groupCode} onChange={(event) => updateDraft({ groupCode: event.target.value })} maxLength={64} placeholder="Ex.: GSA-SP-2026" className="input-auth" /></label>}
                  <AvatarDropzone avatar={avatar} avatarPreview={avatarPreview} dragActive={dragActive} setDragActive={setDragActive} fileInputRef={fileInputRef} chooseAvatar={chooseAvatar} clearAvatar={() => setAvatar(null)} />
                  <p className="rounded-xl border border-[#FBBC04]/40 bg-[#FFF8E7] px-3 py-2 text-xs font-medium text-slate-700">O rascunho deste formulário é salvo automaticamente. Por segurança, a imagem precisa ser escolhida novamente após recarregar.</p>
                </>}

                {!isLogin && draft.step === 3 && <>
                  <div className="rounded-xl bg-[#EBF3FE] p-4 text-sm"><strong>{draft.name}</strong>{draft.nickname && ` · ${draft.nickname}`}<br /><span className="text-slate-600">{draft.userType === 'ambassador' ? 'Embaixador estudantil' : 'Estudante'} · {draft.selectedUniversity?.name ?? draft.universityQuery.toLowerCase()}</span></div>
                  <label className="block"><span className="mb-2 block text-sm font-black">E-mail</span><span className="relative block"><Mail size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} type="email" autoComplete="email" placeholder="voce@universidade.edu.br" className="input-auth input-auth-leading-icon" /></span></label>
                  <PasswordField password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} />
                  <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 font-medium"><input required checked={draft.agreed} onChange={(event) => updateDraft({ agreed: event.target.checked })} type="checkbox" className="mt-0.5 accent-[#4285F4]" />Li e aceito os <a href="/terms" target="_blank" rel="noreferrer" className="font-black text-[#4285F4] hover:underline">Termos de Uso</a> e a <a href="/privacy" target="_blank" rel="noreferrer" className="font-black text-[#4285F4] hover:underline">Política de Privacidade</a>.</label>
                  <label className="block"><span className="mb-2 block text-sm font-black">Deseja receber comunicações por e-mail?</span><select required value={draft.emailUpdates} onChange={(event) => updateDraft({ emailUpdates: event.target.value as RegistrationDraft['emailUpdates'] })} className="input-auth"><option value="">Selecione uma opção</option><option value="yes">Sim, quero receber atualizações de eventos, fóruns e novidades</option><option value="no">Não, apenas e-mails essenciais de confirmação e segurança</option></select><span className="mt-2 block text-xs font-medium leading-relaxed text-slate-500">Você poderá cancelar tipos específicos de atualização pelos links enviados em cada e-mail.</span></label>
                  <p className="text-xs text-slate-500">A senha não é salva no rascunho por segurança.</p>
                </>}

                <div className="flex gap-3 pt-1">
                  {!isLogin && draft.step > 1 && <button type="button" onClick={() => updateDraft({ step: draft.step - 1 })} className="button-secondary"><ChevronLeft size={18} />Voltar</button>}
                  <button disabled={isSubmitting} type="submit" className="button-primary flex-1">{isSubmitting ? 'Aguarde…' : isLogin ? 'Entrar no Hub' : draft.step === 3 ? 'Criar minha conta' : 'Avançar'} <ArrowRight size={18} /></button>
                </div>
              </form>
              {status && <div role="status" className="mt-5 rounded-xl bg-[#EBF3FE] px-4 py-3 text-xs font-bold border border-[#4285F4]/30"><p>{status}</p>{isLogin && draft.email && <button type="button" disabled={isSubmitting} onClick={resendVerification} className="mt-2 font-black text-[#4285F4] hover:underline">Reenviar confirmação por e-mail</button>}</div>}
              <p className="mt-6 text-center text-sm font-medium text-slate-600">{isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'} <a href={isLogin ? '/register' : '/login'} className="font-black text-[#4285F4] hover:underline">{isLogin ? 'Cadastre-se' : 'Entrar'}</a></p>
            </div>
          </div>
        </section>
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">Projeto acadêmico independente, sem vínculo oficial com a Google LLC.</p>
      </div>
    </main>
  );
};

const PasswordField = ({ password, setPassword, showPassword, setShowPassword, login = false }: { password: string; setPassword: (value: string) => void; showPassword: boolean; setShowPassword: (value: boolean | ((current: boolean) => boolean)) => void; login?: boolean }) => <label className="block"><span className="mb-2 flex justify-between text-sm font-black">Senha{login && <a href="/forgot-password" className="text-xs text-[#4285F4] hover:underline">Esqueci minha senha</a>}</span><span className="relative block"><LockKeyhole size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} type={showPassword ? 'text' : 'password'} autoComplete={login ? 'current-password' : 'new-password'} placeholder="Mínimo de 8 caracteres" className="input-auth input-auth-leading-and-trailing-icon" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-1.5 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>;

const AccountTypeCard = ({ selected, onClick, type }: { selected: boolean; onClick: () => void; type: AccountType }) => { const ambassador = type === 'ambassador'; return <button type="button" onClick={onClick} className={`rounded-xl border-2 p-4 text-left ${selected ? ambassador ? 'border-[#4285F4] bg-[#EBF3FE]' : 'border-[#34A853] bg-[#EFFBF3]' : 'border-slate-200 hover:border-[#4285F4]/50'}`}>{ambassador ? <UsersRound size={21} className="mb-2 text-[#4285F4]" /> : <UserRound size={21} className="mb-2 text-[#34A853]" />}<strong className="block text-sm">{ambassador ? 'Sim, sou embaixador' : 'Sou estudante'}</strong><span className="text-xs text-slate-600">{ambassador ? 'Posso criar universidade e entrar em grupos.' : 'Posso descobrir eventos e a comunidade.'}</span></button>; };

const UniversityPicker = ({ draft, universities, onInput, onSelect, onCreate, onClear }: { draft: RegistrationDraft; universities: University[]; onInput: (value: string) => void; onSelect: (university: University) => void; onCreate: () => void; onClear: () => void }) => <div className="relative"><span className="mb-2 block text-sm font-black">Universidade</span><span className="relative block"><Search size={18} className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={draft.universityQuery} onChange={(event) => onInput(event.target.value)} placeholder="Busque sua universidade" className="input-auth input-auth-leading-icon" /></span>{draft.selectedUniversity && <div className="mt-2 flex items-center justify-between rounded-lg bg-[#EFFBF3] px-3 py-2 text-sm font-bold"><span>{draft.selectedUniversity.name}</span><button type="button" onClick={onClear} aria-label="Remover universidade"><X size={16} /></button></div>}{universities.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border-2 border-[#1e293b] bg-white p-1 shadow-lg">{universities.map((university) => <button type="button" key={university.id} onClick={() => onSelect(university)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-[#EBF3FE]">{university.name}</button>)}</div>}{draft.userType === 'ambassador' && !draft.selectedUniversity && !draft.creatingUniversity && draft.universityQuery.trim().length >= 3 && <button type="button" onClick={onCreate} className="mt-2 inline-flex items-center gap-2 text-sm font-black text-[#4285F4] hover:underline"><Building2 size={17} />Não encontrou? Criar “{draft.universityQuery.trim().toLowerCase()}”</button>}{draft.userType === 'student' && !draft.selectedUniversity && draft.universityQuery.trim().length >= 3 && <p className="mt-2 text-xs font-medium text-slate-500">Não encontrou? Peça a um embaixador para cadastrar a universidade.</p>}{draft.creatingUniversity && <p className="mt-2 rounded-lg bg-[#EBF3FE] p-3 text-xs font-bold">A universidade será criada em minúsculas e reutilizada caso já exista no banco.</p>}</div>;

const AvatarDropzone = ({ avatar, avatarPreview, dragActive, setDragActive, fileInputRef, chooseAvatar, clearAvatar }: { avatar: File | null; avatarPreview: string; dragActive: boolean; setDragActive: (value: boolean) => void; fileInputRef: React.RefObject<HTMLInputElement | null>; chooseAvatar: (file?: File) => void; clearAvatar: () => void }) => <div><span className="mb-2 block text-sm font-black">Imagem de perfil <em className="font-medium text-slate-500">(opcional)</em></span><div onDragEnter={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDragLeave={() => setDragActive(false)} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragActive(false); chooseAvatar(event.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()} className={`cursor-pointer rounded-xl border-2 border-dashed p-4 ${dragActive ? 'border-[#4285F4] bg-[#EBF3FE]' : 'border-slate-300 hover:border-[#4285F4]'}`}><input ref={fileInputRef} onChange={(event: ChangeEvent<HTMLInputElement>) => chooseAvatar(event.target.files?.[0])} accept="image/png,image/jpeg,image/webp" type="file" className="hidden" />{avatarPreview ? <div className="flex items-center gap-3"><img src={avatarPreview} alt="Prévia da imagem de perfil" className="w-12 h-12 rounded-full object-cover border-2 border-[#1e293b]" /><span className="text-sm font-bold truncate">{avatar?.name}</span><button type="button" onClick={(event) => { event.stopPropagation(); clearAvatar(); }} className="ml-auto p-1"><X size={18} /></button></div> : <div className="flex items-center gap-3 text-sm"><ImagePlus size={24} className="text-[#4285F4]" /><span><strong>Arraste uma imagem</strong> ou clique para enviar<br /><small className="text-slate-500">PNG, JPEG ou WebP · até 4 MB</small></span></div>}</div></div>;

export default AuthPage;
