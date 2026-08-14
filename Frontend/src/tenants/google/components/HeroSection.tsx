import React from 'react';
import { ArrowRight, Users, MapPin, Calendar, MessageSquare, Zap, GraduationCap } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 px-4 overflow-hidden bg-[#FAFAFE]">
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Floating 3D PNG Images from /public */}
      <div className="absolute top-28 left-[3%] sm:left-[6%] lg:left-[8%] float-slow z-20 hidden md:block">
        <div className="relative group cursor-pointer">
          <img src="/smiley.png" alt="Smiley" className="w-20 lg:w-28 h-auto object-contain filter drop-shadow-[0_10px_20px_rgba(66,133,244,0.25)] group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-2 -right-2 bg-[#FBBC04] text-[#1e293b] font-black text-[11px] px-2 py-0.5 rounded-md border-2 border-[#1e293b] -rotate-6 shadow-sm">
            HEY GSA!
          </span>
        </div>
      </div>

      <div className="absolute top-24 right-[3%] sm:right-[6%] lg:right-[8%] float-medium z-20 hidden md:block">
        <div className="relative group cursor-pointer">
          <img src="/sparkle.png" alt="Sparkle" className="w-24 lg:w-36 h-auto object-contain filter drop-shadow-[0_10px_20px_rgba(251,188,4,0.3)] group-hover:rotate-12 transition-transform" />
          <span className="absolute -bottom-2 -left-2 bg-[#4285F4] text-white font-black text-[11px] px-2 py-0.5 rounded-md border-2 border-[#1e293b] rotate-3 shadow-sm">
            CONECTE-SE
          </span>
        </div>
      </div>

      <div className="absolute bottom-32 left-[4%] float-fast z-20 hidden lg:block">
        <img src="/heart.png" alt="Heart" className="w-16 lg:w-20 h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(234,67,53,0.25)] hover:scale-110 transition-transform cursor-pointer" />
      </div>

      <div className="absolute bottom-36 right-[5%] float-slow z-20 hidden lg:block">
        <img src="/chat.png" alt="Chat" className="w-20 lg:w-24 h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(66,133,244,0.25)] hover:scale-110 transition-transform cursor-pointer" />
      </div>

      {/* Hero Central Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        
        {/* Top Slanted Sticker Tag with sparkle.png */}
        <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1 mb-8 hover:rotate-1 transition-transform">
          <img src="/sparkle.png" alt="Sparkle" className="w-5 h-5 object-contain" />
          <span>PLATAFORMA DA COMUNIDADE DOS EMBAIXADORES GOOGLE</span>
          <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
            2026 BR
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-black tracking-tight text-[#1e293b] leading-[1.1] mb-6">
          Todos os Embaixadores.<br />
          <span className="relative inline-block mt-2">
            <span className="bg-[#4285F4] text-white px-4 py-1 rounded-2xl border-3 border-[#1e293b] shadow-hard-black -rotate-2 inline-block">
              Uma só Plataforma.
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-xl text-[#475569] font-medium max-w-2xl mx-auto leading-relaxed">
          Chega de embaixadores isolados! Conecte-se com quem estuda no seu campus ou região, 
          organize fóruns, compartilhe eventos e potencialize o impacto da comunidade Google no seu campus.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#recursos"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#3367d6] text-white font-extrabold text-base px-8 py-4 rounded-2xl border-3 border-[#1e293b] shadow-hard-black shadow-hard-hover transition-all"
          >
            <span>Explorar Recursos da Comunidade</span>
            <ArrowRight size={20} />
          </a>

          <a 
            href="#sobre"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#1e293b] font-bold text-base px-6 py-4 rounded-2xl border-3 border-[#1e293b] shadow-hard-black shadow-hard-hover transition-all"
          >
            <Zap size={18} className="text-[#EA4335]" />
            <span>Por que esta plataforma foi criada?</span>
          </a>
        </div>

        {/* Quick Stats Pill Row */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-3">
          <div className="bg-[#EBF3FE] text-[#4285F4] font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-sm flex items-center gap-1.5">
            <Users size={14} /> 500+ Embaixadores Ativos
          </div>
          <div className="bg-[#FEF0EF] text-[#EA4335] font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-sm flex items-center gap-1.5">
            <GraduationCap size={14} /> 120+ Universidades & Campus
          </div>
          <div className="bg-[#FFF8E7] text-[#D97706] font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-sm flex items-center gap-1.5">
            <Calendar size={14} /> 250+ Eventos Registrados
          </div>
          <div className="bg-[#EFFBF3] text-[#34A853] font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-sm flex items-center gap-1.5">
            <MessageSquare size={14} /> Fórum & Grupos Regionais
          </div>
        </div>

        {/* Live Mock Showcase Window Frame */}
        <div className="mt-14 relative max-w-4xl mx-auto">
          
          {/* Sticker badge floating on container */}
          <div className="absolute -top-5 left-6 z-20 bg-[#EA4335] text-white font-black text-xs px-3.5 py-1 rounded-lg border-2 border-[#1e293b] -rotate-3 shadow-sm flex items-center gap-1.5">
            <img src="/sparkle.png" alt="Sparkle" className="w-4 h-4 object-contain" />
            <span>HUB EM TEMPO REAL</span>
          </div>

          <div className="bg-white border-3 border-[#1e293b] rounded-3xl p-4 sm:p-6 shadow-hard-black text-left">
            
            {/* Top Bar of the Mock Window */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EA4335]" />
                <span className="w-3 h-3 rounded-full bg-[#FBBC04]" />
                <span className="w-3 h-3 rounded-full bg-[#34A853]" />
                <span className="text-xs font-bold text-gray-400 ml-2">gsa.studentsembassador.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4285F4] bg-[#EBF3FE] px-2.5 py-1 rounded-full border border-[#4285F4]/20">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                Rede de Embaixadores Online
              </div>
            </div>

            {/* Mock Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Student Ambassador Profile Mock */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border-2 border-[#1e293b] hover:border-[#4285F4] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white font-black flex items-center justify-center border-2 border-[#1e293b]">
                    JS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1e293b]">João Silva</h4>
                    <span className="text-[11px] font-bold text-[#4285F4] bg-[#EBF3FE] px-2 py-0.5 rounded-md">USP · Ciência da Computação</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  "Organizando o próximo Workshop de Gemini no Campus Butantã! Procurando co-organizadores."
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-500 pt-2 border-t border-gray-200">
                  <span className="flex items-center gap-1 text-[#34A853]"><MapPin size={12} strokeWidth={3} /> São Paulo, SP</span>
                  <span className="text-[#EA4335]">2 Grupos Ativos</span>
                </div>
              </div>

              {/* Card 2: Campus Event Mock */}
              <div className="bg-[#FFF8E7] p-4 rounded-2xl border-2 border-[#1e293b] hover:border-[#F9AB00] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#F9AB00] text-[#1e293b] font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                    Evento no Campus
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">18 de Março</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#1e293b] mb-1">Talk: IA Generativa na Prática</h4>
                <p className="text-xs text-gray-600">
                  Auditório Principal - Unicamp. Aberto a todos os estudantes de graduação!
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold pt-2 border-t border-amber-200">
                  <span className="text-[#1e293b]">📍 UNICAMP</span>
                  <span className="bg-white text-[#4285F4] px-2 py-0.5 rounded border border-[#1e293b]">42 Inscritos</span>
                </div>
              </div>

              {/* Card 3: Regional Group Forum Mock */}
              <div className="bg-[#EFFBF3] p-4 rounded-2xl border-2 border-[#1e293b] hover:border-[#34A853] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#34A853] text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                    Fórum Ativo
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">12 respostas</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#1e293b] mb-1">Como divulgar eventos sem verba?</h4>
                <p className="text-xs text-gray-600">
                  Discussão aberta com estratégias de divulgação via centro acadêmico e redes.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold pt-2 border-t border-emerald-200">
                  <span className="text-gray-500">Iniciado por Lucas M.</span>
                  <span className="text-[#34A853] underline">Ver Tópico →</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Static information strip: no floating icon or animated text overlap. */}
      <div className="mt-16 -mx-4 bg-[#1e293b] text-white py-4 border-y-3 border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs font-black tracking-wide uppercase">
          <span>Encontre embaixadores por campus, cidade e região</span>
          <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-[#FBBC04]" />
          <span>Crie eventos, agenda e fóruns em um só lugar</span>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
