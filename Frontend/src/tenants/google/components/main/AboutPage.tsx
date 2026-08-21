import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import { ShieldCheck, Users, Globe, Building2, BookOpen, ArrowRight } from "lucide-react";

export default function AboutPage() {
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1">
            <span>SOBRE O ECOSSISTEMA</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight">
            Plataforma Student Ambassador
          </h1>
          <p className="text-[#475569] font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Uma iniciativa acadêmica independente desenvolvida para apoiar embaixadores universitários e estudantes em todo o Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4] flex items-center justify-center shadow-2xs">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Ecossistema Aberto</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Integração de comunidades universitárias através de subdomínios dedicados para cada contexto: Campuses, Eventos e Connect.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] flex items-center justify-center shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Espaços por Campus</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Cada universidade participante possui seu ambiente isolado, permitindo workshops locais e compartilhamento seguro de materiais.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Independência Institucional</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Mantida de forma autônoma por estudantes para fins exclusivamente didáticos, sem vinculação societária ou comercial com terceiros.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
          <h2 className="text-xl font-black text-[#1e293b]">Navegue pelos Hubs da Plataforma</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <a
              href={getCrossSubdomainUrl("CAMPUS", "/")}
              className="p-4 rounded-2xl bg-slate-50 border-2 border-[#1e293b] hover:bg-white hover:shadow-[3px_3px_0px_#1e293b] transition-all flex items-center justify-between group"
            >
              <span className="font-black text-[#1e293b] group-hover:text-[#4285F4]">Diretório de Campuses</span>
              <ArrowRight className="w-4 h-4 text-[#4285F4]" />
            </a>
            <a
              href={getCrossSubdomainUrl("EVENTS", "/")}
              className="p-4 rounded-2xl bg-slate-50 border-2 border-[#1e293b] hover:bg-white hover:shadow-[3px_3px_0px_#1e293b] transition-all flex items-center justify-between group"
            >
              <span className="font-black text-[#1e293b] group-hover:text-[#EA4335]">Eventos Globais</span>
              <ArrowRight className="w-4 h-4 text-[#EA4335]" />
            </a>
            <a
              href={getCrossSubdomainUrl("CONNECT", "/ambassadors")}
              className="p-4 rounded-2xl bg-slate-50 border-2 border-[#1e293b] hover:bg-white hover:shadow-[3px_3px_0px_#1e293b] transition-all flex items-center justify-between group"
            >
              <span className="font-black text-[#1e293b] group-hover:text-[#34A853]">Ambassadors &amp; Regiões</span>
              <ArrowRight className="w-4 h-4 text-[#34A853]" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
