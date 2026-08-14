import React from 'react';
import { AlertTriangle, CheckCircle2, Users, Sparkles, GraduationCap, MapPin, Zap } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section id="sobre" className="py-24 bg-[#FAF9F6] border-y-3 border-[#1e293b] relative overflow-hidden">
      
      {/* Background doodles */}
      <div className="absolute top-10 right-10 text-gray-200 pointer-events-none select-none font-black text-9xl opacity-20">
        GSA
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header with Slanted Pill */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#EA4335] text-white font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-2 mb-3 uppercase tracking-wider">
            Por que criamos esta plataforma?
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            Do Isolamento para uma <br className="hidden sm:block"/>
            <span className="bg-[#FBBC04] text-[#1e293b] px-3 py-1 rounded-xl border-2 border-[#1e293b] inline-block rotate-1 mt-1">
              Rede Conectada & Forte
            </span>
          </h2>
        </div>

        {/* 2-Column Split: The Context & The Problem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-12">
          
          {/* Card 1: What is GSA */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#1e293b] shadow-hard-blue flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF3FE] border-2 border-[#1e293b] flex items-center justify-center text-[#4285F4]">
                  <GraduationCap size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-[#4285F4] tracking-wider">CONTEXTO DO PROGRAMA</span>
                  <h3 className="text-xl font-black text-[#1e293b]">O que faz o Embaixador Google?</h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium mb-4">
                O programa <strong className="text-[#1e293b] font-extrabold">Google Student Ambassador (GSA)</strong> reúne estudantes apaixonados por tecnologia para representar o Google em suas universidades.
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                Os embaixadores organizam talks, lideram workshops de IA (Gemini, Google Cloud), realizam eventos acadêmicos e ajudam outros alunos a evoluírem suas habilidades. É um papel de alto impacto!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 flex items-center gap-2 text-xs font-extrabold text-[#4285F4]">
              <Sparkles size={16} />
              <span>Centenas de estudantes selecionados em todo o Brasil</span>
            </div>
          </div>

          {/* Card 2: The Problem of Disorganization */}
          <div className="bg-[#FEF0EF] rounded-3xl p-6 sm:p-8 border-3 border-[#1e293b] shadow-hard-red flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EA4335] text-white border-2 border-[#1e293b] flex items-center justify-center shadow-sm">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-[#EA4335] tracking-wider">O DESAFIO REAL</span>
                  <h3 className="text-xl font-black text-[#1e293b]">A Falta de Organização e Conexão</h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-semibold mb-4">
                Sem uma ferramenta dedicada, muitos embaixadores atuam completamente isolados:
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA4335] mt-1.5 flex-shrink-0" />
                  <span><strong>Embaixadores da mesma cidade/região</strong> não se conhecem e não sabem o que os outros estão fazendo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA4335] mt-1.5 flex-shrink-0" />
                  <span><strong>Eventos duplicados ou sem alcance:</strong> Dificuldade em engajar alunos e encontrar co-organizadores para workshops.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA4335] mt-1.5 flex-shrink-0" />
                  <span><strong>Perda de histórico & trocas:</strong> Discussões valiosas ficam dispersas em chats informais sem busca ou fórum.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#EA4335]/30 flex items-center gap-2 text-xs font-black text-[#EA4335]">
              <span>⚠️ Isso reduz o rendimento e o potencial do programa!</span>
            </div>
          </div>

        </div>

        {/* Center Solution Banner Card */}
        <div className="bg-[#4285F4] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#1e293b] shadow-hard-black relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <span className="inline-block bg-[#FBBC04] text-[#1e293b] font-black text-xs px-3 py-1 rounded-md border border-[#1e293b] mb-3 uppercase tracking-wider">
                A SOLUÇÃO ENCONTRADA
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                Um Hub feito por Embaixadores, para Embaixadores!
              </h3>
              <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
                Esta plataforma centraliza perfis com bio e curso, mapa de universidades, fóruns de discussão, 
                criação de grupos de trabalho e compartilhamento direto de eventos para os alunos do seu campus.
              </p>
            </div>

            <div className="flex-shrink-0 flex gap-2">
              <div className="bg-white p-2.5 rounded-2xl border-2 border-[#1e293b] shadow-sm rotate-3">
                <img src="/smiley.png" alt="Smiley" className="w-12 h-12 object-contain" />
              </div>
              <div className="bg-[#FBBC04] p-2.5 rounded-2xl border-2 border-[#1e293b] shadow-sm -rotate-3">
                <img src="/sparkle.png" alt="Sparkle" className="w-12 h-12 object-contain" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutSection;
