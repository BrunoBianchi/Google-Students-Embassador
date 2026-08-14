import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    badgeBg: '#4285F4',
    title: 'Encontre a sua comunidade',
    desc: 'Pesquise campus, cidade ou região para encontrar embaixadores, conhecer seus perfis e descobrir o que já está acontecendo perto de você.',
    tag: 'DESCOBERTA'
  },
  {
    number: '02',
    badgeBg: '#EA4335',
    title: 'Ative seu Campus',
    desc: 'Embaixadores podem criar ou atualizar o espaço da sua universidade, reunir a rede local e deixar as informações fáceis de encontrar.',
    tag: 'CAMPUS'
  },
  {
    number: '03',
    badgeBg: '#FBBC04',
    badgeText: '#1e293b',
    title: 'Troque e planeje junto',
    desc: 'Participe de fóruns, organize grupos de trabalho e use a agenda compartilhada para coordenar cada iniciativa.',
    tag: 'COLABORAÇÃO'
  },
  {
    number: '04',
    badgeBg: '#34A853',
    title: 'Compartilhe oportunidades',
    desc: 'Publique eventos e atualizações. Estudantes podem descobrir atividades, aprender sobre o programa e entrar em contato com a comunidade.',
    tag: 'IMPACTO'
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="como-funciona" className="py-24 bg-[#FAFAFE] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-2 mb-3 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>PASSO A PASSO</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            Como Funciona a <br />
            <span className="bg-[#EA4335] text-white px-3 py-1 rounded-xl border-2 border-[#1e293b] inline-block rotate-1 mt-1">
              Sua Jornada no Hub
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-medium">
            Uma jornada aberta para organizar a atuação dos embaixadores e aproximar estudantes das oportunidades do campus.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div 
              key={step.number}
              className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#1e293b] shadow-hard-black flex flex-col justify-between hover:translate-x-0.5 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span 
                    className="w-14 h-14 rounded-2xl border-2 border-[#1e293b] text-white font-black text-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: step.badgeBg, color: step.badgeText || '#ffffff' }}
                  >
                    {step.number}
                  </span>

                  <span 
                    className="font-black text-[10px] sm:text-xs px-3 py-1 rounded-full border border-[#1e293b] uppercase tracking-wider"
                    style={{ backgroundColor: `${step.badgeBg}20`, color: step.badgeBg === '#FBBC04' ? '#D97706' : step.badgeBg }}
                  >
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] mb-3">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-100 flex items-center gap-2 text-xs font-bold text-[#34A853]">
                <CheckCircle2 size={16} />
                <span>Feito para aproximar pessoas e iniciativas</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
