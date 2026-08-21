import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  UserRound,
  BookOpen,
  ShieldCheck,
  FileText,
  UsersRound,
  Calendar,
  Building2,
  Map,
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { getAvatarUrl } from '../../../services/auth';
import Logo from './Logo';
import { getCrossSubdomainUrl } from '../../../utils/subdomain';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const isCampusesActive = currentPath === '/campuses' || currentPath.startsWith('/campuses/');
  const isAmbassadorsActive = currentPath.startsWith('/ambassadors') || currentPath.startsWith('/u/') || currentPath.startsWith('/regions');
  const isEventsActive = currentPath === '/events' || currentPath.startsWith('/events/');
  const isMapActive = currentPath === '/map';
  const isAboutActive = currentPath === '/about' || currentPath === '/#sobre';
  const isTermsActive = currentPath === '/terms';
  const isPrivacyActive = currentPath === '/privacy';

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled 
        ? 'border-b border-slate-200/90 bg-white/95 py-2.5 shadow-sm backdrop-blur-xl'
        : 'bg-white/90 py-3.5 backdrop-blur-md'
    }`}>
      <div className="flex w-full items-center justify-between px-4 sm:px-8 xl:px-12 2xl:px-16 max-w-[1720px] mx-auto">
        
        {/* Brand logo */}
        <a href={getCrossSubdomainUrl('MAIN', '/')} className="block shrink-0 transition-transform duration-150 hover:scale-[1.02]" aria-label="Campus Ambassador Hub | Comunidade Estudantil Independente">
          <Logo size="md" />
        </a>

        {/* Clean, Streamlined Desktop Navigation Bar */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-2xs backdrop-blur-xs">
          
          {/* Direct Public Hub Links in Portuguese */}
          <a
            href={getCrossSubdomainUrl('CAMPUS', '/')}
            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 ${
              isCampusesActive
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-700 hover:bg-white hover:text-blue-700'
            }`}
          >
            <Building2 size={13} className="text-indigo-600" />
            <span>Universidades</span>
          </a>

          <a
            href={getCrossSubdomainUrl('CONNECT', '/ambassadors')}
            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 ${
              isAmbassadorsActive
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-700 hover:bg-white hover:text-blue-700'
            }`}
          >
            <UsersRound size={13} className="text-emerald-600" />
            <span>Embaixadores</span>
          </a>

          <a
            href={getCrossSubdomainUrl('EVENTS', '/')}
            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 ${
              isEventsActive
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-700 hover:bg-white hover:text-blue-700'
            }`}
          >
            <Calendar size={13} className="text-[#EA4335]" />
            <span>Eventos</span>
          </a>

          <a
            href={getCrossSubdomainUrl('MAIN', '/map')}
            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 ${
              isMapActive ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-700 hover:bg-white hover:text-blue-700'
            }`}
          >
            <Map size={13} className="text-[#4285F4]" />
            <span>Mapa</span>
          </a>

          <a
            href={getCrossSubdomainUrl('MAIN', '/about')}
            className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${
              isAboutActive
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
            }`}
          >
            <span>Sobre</span>
          </a>

          <a
            href={getCrossSubdomainUrl('MAIN', '/terms')}
            className={`rounded-xl px-3 py-2 text-xs font-black transition-all flex items-center gap-1 ${
              isTermsActive || isPrivacyActive
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
            }`}
            title="Termos de Uso e Política de Privacidade (LGPD)"
          >
            <ShieldCheck size={13} className="text-slate-400" />
            <span>Termos</span>
          </a>

        </nav>

        {/* Action Button & User Profile */}
        <div className="hidden lg:flex items-center gap-3">
          {!isLoading && (user ? (
            <>
              <a href={getCrossSubdomainUrl('MAIN', '/dashboard')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-2xs transition-colors hover:bg-[#EBF3FE]" title="Abrir meu dashboard">
                <span className="w-7 h-7 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-black text-xs overflow-hidden">{getAvatarUrl(user.avatarPath) ? <img src={getAvatarUrl(user.avatarPath)} alt="" className="w-full h-full object-cover" /> : <UserRound size={15} />}</span>
                <span className="max-w-28 truncate font-black text-[13px]">{user.nickname ?? user.name}</span>
              </a>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-slate-800 cursor-pointer" aria-label="Sair da conta">
                <span>Sair</span><LogOut size={14} />
              </button>
            </>
          ) : (
            <a href={getCrossSubdomainUrl('MAIN', '/login')} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow-2xs transition-colors hover:bg-slate-800">
              <span>Entrar no Hub</span><ArrowUpRight size={15} />
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xs lg:hidden cursor-pointer"
          aria-label="Abrir Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white border-b border-slate-200 px-4 py-5 mt-2 shadow-xl animate-fadeIn">
          <div className="flex flex-col gap-2">
            
            {/* Links in Portuguese */}
            {[
              { label: 'Universidades & Campi', href: getCrossSubdomainUrl('CAMPUS', '/'), icon: Building2 },
              { label: 'Embaixadores Estudantis', href: getCrossSubdomainUrl('CONNECT', '/ambassadors'), icon: UsersRound },
              { label: 'Eventos Universitários', href: getCrossSubdomainUrl('EVENTS', '/'), icon: Calendar },
              { label: 'Mapa da Comunidade', href: getCrossSubdomainUrl('MAIN', '/map'), icon: Map },
              { label: 'Sobre o Campus Hub', href: getCrossSubdomainUrl('MAIN', '/about'), icon: BookOpen },
              { label: 'Termos de Uso', href: getCrossSubdomainUrl('MAIN', '/terms'), icon: FileText },
              { label: 'Política de Privacidade', href: getCrossSubdomainUrl('MAIN', '/privacy'), icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a 
                  key={item.label} 
                  href={item.href} 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
                >
                  <Icon size={16} className="text-slate-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}

            {user ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <a href={getCrossSubdomainUrl('MAIN', '/dashboard')} onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 text-center bg-[#4285F4] text-white font-black py-2.5 rounded-xl text-xs">
                  <UserRound size={15} /> Meu Dashboard
                </a>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-center bg-slate-900 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer">
                  <LogOut size={15} /> Sair da Conta
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100">
                <a href={getCrossSubdomainUrl('MAIN', '/login')} onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 text-center bg-slate-900 text-white font-black py-2.5 rounded-xl text-xs">
                  Acessar Minha Conta <ArrowUpRight size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
