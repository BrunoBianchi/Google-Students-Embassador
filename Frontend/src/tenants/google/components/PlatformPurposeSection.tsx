import React from 'react';
import { ArrowRight, Bell, CalendarDays, MapPin, MessageSquare } from 'lucide-react';

const PlatformPurposeSection: React.FC = () => {
  return (
    <section id="sobre" className="relative py-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="relative bg-white rounded-3xl p-8 md:p-12 border-3 border-[#1e293b] shadow-hard-black overflow-hidden">
        <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
          <div className="md:w-1/2">
            <span className="inline-flex items-center gap-2 bg-[#4285F4] text-white font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-2 mb-4 uppercase tracking-wider">
              O propósito do Hub
            </span>

            <h2 className="text-3xl md:text-5xl font-black mb-5 tracking-tight text-[#1e293b] leading-tight">
              A sua comunidade<br />
              <span className="bg-[#FBBC04] text-[#1e293b] px-3 py-1 rounded-xl border-2 border-[#1e293b] inline-block rotate-1 mt-1">
                começa perto de você
              </span>
            </h2>

            <p className="text-gray-700 font-medium text-sm md:text-base leading-relaxed mb-4">
              Os grupos nacionais aproximam a comunidade, mas encontrar quem está no mesmo campus, cidade ou região ainda pode ser difícil. O Hub reúne essa rede em um ponto acessível para embaixadores e estudantes.
            </p>

            <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed mb-6">
              Aqui, cada campus pode ganhar vida: pessoas encontram pares, organizam eventos e agendas, trocam experiências nos fóruns e acompanham as novidades que importam para a comunidade.
            </p>

            <a href="#demonstracao" className="inline-flex items-center gap-2 bg-[#4285F4] hover:bg-[#3367d6] text-white px-7 py-3.5 rounded-2xl font-black text-sm border-2 border-[#1e293b] shadow-hard-black hover:-translate-y-0.5 transition-all">
              Conhecer a rede <ArrowRight size={18} />
            </a>
          </div>

          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-[#EBF3FE] p-5 rounded-2xl border-2 border-[#1e293b] shadow-sm">
              <MapPin className="text-[#4285F4] mb-3" size={28} />
              <h3 className="font-extrabold text-[#1e293b] text-base mb-1">Rede local</h3>
              <p className="text-xs text-gray-600 font-medium">Encontre embaixadores por campus, cidade ou região.</p>
            </div>
            <div className="bg-[#FEF0EF] p-5 rounded-2xl border-2 border-[#1e293b] shadow-sm">
              <CalendarDays className="text-[#EA4335] mb-3" size={28} />
              <h3 className="font-extrabold text-[#1e293b] text-base mb-1">Eventos e agenda</h3>
              <p className="text-xs text-gray-600 font-medium">Crie, divulgue e acompanhe as iniciativas do campus.</p>
            </div>
            <div className="bg-[#EFFBF3] p-5 rounded-2xl border-2 border-[#1e293b] shadow-sm">
              <MessageSquare className="text-[#34A853] mb-3" size={28} />
              <h3 className="font-extrabold text-[#1e293b] text-base mb-1">Fóruns úteis</h3>
              <p className="text-xs text-gray-600 font-medium">Troque materiais, dúvidas e soluções com a comunidade.</p>
            </div>
            <div className="bg-[#FFF8E7] p-5 rounded-2xl border-2 border-[#1e293b] shadow-sm">
              <Bell className="text-[#D97706] mb-3" size={28} />
              <h3 className="font-extrabold text-[#1e293b] text-base mb-1">Notificações</h3>
              <p className="text-xs text-gray-600 font-medium">Tenha as atualizações da sua comunidade em um só lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPurposeSection;
