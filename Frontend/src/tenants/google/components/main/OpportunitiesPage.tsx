import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import { Briefcase, Sparkles, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OpportunitiesPage() {
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
            <span>CARREIRA &amp; CRESCIMENTO</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight">
            Oportunidades Universitárias
          </h1>
          <p className="text-[#475569] font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Desenvolva projetos reais, conecte-se com mentores e ganhe destaque na comunidade acadêmica e de tecnologia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4] flex items-center justify-center shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1e293b]">Liderança de Comunidade</h3>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              Atue como ponto focal de tecnologia na sua universidade. Organize encontros, lidere projetos open source e amplie sua rede profissional.
            </p>
            <ul className="space-y-2 text-xs text-[#1e293b] font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                Destaque no diretório público de embaixadores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                Acesso antecipado a trilhas e materiais práticos
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] flex items-center justify-center shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1e293b]">Certificação &amp; Study Jams</h3>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              Participe de oficinas com foco em Inteligência Artificial Generativa, computação em nuvem e engenharia de software moderna.
            </p>
            <ul className="space-y-2 text-xs text-[#1e293b] font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                Exercícios práticos com Google Gemini e LLMs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                Compartilhamento de artigos e projetos universitários
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
