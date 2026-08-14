import React from 'react';
import { ArrowRight, Rocket } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section id="cta" className="py-20 sm:py-24 bg-[#FAFAFE] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main CTA Block */}
        <div className="relative bg-[#4285F4] text-white rounded-3xl p-8 sm:p-14 border-3 border-[#1e293b] shadow-hard-black overflow-hidden text-center sm:text-left">
          
          {/* Top Right Slanted Sticker Badge */}
          <div className="absolute -top-4 right-8 z-20 hidden md:block">
            <div className="bg-[#FBBC04] text-[#1e293b] font-black text-xs px-4 py-1.5 rounded-xl border-2 border-[#1e293b] rotate-6 shadow-sm flex items-center gap-1.5">
              <img src="/sparkle.png" alt="Sparkle" className="w-4 h-4 object-contain" />
              <span>COMUNIDADE GSA BRASIL</span>
            </div>
          </div>

          {/* Floating PNG images from /public inside CTA */}
          <div className="absolute top-6 right-6 hidden lg:block float-slow opacity-90">
            <img src="/sparkle.png" alt="Sparkle" className="w-20 h-20 object-contain filter drop-shadow-md" />
          </div>
          <div className="absolute bottom-6 right-24 hidden lg:block float-medium opacity-90">
            <img src="/smiley.png" alt="Smiley" className="w-16 h-16 object-contain filter drop-shadow-md" />
          </div>

          <div className="relative z-10 max-w-2xl">
            
            {/* White Pill Header Tag */}
            <div className="inline-flex items-center gap-2 bg-white text-[#4285F4] font-black text-xs px-3.5 py-1.5 rounded-lg border-2 border-[#1e293b] mb-6 uppercase tracking-wider shadow-sm">
              <Rocket size={14} className="text-[#4285F4]" />
              <span>VAMOS CONSTRUIR O FUTURO JUNTOS</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.15] mb-5 text-white tracking-tight">
              Conecte-se ao que acontece no seu campus
            </h2>

            {/* Subtitle */}
            <p className="text-blue-100 text-sm sm:text-base font-medium leading-relaxed mb-8">
              Encontre embaixadores, conheça eventos e acompanhe a comunidade. Se você é embaixador, organize seu campus em um só lugar.
            </p>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a href="/register" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#FBBC04] hover:bg-[#f5b300] text-[#1e293b] font-black text-base px-8 py-4 rounded-2xl border-3 border-[#1e293b] shadow-hard-black hover:-translate-y-0.5 transition-all cursor-pointer">
                <span>Explorar o Hub</span>
                <ArrowRight size={20} />
              </a>

              <span className="text-xs font-black text-blue-100 uppercase tracking-wider">
                ABERTO À COMUNIDADE UNIVERSITÁRIA
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTASection;
