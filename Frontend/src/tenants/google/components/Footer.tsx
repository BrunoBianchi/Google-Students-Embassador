import React from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white relative overflow-hidden">
      {/* Refined community gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4F46E5] via-[#06B6D4] to-[#10B981]" />

      <div className="max-w-[1720px] mx-auto px-5 py-12 sm:px-8 sm:py-14 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(11rem,0.65fr)_minmax(11rem,0.65fr)] lg:gap-16">
          <div className="max-w-md">
            <a href="/" aria-label="Campus Ambassador Hub | Comunidade Estudantil Independente" className="inline-block mb-6 transition-transform duration-150 hover:scale-[1.02]">
              <Logo variant="dark" size="md" />
            </a>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              O Campus Hub conecta embaixadores, campus e estudantes universitários para que iniciativas locais e estudos em IA sejam fáceis de encontrar, organizar e compartilhar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
              <span className="rounded-full border border-[#4F46E5]/60 bg-[#4F46E5]/15 px-3 py-1.5 text-[#c7d2fe]">Campus</span>
              <span className="rounded-full border border-[#06B6D4]/60 bg-[#06B6D4]/15 px-3 py-1.5 text-[#a5f3fc]">Eventos</span>
              <span className="rounded-full border border-[#10B981]/60 bg-[#10B981]/15 px-3 py-1.5 text-[#a7f3d0]">Comunidade</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#38BDF8] mb-4">Explorar</h2>
            <ul className="space-y-3 text-sm font-bold text-slate-300">
              <li><a href="/students" className="text-[#38BDF8] hover:text-white transition-colors flex items-center gap-1 font-black"><span>Estudantes &amp; Cursos de IA</span> <span className="text-[10px] bg-[#4F46E5] text-white px-1.5 py-0.2 rounded font-black">NOVO</span></a></li>
              <li><a href="/campuses" className="hover:text-white transition-colors">Universidades &amp; Campi</a></li>
              <li><a href="/#sobre" className="hover:text-white transition-colors">Sobre o Hub</a></li>
              <li><a href="/#recursos" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="/#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#10B981] mb-4">Participe</h2>
            <ul className="space-y-3 text-sm font-bold text-slate-300">
              <li><a href="/ambassadors" className="hover:text-white transition-colors">Encontre sua rede local</a></li>
              <li><a href="/#recursos" className="hover:text-white transition-colors">Crie o seu campus</a></li>
              <li><a href="/events" className="hover:text-white transition-colors">Veja os eventos</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Acesse o Hub</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors text-xs text-slate-400">Termos de Uso</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors text-xs text-slate-400">Política de Privacidade (LGPD)</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 border-t border-slate-800 pt-6 text-xs text-slate-400 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <p className="font-bold">© 2026 Campus Ambassador Hub. Feito para fortalecer comunidades universitárias.</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <a href="/terms" className="hover:text-slate-300 underline">Termos de Uso</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-slate-300 underline">Política de Privacidade</a>
            </div>
          </div>
          <p className="flex items-center gap-1.5 font-medium">Criado com <Heart size={13} className="fill-[#EA4335] text-[#EA4335]" aria-label="amor" /> por <a href="https://www.linkedin.com/in/brunorbianchi/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-black text-white transition-colors hover:text-[#38BDF8]">Bruno Bianchi <ArrowUpRight size={12} /></a></p>
          <p className="max-w-xl leading-relaxed lg:text-right">
            <strong className="text-slate-200">Projeto independente.</strong> Criado por participantes da comunidade para facilitar conexões entre estudantes. Não é um produto oficial da Google LLC ou da Amplifica e não é operado, patrocinado ou endossado por essas organizações. Todo conteúdo postado é de responsabilidade de seus respectivos autores.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

