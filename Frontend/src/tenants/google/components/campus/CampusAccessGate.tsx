import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useCampus } from "../../../../contexts/CampusContext";
import { ShieldAlert, Mail, Lock, LogIn, UserPlus, CheckCircle2, ArrowRight, Building2, ShieldCheck } from "lucide-react";

export default function CampusAccessGate({
  featureTitle = "Espaço Acadêmico Privado",
  featureDescription = "Este ambiente e seus materiais são restritos exclusivamente aos estudantes e embaixadores desta universidade com e-mail institucional confirmado.",
}: {
  featureTitle?: string;
  featureDescription?: string;
}) {
  const { user } = useAuth();
  const { campus, membership, joinCampus } = useCampus();
  const [isJoining, setIsJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = React.useState<string | null>(null);

  if (!campus) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    setJoinError(null);
    setJoinSuccess(null);
    const res = await joinCampus();
    if (res.success) {
      setJoinSuccess(res.message);
    } else {
      setJoinError(res.message);
    }
    setIsJoining(false);
  };

  // State 1: Not logged in
  if (!user) {
    return (
      <div className="my-6 p-6 sm:p-10 rounded-3xl bg-white border-3 border-[#1e293b] text-center max-w-xl mx-auto shadow-hard-black animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4] mx-auto flex items-center justify-center mb-4 shadow-2xs">
          <Lock className="w-7 h-7" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-2xs font-mono font-black uppercase bg-[#FBBC04] text-[#1e293b] border-2 border-[#1e293b] mb-3 shadow-2xs -rotate-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Acesso Restrito · {campus.slug.toUpperCase()}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] mb-2">{featureTitle}</h3>
        <p className="text-[#475569] font-medium text-xs sm:text-sm mb-6 leading-relaxed max-w-md mx-auto">
          {featureDescription}
        </p>

        {campus.emailDomains && campus.emailDomains.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 mb-6 text-left">
            <div className="text-xs font-black text-[#1e293b] mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#4285F4]" />
              <span>Domínios de e-mail autorizados:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campus.emailDomains.map((dom) => (
                <span key={dom} className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#1e293b] text-[#4285F4] text-xs font-mono font-bold shadow-2xs">
                  @{dom}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar com E-mail Institucional</span>
          </a>
          <a
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1e293b] text-[#1e293b] font-black text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Conta</span>
          </a>
        </div>
      </div>
    );
  }

  // State 2: Logged in, but email domain doesn't match this university
  const isEmailDomainMatch = campus.emailDomains.some((d) => 
    user.email.toLowerCase().endsWith(`@${d.toLowerCase()}`) || 
    user.email.toLowerCase().endsWith(`.${d.toLowerCase()}`)
  );

  if (!isEmailDomainMatch) {
    return (
      <div className="my-6 p-6 sm:p-10 rounded-3xl bg-white border-3 border-[#1e293b] text-center max-w-xl mx-auto shadow-hard-black animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] mx-auto flex items-center justify-center mb-4 shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-2xs font-mono font-black uppercase bg-[#FBBC04] text-[#1e293b] border-2 border-[#1e293b] mb-3 shadow-2xs -rotate-1">
          <span>Domínio Institucional Não Vinculado</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] mb-2">Comunidade Exclusiva da {campus.name}</h3>
        <p className="text-[#475569] font-medium text-xs sm:text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Você está conectado com o e-mail <strong className="text-[#1e293b] font-mono">{user.email}</strong>, que não corresponde aos domínios autorizados para este campus.
        </p>

        {campus.emailDomains && campus.emailDomains.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 mb-6 text-left">
            <div className="text-xs font-black text-[#1e293b] mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Domínios aceitos neste campus:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campus.emailDomains.map((dom) => (
                <span key={dom} className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#1e293b] text-[#B45309] text-xs font-mono font-bold shadow-2xs">
                  @{dom}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/campuses"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1e293b] text-[#1e293b] font-black text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Buscar Minha Universidade</span>
          </a>
          <a
            href="/students"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver Cursos Globais</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // State 3: Email domain matches, but user hasn't clicked to activate membership yet
  return (
    <div className="my-6 p-6 sm:p-10 rounded-3xl bg-white border-3 border-[#1e293b] text-center max-w-xl mx-auto shadow-hard-black animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853] mx-auto flex items-center justify-center mb-4 shadow-2xs">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-2xs font-mono font-black uppercase bg-[#34A853] text-white border-2 border-[#1e293b] mb-3 shadow-2xs -rotate-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>E-mail Institucional Reconhecido</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] mb-2">Ingressar no Campus {campus.name}</h3>
      <p className="text-[#475569] font-medium text-xs sm:text-sm mb-6 leading-relaxed max-w-md mx-auto">
        Seu e-mail <strong className="text-[#137333] font-mono">{user.email}</strong> pertence a esta instituição. Clique abaixo para liberar seu acesso como estudante do campus.
      </p>

      {joinError && (
        <div className="p-3.5 mb-4 rounded-xl bg-[#FCE8E6] border-2 border-[#EA4335] text-[#C5221F] text-xs font-bold">
          {joinError}
        </div>
      )}

      {joinSuccess && (
        <div className="p-3.5 mb-4 rounded-xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#137333] text-xs font-bold">
          {joinSuccess}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={isJoining}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#34A853] hover:bg-[#2D9249] disabled:opacity-50 text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        {isJoining ? "Ativando acesso..." : `Ingressar no Hub ${campus.slug.toUpperCase()}`}
      </button>
    </div>
  );
}
