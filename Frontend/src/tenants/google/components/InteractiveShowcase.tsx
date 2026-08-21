import React, { useState } from 'react';
import { User, MapPin, Calendar, Building2, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const mockAmbassadors = [
  { name: 'Beatriz Lima', role: 'Embaixadora Estudantil', campus: 'USP - Butantã', course: 'Engenharia de Software', city: 'São Paulo, SP', avatarBg: '#4F46E5', badge: 'Líder de IA', tags: ['Gemini', 'Python', 'Workshops'] },
  { name: 'Gabriel Santos', role: 'Embaixador Estudantil', campus: 'UNICAMP', course: 'Ciência da Computação', city: 'Campinas, SP', avatarBg: '#06B6D4', badge: 'Organizador Tech', tags: ['Cloud', 'Go', 'Hackathons'] },
  { name: 'Mariana Costa', role: 'Embaixadora Estudantil', campus: 'UFMG', course: 'Sistemas de Informação', city: 'Belo Horizonte, MG', avatarBg: '#10B981', badge: 'Comunidade & Design', tags: ['UX/UI', 'WebDev', 'Talks'] },
  { name: 'Rafael Oliveira', role: 'Embaixador Estudantil', campus: 'PUC-Rio', course: 'Engenharia de Produção', city: 'Rio de Janeiro, RJ', avatarBg: '#F59E0B', badge: 'Líder de Campus', tags: ['Analytics', 'Flutter', 'Meetups'] }
];

const mockEvents = [
  { title: 'Workshop Universitário de IA com Gemini', date: '22 de Março · 14h', campus: 'USP Butantã - Auditório de Poli', host: 'Beatriz Lima', attendees: 54, tag: 'WORKSHOP', tagBg: '#4F46E5' },
  { title: 'Study Jam Acadêmico: IA e Engenharia de Prompts', date: '05 de Abril · 10h', campus: 'UNICAMP - Lab 3 de Computação', host: 'Gabriel Santos', attendees: 38, tag: 'STUDY JAM', tagBg: '#10B981' },
  { title: 'Campus Tech Summit: O Futuro do Desenvolvedor', date: '15 de Abril · 09h', campus: 'UFMG - Centro de Atividades', host: 'Mariana Costa & Equipe', attendees: 120, tag: 'CONFERÊNCIA', tagBg: '#06B6D4' }
];

const mockCampuses = [
  { slug: 'usp', name: 'USP · Universidade de São Paulo', state: 'SP', members: 48, domain: '@usp.br', badge: 'Líder de Pesquisa', tagBg: '#EEF2FF', tagText: '#4F46E5' },
  { slug: 'unicamp', name: 'UNICAMP · Universidade Estadual de Campinas', state: 'SP', members: 32, domain: '@unicamp.br', badge: 'Hub de Inovação', tagBg: '#ECFEFF', tagText: '#0891B2' },
  { slug: 'ufmg', name: 'UFMG · Universidade Federal de Minas Gerais', state: 'MG', members: 29, domain: '@ufmg.br', badge: 'Comunidade Ativa', tagBg: '#ECFDF5', tagText: '#059669' }
];

const InteractiveShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'events' | 'campuses'>('ambassadors');

  return (
    <section id="demonstracao" className="py-24 bg-white border-y-3 border-[#1e293b] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs px-4 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-1 mb-4 uppercase tracking-wider">
            <img src="/sparkle.png" alt="Sparkle" className="w-4 h-4 object-contain" />
            <span>PRÉVIA DA PLATAFORMA EM AÇÃO</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            Veja como a Comunidade <br />
            <span className="relative inline-block mt-2">
              <span className="bg-[#4F46E5] text-white px-4 py-1.5 rounded-2xl border-3 border-[#1e293b] shadow-hard-black rotate-1 inline-block">
                Interage no Dia a Dia
              </span>
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-gray-600 font-medium max-w-xl mx-auto">
            Estudantes e embaixadores conectados voluntariamente por universidade e região.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'ambassadors'
                ? 'bg-[#4F46E5] text-white shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <User size={18} />
            <span>Embaixadores &amp; Perfis</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#06B6D4] text-slate-900 shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <Calendar size={18} />
            <span>Eventos &amp; Workshops</span>
          </button>

          <button
            onClick={() => setActiveTab('campuses')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'campuses'
                ? 'bg-[#10B981] text-white shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <Building2 size={18} />
            <span>Universidades &amp; Campi</span>
          </button>
        </div>

        {/* Tab Content Display Outer Frame */}
        <div className="bg-[#F8FAFC] rounded-3xl border-3 border-[#1e293b] shadow-hard-black p-6 sm:p-8">
          
          {/* TAB 1: Ambassadors */}
          {activeTab === 'ambassadors' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <Users size={18} className="text-[#4F46E5]" />
                  ESTUDANTES LÍDERES NA COMUNIDADE
                </span>
                <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-300">
                  {mockAmbassadors.length} Perfis em Destaque
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAmbassadors.map((person, idx) => {
                  const safeInitials = (person.name || '')
                    .trim()
                    .split(/\s+/)
                    .map((n) => n.charAt(0))
                    .join('')
                    .slice(0, 2);

                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg border-2 border-[#1e293b] shadow-sm shrink-0"
                              style={{ backgroundColor: person.avatarBg }}
                            >
                              {safeInitials}
                            </div>
                            <div>
                              <h3 className="font-black text-base text-[#1e293b] leading-snug">{person.name}</h3>
                              <p className="text-xs font-bold text-[#4F46E5]">{person.role}</p>
                            </div>
                          </div>
                          <span className="text-2xs font-black bg-[#FBBC04] text-[#1e293b] px-2 py-0.5 rounded border border-[#1e293b] shrink-0">
                            {person.badge}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600 mb-4 pl-1">
                          <p className="flex items-center gap-1.5 font-medium">
                            <GraduationCapIcon /> {person.course} · <span className="font-bold text-gray-800">{person.campus}</span>
                          </p>
                          <p className="flex items-center gap-1.5 font-medium">
                            <MapPinIcon /> {person.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                        {person.tags.map((t, i) => (
                          <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Events */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={18} className="text-[#06B6D4]" />
                  PRÓXIMAS ATIVIDADES UNIVERSITÁRIAS
                </span>
                <a href="/events" className="text-xs font-black text-[#06B6D4] hover:underline flex items-center gap-1">
                  Ver Todos no Calendário <ArrowRight size={14} />
                </a>
              </div>

              <div className="space-y-4">
                {mockEvents.map((ev, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-black text-[10px] text-white px-2 py-0.5 rounded border border-[#1e293b]"
                          style={{ backgroundColor: ev.tagBg }}
                        >
                          {ev.tag}
                        </span>
                        <span className="text-xs font-bold text-gray-500">{ev.date}</span>
                      </div>
                      <h4 className="font-black text-base text-[#1e293b]">{ev.title}</h4>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <MapPinIcon /> {ev.campus} · <span className="text-gray-500">Por {ev.host}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                        👥 {ev.attendees} inscritos
                      </span>
                      <a href="/events" className="bg-[#1e293b] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#4285F4] transition-colors cursor-pointer border border-[#1e293b]">
                        Ver Evento
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Campuses */}
          {activeTab === 'campuses' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={18} className="text-[#34A853]" />
                  ESPAÇOS UNIVERSITÁRIOS DEDICADOS
                </span>
                <a href="/campuses" className="text-xs font-black text-[#34A853] hover:underline flex items-center gap-1">
                  Ver Todas as Universidades <ArrowRight size={14} />
                </a>
              </div>

              <div className="space-y-4">
                {mockCampuses.map((c, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#34A853] transition-colors shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span 
                          className="font-black text-[10px] px-2 py-0.5 rounded border border-[#1e293b] inline-block font-mono uppercase"
                          style={{ backgroundColor: c.tagBg, color: c.tagText }}
                        >
                          {c.slug}
                        </span>
                        <span className="text-2xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.domain}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#1e293b]">{c.name}</h4>
                      <span className="text-xs text-gray-500 font-medium">Estado: {c.state}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-bold text-[#1e293b] bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
                        🏛️ {c.members} membros
                      </span>
                      <a 
                        href={`/${c.slug}`}
                        className="bg-[#34A853] text-white font-black text-xs px-4 py-2 rounded-xl border-2 border-[#1e293b] shadow-2xs hover:bg-[#2D9249] transition-all"
                      >
                        Acessar Espaço →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

const GraduationCapIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#34A853] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default InteractiveShowcase;
