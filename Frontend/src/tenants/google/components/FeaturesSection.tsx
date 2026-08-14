import React from 'react';
import { Bell, Building2, CalendarDays, MapPin, MessageSquare, UserRound } from 'lucide-react';

const features = [
  { title: 'Encontre sua rede local', description: 'Filtre embaixadores pelo campus, cidade ou região e descubra quem pode construir junto com você.', label: 'CONEXÃO LOCAL', Icon: MapPin, color: '#4285F4', background: '#EBF3FE' },
  { title: 'Crie o espaço do seu campus', description: 'Cadastre sua universidade, apresente a comunidade local e mantenha suas iniciativas organizadas.', label: 'CAMPUS', Icon: Building2, color: '#EA4335', background: '#FEF0EF' },
  { title: 'Publique eventos e agenda', description: 'Organize workshops, talks e study jams, compartilhe a programação e receba alunos interessados.', label: 'EVENTOS', Icon: CalendarDays, color: '#D97706', background: '#FFF8E7' },
  { title: 'Participe de fóruns', description: 'Peça ajuda, compartilhe experiências e encontre soluções para os desafios de organizar no campus.', label: 'COMUNIDADE', Icon: MessageSquare, color: '#34A853', background: '#EFFBF3' },
  { title: 'Conheça os embaixadores', description: 'Perfis claros ajudam estudantes e colegas a entender quem é cada embaixador e sua atuação.', label: 'PERFIS', Icon: UserRound, color: '#4285F4', background: '#EBF3FE' },
  { title: 'Centralize as novidades', description: 'Acompanhe notificações, novos eventos, fóruns e atualizações da sua comunidade sem depender de vários grupos.', label: 'NOTIFICAÇÕES', Icon: Bell, color: '#EA4335', background: '#FEF0EF' },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="recursos" className="py-24 bg-white/70 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex bg-[#34A853] text-white font-black text-xs px-3.5 py-1 rounded-full border-2 border-[#1e293b] shadow-sm mb-3 uppercase tracking-wider">Recursos do Hub</span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            O que você precisa para fazer<br />
            <span className="text-[#4285F4]">a comunidade acontecer</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-medium">
            Uma base compartilhada para embaixadores organizarem seus campus e para estudantes encontrarem oportunidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map(({ title, description, label, Icon, color, background }) => (
            <article key={title} className="bg-white rounded-[2rem] p-7 border-2 border-[#1e293b] shadow-hard-black hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="font-black text-[10px] px-3 py-1 rounded-full border border-[#1e293b]" style={{ color, backgroundColor: background }}>{label}</span>
                <span className="w-12 h-12 rounded-2xl border-2 border-[#1e293b] flex items-center justify-center" style={{ color, backgroundColor: background }}><Icon size={24} strokeWidth={2.5} /></span>
              </div>
              <h3 className="text-xl font-black text-[#1e293b] mb-3">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
