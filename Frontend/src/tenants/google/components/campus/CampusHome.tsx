import React from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import { useAuth } from "../../../../contexts/AuthContext";
import CampusAccessGate from "./CampusAccessGate";
import {
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  ShieldCheck,
  Building2,
  Users,
  MailCheck,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export default function CampusHome() {
  const { campus, membership, ambassadors } = useCampus();
  const { user } = useAuth();

  if (!campus) return null;

  const isMember = membership?.isMember ?? false;

  // Strict Privacy: If non-member, ONLY display the clean access gate!
  if (!isMember) {
    return (
      <div className="py-4">
        <CampusAccessGate
          featureTitle={`Comunidade Exclusiva ${campus.name}`}
          featureDescription="Acesse a agenda de eventos locais, participe de Study Jams práticos de IA e conecte-se com os estudantes da sua universidade."
        />
      </div>
    );
  }

  const basePath = `/${campus.slug}`;

  // Member View: Clean, minimalist welcome dashboard
  return (
    <div className="space-y-6 animate-fadeIn py-2">
      
      {/* Student Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-2xs font-mono font-black uppercase bg-[#E6F4EA] text-[#137333] border-2 border-[#34A853] shadow-2xs">
            <CheckCircle2 size={13} />
            <span>Membro Ativo do Campus</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1e293b]">
            Olá, {user?.nickname || user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed max-w-xl">
            Você está conectado ao espaço oficial da <strong>{campus.name}</strong>. Utilize as abas acima para explorar eventos, workshops e materiais de IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${basePath}/events`}
            className="px-4 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center gap-1.5 shrink-0"
          >
            <Calendar size={14} />
            <span>Ver Eventos</span>
          </a>
          <a
            href={`${basePath}/workshops`}
            className="px-4 py-2.5 rounded-xl bg-[#FBBC04] hover:bg-[#F59E0B] text-[#1e293b] font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center gap-1.5 shrink-0"
          >
            <Layers size={14} />
            <span>Workshops</span>
          </a>
        </div>
      </div>

      {/* Campus Info & Guidelines */}
      <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-100">
          <Building2 className="w-4 h-4 text-[#4285F4]" />
          <h3 className="text-sm font-black text-[#1e293b]">Diretrizes e Segurança do Campus</h3>
        </div>
        <p className="text-xs text-[#475569] font-medium leading-relaxed">
          Todos os conteúdos compartilhados neste espaço são mantidos por embaixadores e membros verificados da universidade.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {campus.emailDomains && campus.emailDomains.length > 0 && (
            <span className="px-3 py-1 rounded-xl bg-slate-50 border-2 border-slate-200 text-2xs font-mono font-bold text-slate-600 flex items-center gap-1">
              <MailCheck className="w-3.5 h-3.5 text-[#34A853]" />
              Domínio: {campus.emailDomains.join(", ")}
            </span>
          )}
          <span className="px-3 py-1 rounded-xl bg-slate-50 border-2 border-slate-200 text-2xs font-bold text-slate-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
            Ambiente LGPD Seguro
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-50 border-2 border-slate-200 text-2xs font-bold text-slate-600 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#4285F4]" />
            {campus.totalMembers ?? 0} Membros
          </span>
        </div>
      </div>

    </div>
  );
}
