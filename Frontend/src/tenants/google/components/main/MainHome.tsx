import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  Building2,
  Calendar,
  UsersRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Award,
  Zap,
  BookOpen,
  Briefcase,
  Layers,
  GraduationCap,
} from "lucide-react";

export default function MainHome() {
  const pillars = [
    {
      title: "Campuses Universitários",
      subtitle: "campus.studentembassador.com/campuses",
      description:
        "Espaços dedicados a cada universidade participante com agendas locais, oficinas práticas e liderança estudantil.",
      href: getCrossSubdomainUrl("CAMPUS", "/"),
      cta: "Explorar Campuses",
      badge: "Universidades",
      icon: Building2,
      iconBg: "bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309]",
    },
    {
      title: "Eventos Globais",
      subtitle: "campus.studentembassador.com/events",
      description:
        "Agenda unificada de palestras, workshops de tecnologia, hackathons e summits abertos a universitários de todo o país.",
      href: getCrossSubdomainUrl("EVENTS", "/"),
      cta: "Ver Calendário de Eventos",
      badge: "Iniciativas Globais",
      icon: Calendar,
      iconBg: "bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4]",
    },
    {
      title: "Connect & Comunidade",
      subtitle: "campus.studentembassador.com/ambassadors",
      description:
        "Diretório de Ambassadors por região e universidade, comunicados oficiais, grupos de estudo e conexões profissionais.",
      href: getCrossSubdomainUrl("CONNECT", "/"),
      cta: "Conectar com Ambassadors",
      badge: "Rede Estudantil",
      icon: UsersRound,
      iconBg: "bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] font-sans selection:bg-[#FBBC04] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1">
            <Globe className="w-4 h-4" />
            <span>ECOSSISTEMA UNIVERSITÁRIO INDEPENDENTE</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.15]">
            O Hub Central para Estudantes &amp; Embaixadores de Tecnologia
          </h1>

          <p className="text-[#475569] font-medium text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Conectamos universitários a lideranças estudantis, Study Jams de inteligência artificial e agendas de eventos em universidades de todo o Brasil.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href={getCrossSubdomainUrl("CAMPUS", "/")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Explorar Campuses
            </a>
            <a
              href={getCrossSubdomainUrl("EVENTS", "/")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#1e293b] text-[#1e293b] font-black text-xs shadow-hard-black transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#EA4335]" />
              Eventos Globais
            </a>
            <a
              href={getCrossSubdomainUrl("CONNECT", "/")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#1e293b] text-[#1e293b] font-black text-xs shadow-hard-black transition-all flex items-center justify-center gap-2"
            >
              <UsersRound className="w-4 h-4 text-[#34A853]" />
              Rede Connect
            </a>
          </div>
        </div>
      </section>

      {/* 3 Core Context Pillars */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
            Arquitetura por Contexto
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Ambientes Dedicados do Ecossistema</h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium">
            Cada pilar da plataforma possui sua própria área de foco especializada, integrada sob a mesma conta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <a
                key={pillar.title}
                href={pillar.href}
                className="group p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-2xs font-mono font-black uppercase bg-slate-100 border border-slate-300 text-[#1e293b]">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#1e293b] group-hover:text-[#4285F4] transition-colors">
                      {pillar.title}
                    </h3>
                    <div className="text-2xs font-mono font-bold text-slate-500 mt-0.5">{pillar.subtitle}</div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs font-black text-[#4285F4] group-hover:translate-x-1 transition-transform">
                  <span>{pillar.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* AI Academy & Gemini Guide Spotlight */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto rounded-3xl bg-white border-3 border-[#FBBC04] shadow-hard-black p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] text-xs font-mono font-black uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Academia Gratuita para Universitários
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
              Guia Completo: Inteligência Artificial &amp; Google Gemini
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              Módulos didáticos sobre como Transformers, mecanismos de auto-atenção e embeddings funcionam, comparador interativo de prompts acadêmicos e técnicas rigorosas anti-alucinação.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/students"
              className="px-8 py-4 rounded-2xl bg-[#FBBC04] hover:bg-[#F59E0B] text-[#1e293b] font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Acessar Guia de IA do Estudante
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
