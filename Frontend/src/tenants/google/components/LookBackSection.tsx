import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LookBackSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="lookback" className="relative bg-white rounded-3xl p-8 md:p-12 border-3 border-[#1e293b] shadow-hard-black max-w-6xl mx-auto my-16">
      
      {/* Decorative Floating chat.png Top Right */}
      <div className="absolute -top-10 right-10 hidden md:block z-20 hover:scale-110 transition-transform cursor-pointer">
        <img src="/chat.png" alt="Chat" className="w-20 h-20 object-contain filter drop-shadow-[0_10px_20px_rgba(66,133,244,0.25)] rotate-12" />
      </div>

      <div className="text-center mb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-1 mb-3 uppercase tracking-wider">
          <img src="/sparkle.png" alt="Sparkle" className="w-4 h-4 object-contain" />
          <span>RETROSPECTIVA NACIONAL</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#1e293b] tracking-tight">
          Uma Volta a <span className="text-[#FBBC04]">2</span><span className="text-[#EA4335]">0</span><span className="text-[#34A853]">2</span><span className="text-[#4285F4]">5</span>
        </h2>
        <p className="text-gray-700 font-bold text-sm md:text-base leading-relaxed">
          O programa Embaixadores do Google Brasil 2025 escalou por todo o país. Líderes estudantis levaram a tecnologia do Google para salas de aula, laboratórios e auditórios.
        </p>
      </div>

      {/* Photo Carousel with Navigation Controls */}
      <div className="relative flex items-center max-w-4xl mx-auto">
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-4 bg-white text-[#1e293b] p-3 rounded-full border-3 border-[#1e293b] shadow-hard-black z-20 hover:scale-110 transition-transform cursor-pointer"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 w-full snap-x scrollbar-hide px-2 scroll-smooth"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-none w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden snap-center relative border-3 border-[#1e293b] shadow-sm group">
              <img 
                src={`https://picsum.photos/seed/gsa2025_${i}/500/500`} 
                alt={`Evento GSA ${i}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                <span className="text-white text-xs font-black">Summit GSA 2025 #{i}</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute -right-4 bg-white text-[#1e293b] p-3 rounded-full border-3 border-[#1e293b] shadow-hard-black z-20 hover:scale-110 transition-transform cursor-pointer"
          aria-label="Próximo"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default LookBackSection;
