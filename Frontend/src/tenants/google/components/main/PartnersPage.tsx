import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import { ShieldCheck, Building2, Globe, ArrowRight } from "lucide-react";

export default function PartnersPage() {
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
            <span>ECOSSISTEMA INSTITUCIONAL</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight">
            Comunidades &amp; Instituições
          </h1>
          <p className="text-[#475569] font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A plataforma apoia espaços acadêmicos independentes mantidos por estudantes em dezenas de universidades no Brasil.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-[#1e293b]">Diretrizes de Independência Institucional</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
            O cadastramento de uma universidade ou menção a programas de embaixadores de empresas de tecnologia (como Google LLC) destina-se estritamente à organização de eventos pelos próprios estudantes participantes. Isso não representa vínculo societário, propriedade de marca ou endosso oficial por parte das instituições citadas.
          </p>
        </div>

        <div className="text-center pt-4">
          <a
            href={getCrossSubdomainUrl("CAMPUS", "/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all"
          >
            <Building2 className="w-4 h-4" />
            Ver Universidades Participantes no Diretório de Campuses
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
