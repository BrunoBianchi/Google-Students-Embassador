import React from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import {
  Building2,
  Mail,
  ShieldCheck,
  Users,
  MapPin,
  HelpCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";

export default function CampusAbout() {
  const { campus, ambassadors } = useCampus();

  if (!campus) return null;

  const faqs = [
    {
      q: `Como estudantes da ${campus.name} têm acesso aos conteúdos exclusivos?`,
      a: `Basta registrar sua conta utilizando o e-mail institucional oficial (${campus.emailDomains.map((d) => `@${d}`).join(", ")}) e confirmar o link enviado. A liberação do espaço do campus é imediata após a confirmação.`,
    },
    {
      q: "O que são os Embaixadores Estudantis do Campus?",
      a: "São universitários participantes do Programa Embaixadores Estudantis que organizam Study Jams, workshops e conectam os alunos a oportunidades de tecnologia e IA.",
    },
    {
      q: "A plataforma é operada oficialmente pela universidade ou pelo Google?",
      a: "Não. Trata-se de uma iniciativa acadêmica independente mantida por participantes da comunidade estudantil para facilitar eventos e compartilhamento de conhecimento.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
          Informações Institucionais
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Sobre o Campus {campus.slug.toUpperCase()}</h2>
        <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1 max-w-2xl leading-relaxed">
          Conheça a liderança local, regras de validação institucional e iniciativas ativas da comunidade.
        </p>
      </div>

      {/* University Card in Light Theme */}
      <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-2xs font-mono font-black uppercase bg-[#E8F0FE] text-[#1D4ED8] border border-[#4285F4]">
                {campus.slug}
              </span>
              {campus.city && campus.state && (
                <span className="text-xs text-[#64748b] font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
                  {campus.city}, {campus.state} · Brasil
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-[#1e293b]">{campus.name}</h3>
            <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-3xl leading-relaxed">
              {campus.description || "Comunidade universitária ativa para projetos acadêmicos e workshops práticos de tecnologia."}
            </p>
          </div>

          <div className="shrink-0 p-5 rounded-2xl bg-slate-50 border-2 border-[#1e293b] space-y-3 min-w-[240px] shadow-2xs">
            <div className="text-2xs font-black uppercase tracking-wider text-[#1e293b]">
              E-mails Institucionais Permitidos
            </div>
            <div className="space-y-1.5">
              {campus.emailDomains.map((dom) => (
                <div key={dom} className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-300 text-[#4285F4] text-xs font-mono font-bold flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                  @{dom}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ambassadors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
            Liderança e Embaixadores do Campus ({ambassadors.length})
          </h3>
          <a
            href={getCrossSubdomainUrl("CONNECT", `/ambassadors?campus=${campus.slug}`)}
            className="text-xs font-black text-[#4285F4] hover:underline flex items-center gap-1"
          >
            Ver no Connect
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {ambassadors.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] text-center text-[#475569] font-bold text-sm shadow-hard-black">
            Nenhum embaixador com perfil público listado no momento para este campus.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ambassadors.map((ambassador) => (
              <a
                key={ambassador.id}
                href={getCrossSubdomainUrl("CONNECT", `/ambassadors/${ambassador.nickname || ambassador.id}`)}
                className="p-5 rounded-3xl bg-white border-3 border-[#1e293b] hover:shadow-hard-hover transition-all flex flex-col justify-between group shadow-hard-black"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#1e293b] flex items-center justify-center text-[#1e293b] text-base font-black shrink-0 overflow-hidden shadow-2xs">
                      {ambassador.avatarPath ? (
                        <img src={ambassador.avatarPath} alt={ambassador.name} className="w-full h-full object-cover" />
                      ) : (
                        ambassador.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-[#1e293b] group-hover:text-[#4285F4] transition-colors truncate">
                        {ambassador.name}
                      </h4>
                      <div className="text-2xs text-[#B45309] font-black flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                        Embaixador Estudantil
                      </div>
                      {ambassador.city && (
                        <div className="text-2xs text-[#64748b] font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#EA4335]" />
                          {ambassador.city}
                        </div>
                      )}
                    </div>
                  </div>

                  {ambassador.bio && (
                    <p className="text-xs text-[#475569] font-medium line-clamp-3 leading-relaxed">
                      {ambassador.bio}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-2xs text-[#4285F4] font-black">
                  <span>Ver perfil completo</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
          Perguntas Frequentes (FAQ)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4] flex items-center justify-center mb-3 shadow-2xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#1e293b]">{faq.q}</h4>
              <p className="text-xs text-[#475569] font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
