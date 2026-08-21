import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import { Sparkles, Terminal, Code2, Users, ArrowRight, Award } from "lucide-react";

export default function ProgramsPage() {
  const programs = [
    {
      title: "Programa Embaixadores Estudantis",
      description: "Liderança de comunidades universitárias para organização de workshops técnicos, eventos acadêmicos e Study Jams.",
      icon: Award,
      badge: "Liderança",
      iconBg: "bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309]",
      url: getCrossSubdomainUrl("CONNECT", "/ambassadors"),
      cta: "Conhecer Embaixadores",
    },
    {
      title: "Study Jams de Inteligência Artificial",
      description: "Workshops hands-on sobre LLMs, arquitetura Transformer e engenharia de prompts calibrados para pesquisas acadêmicas.",
      icon: Sparkles,
      badge: "Formação Técnica",
      iconBg: "bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4]",
      url: "/students",
      cta: "Acessar Aulas & Prompts",
    },
    {
      title: "Grupos de Estudo & Desenvolvimento Web",
      description: "Encontros práticos sobre TypeScript, APIs modernas, banco de dados e arquitetura de software escalável.",
      icon: Terminal,
      badge: "Engenharia",
      iconBg: "bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853]",
      url: getCrossSubdomainUrl("EVENTS", "/"),
      cta: "Ver Próximos Workshops",
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1">
            <span>INICIATIVAS ESTUDANTIS</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight">
            Programas &amp; Trilhas Acadêmicas
          </h1>
          <p className="text-[#475569] font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Conheça as principais frentes de capacitação, liderança e tecnologia ativas na comunidade universitária.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const Icon = prog.icon;
            return (
              <div key={prog.title} className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${prog.iconBg} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-2xs font-mono font-black uppercase bg-slate-100 border border-slate-300 text-[#1e293b]">
                      {prog.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#1e293b] mb-2">{prog.title}</h3>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">{prog.description}</p>
                </div>

                <a
                  href={prog.url}
                  className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center gap-1 text-xs font-black text-[#4285F4] hover:underline"
                >
                  {prog.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
