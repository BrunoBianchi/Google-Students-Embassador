import React, { useState } from 'react';
import { User, MapPin, Calendar, MessageSquare, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const mockAmbassadors = [
  { name: 'Beatriz Lima', role: 'Embaixadora Google', campus: 'USP - Butantã', course: 'Engenharia de Software', city: 'São Paulo, SP', avatarBg: '#4285F4', badge: 'Líder de IA', tags: ['Gemini', 'Python', 'Workshops'] },
  { name: 'Gabriel Santos', role: 'Embaixador Google', campus: 'UNICAMP', course: 'Ciência da Computação', city: 'Campinas, SP', avatarBg: '#EA4335', badge: 'Organizador Tech', tags: ['Cloud', 'Go', 'Hackathons'] },
  { name: 'Mariana Costa', role: 'Embaixadora Google', campus: 'UFMG', course: 'Sistemas de Informação', city: 'Belo Horizonte, MG', avatarBg: '#FBBC04', badge: 'Comunidade & Design', tags: ['UX/UI', 'WebDev', 'Talks'] },
  { name: 'Rafael Oliveira', role: 'Embaixador Google', campus: 'PUC-Rio', course: 'Engenharia de Produção', city: 'Rio de Janeiro, RJ', avatarBg: '#34A853', badge: 'Líder de Campus', tags: ['Analytics', 'Flutter', 'Meetups'] }
];

const mockEvents = [
  { title: 'Google Gemini AI Hands-On Workshop', date: '22 de Março · 14h', campus: 'USP Butantã - Auditório de Poli', host: 'Beatriz Lima', attendees: 54, tag: 'WORKSHOP', tagBg: '#4285F4' },
  { title: 'Google Cloud Study Jam 2026', date: '05 de Abril · 10h', campus: 'UNICAMP - Lab 3 de Computação', host: 'Gabriel Santos', attendees: 38, tag: 'STUDY JAM', tagBg: '#34A853' },
  { title: 'DevFest Campus: O Futuro do Desenvolvedor', date: '15 de Abril · 09h', campus: 'UFMG - Centro de Atividades', host: 'Mariana Costa & Equipe', attendees: 120, tag: 'CONFERÊNCIA', tagBg: '#EA4335' }
];

const mockForums = [
  { title: 'Dicas para conseguir reserva de auditório para eventos do Google?', author: 'Lucas M. (UFRJ)', replies: 18, category: 'Organização', catBg: '#FEF0EF', catText: '#EA4335' },
  { title: 'Como estruturar um workshop prático de Gemini para iniciantes?', author: 'Ana P. (UFSC)', replies: 24, category: 'Conteúdo & IA', catBg: '#EBF3FE', catText: '#4285F4' },
  { title: 'Grupo de Estudo para Certificação Google Associate Cloud Engineer', author: 'Carlos H. (UNIFEI)', replies: 31, category: 'Grupos de Estudo', catBg: '#FFF8E7', catText: '#D97706' }
];

const InteractiveShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'events' | 'forums'>('ambassadors');

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
              <span className="bg-[#34A853] text-white px-4 py-1.5 rounded-2xl border-3 border-[#1e293b] shadow-hard-black rotate-1 inline-block">
                Interage no Dia a Dia
              </span>
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-gray-600 font-medium max-w-xl mx-auto">
            Alunos de todo o Brasil conectados, compartilhando e organizando iniciativas do Google.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'ambassadors'
                ? 'bg-[#4285F4] text-white shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <User size={18} />
            <span>Embaixadores & Perfis</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#EA4335] text-white shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <Calendar size={18} />
            <span>Eventos nos Campus</span>
          </button>

          <button
            onClick={() => setActiveTab('forums')}
            className={`flex items-center gap-2 font-black text-sm px-6 py-3 rounded-2xl border-3 border-[#1e293b] transition-all cursor-pointer ${
              activeTab === 'forums'
                ? 'bg-[#34A853] text-white shadow-hard-black -translate-y-0.5'
                : 'bg-white text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={18} />
            <span>Fóruns & Discussões</span>
          </button>
        </div>

        {/* Tab Content Display Outer Frame */}
        <div className="bg-[#FAF9F6] border-3 border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-hard-black">
          
          {/* TAB 1: Ambassadors */}
          {activeTab === 'ambassadors' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <Users size={18} className="text-[#4285F4]" />
                  EMBAIXADORES CADASTRADOS POR FACULDADE
                </span>
                <span className="text-xs font-bold text-gray-500">Mostrando 4 de 500+</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockAmbassadors.map((person, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] hover:border-[#4285F4] transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-11 h-11 rounded-full text-white font-black text-sm flex items-center justify-center border-2 border-[#1e293b] flex-shrink-0"
                        style={{ backgroundColor: person.avatarBg }}
                      >
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1e293b] leading-tight">{person.name}</h4>
                        <span className="text-[11px] font-extrabold text-[#4285F4] block">{person.campus}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1.5 mb-3 font-semibold">
                      <p className="flex items-center gap-1.5"><GraduationCapIcon /> {person.course}</p>
                      <p className="flex items-center gap-1.5"><MapPinIcon /> {person.city}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {person.tags.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold bg-[#EBF3FE] text-[#4285F4] px-2 py-0.5 rounded border border-[#4285F4]/30">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Campus Events */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={18} className="text-[#EA4335]" />
                  PRÓXIMOS EVENTOS EM UNIVERSIDADES
                </span>
                <span className="text-xs font-bold text-[#EA4335] bg-[#FEF0EF] px-3 py-1 rounded-full border border-[#EA4335]/30">
                  Abertos para alunos
                </span>
              </div>

              <div className="space-y-4">
                {mockEvents.map((evt, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-black text-[10px] px-2.5 py-0.5 rounded border border-[#1e293b]" style={{ backgroundColor: evt.tagBg }}>
                          {evt.tag}
                        </span>
                        <span className="text-xs font-bold text-gray-500">{evt.date}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#1e293b]">{evt.title}</h4>
                      <p className="text-xs text-gray-600 font-medium">📍 {evt.campus} · Organizado por <strong>{evt.host}</strong></p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-[#EFFBF3] text-[#34A853] px-3 py-1.5 rounded-xl border border-[#34A853]/30">
                        {evt.attendees} alunos confirmados
                      </span>
                      <button className="bg-[#1e293b] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#4285F4] transition-colors cursor-pointer border border-[#1e293b]">
                        Ver Evento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Forums */}
          {activeTab === 'forums' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <span className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#34A853]" />
                  TÓPICOS RECENTES NO FÓRUM DOS EMBAIXADORES
                </span>
                <button className="bg-[#34A853] text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-sm">
                  + Novo Tópico
                </button>
              </div>

              <div className="space-y-4">
                {mockForums.map((forum, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#1e293b] flex items-center justify-between gap-4 hover:border-[#34A853] transition-colors shadow-sm">
                    <div>
                      <span 
                        className="font-black text-[10px] px-2 py-0.5 rounded border border-[#1e293b] mb-1.5 inline-block"
                        style={{ backgroundColor: forum.catBg, color: forum.catText }}
                      >
                        {forum.category}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#1e293b]">{forum.title}</h4>
                      <span className="text-xs text-gray-500 font-medium">Por {forum.author}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-[#1e293b] bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
                        💬 {forum.replies} respostas
                      </span>
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
