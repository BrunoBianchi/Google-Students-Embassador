import React from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1e293b] text-white relative overflow-hidden">
      <div className="grid h-2.5 grid-cols-4">
        <div className="bg-[#4285F4]" />
        <div className="bg-[#EA4335]" />
        <div className="bg-[#FBBC04]" />
        <div className="bg-[#34A853]" />
      </div>

      <div className="max-w-[1720px] mx-auto px-5 py-12 sm:px-8 sm:py-14 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(11rem,0.65fr)_minmax(11rem,0.65fr)] lg:gap-16">
          <div className="max-w-md">
            <a href="/" aria-label="Google Student Ambassador" className="inline-block mb-6">
              <img src="/logo.png" alt="Google Student Ambassador" className="h-9 w-auto object-contain brightness-0 invert" />
            </a>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              O Hub conecta embaixadores, campus e estudantes para que iniciativas locais sejam mais fáceis de encontrar, organizar e compartilhar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
              <span className="rounded-full border border-[#4285F4]/60 bg-[#4285F4]/15 px-3 py-1.5 text-[#9fc3ff]">Campus</span>
              <span className="rounded-full border border-[#EA4335]/60 bg-[#EA4335]/15 px-3 py-1.5 text-[#ffb3ac]">Eventos</span>
              <span className="rounded-full border border-[#34A853]/60 bg-[#34A853]/15 px-3 py-1.5 text-[#9ce1ae]">Comunidade</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#FBBC04] mb-4">Explorar</h2>
            <ul className="space-y-3 text-sm font-bold text-slate-300">
              <li><a href="/#sobre" className="hover:text-white transition-colors">Sobre o Hub</a></li>
              <li><a href="/#recursos" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="/#demonstracao" className="hover:text-white transition-colors">Comunidade e campus</a></li>
              <li><a href="/forums" className="hover:text-white transition-colors">Fóruns da comunidade</a></li>
              <li><a href="/#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#34A853] mb-4">Participe</h2>
            <ul className="space-y-3 text-sm font-bold text-slate-300">
              <li><a href="/ambassadors" className="hover:text-white transition-colors">Encontre sua rede local</a></li>
              <li><a href="/#recursos" className="hover:text-white transition-colors">Crie o seu campus</a></li>
              <li><a href="/events" className="hover:text-white transition-colors">Veja os eventos</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Acesse o Hub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 border-t border-slate-700 pt-6 text-xs text-slate-400 lg:flex-row lg:items-center">
          <p className="font-bold">© 2026 GSA Brasil Hub. Feito para fortalecer comunidades universitárias.</p>
          <p className="flex items-center gap-1.5 font-medium">Criado com <Heart size={13} className="fill-[#EA4335] text-[#EA4335]" aria-label="amor" /> por <a href="https://www.linkedin.com/in/brunorbianchi/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-black text-white transition-colors hover:text-[#8AB4F8]">Bruno Bianchi <ArrowUpRight size={12} /></a></p>
          <p className="max-w-xl leading-relaxed lg:text-right">
            <strong className="text-slate-300">Projeto acadêmico independente.</strong> Não possui vínculo oficial, patrocínio ou endosso da Google LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
