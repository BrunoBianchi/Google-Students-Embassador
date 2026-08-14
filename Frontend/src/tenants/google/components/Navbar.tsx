import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getAvatarUrl } from '../../../services/auth';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'border-b border-slate-200 bg-white/95 py-3 shadow-[0_8px_28px_rgba(30,41,59,0.10)] backdrop-blur-xl'
        : 'bg-white/80 py-3.5 backdrop-blur-md'
    }`}>
      <div className="flex w-full items-center justify-between px-4 sm:px-8 xl:px-12 2xl:px-16 max-w-[1720px] mx-auto">
        
        {/* Static official program logo — no decorative container or secondary lockup. */}
        <a href="/" className="block shrink-0" aria-label="Google Student Ambassador">
          <img src="/logo.png" alt="Google Student Ambassador" className="h-8 sm:h-10 w-auto object-contain" />
        </a>

        {/* Navigation Links */}
        <nav aria-label="Navegação principal" className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm xl:flex">
          {[
            { label: 'O Hub', href: '#sobre' },
            { label: 'Recursos', href: '#recursos' },
            { label: 'Comunidade & Campus', href: '#demonstracao' },
            { label: 'Embaixadores 2026', href: '/ambassadors' },
            { label: 'Eventos', href: '/events' },
            { label: 'Fóruns', href: '/forums' },
            { label: 'Como Funciona', href: '#como-funciona' },
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href.startsWith('/') ? item.href : window.location.pathname === '/' ? item.href : `/${item.href}`} 
              className="rounded-xl px-3 py-2 text-[13px] font-black text-[#334155] transition-all duration-200 hover:bg-[#EBF3FE] hover:text-[#1D4ED8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden xl:flex items-center gap-3">
          {!isLoading && (user ? (
            <>
              <a href="/dashboard" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-sm transition-colors hover:bg-[#EBF3FE]" title="Abrir meu dashboard">
                <span className="w-7 h-7 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-black text-xs overflow-hidden">{getAvatarUrl(user.avatarPath) ? <img src={getAvatarUrl(user.avatarPath)} alt="" className="w-full h-full object-cover" /> : <UserRound size={15} />}</span>
                <span className="max-w-28 truncate font-black text-[13px]">{user.nickname ?? user.name}</span>
              </a>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-[#334155]" aria-label="Sair da conta">
                <span>Sair</span><LogOut size={15} />
              </button>
            </>
          ) : (
            <a href="/login" className="flex items-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 text-[13px] font-black text-white shadow-sm transition-colors hover:bg-[#334155]">
              <span>Entrar no Hub</span><ArrowUpRight size={16} />
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#1e293b] shadow-sm xl:hidden"
          aria-label="Abrir Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="xl:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white border-b-4 border-[#1e293b] px-4 py-4 sm:px-6 sm:py-6 mt-2 shadow-xl">
          <div className="flex flex-col gap-3">
            {[
              { label: 'O Hub GSA', href: '#sobre', color: '#4285F4' },
              { label: 'Recursos da Plataforma', href: '#recursos', color: '#EA4335' },
              { label: 'Comunidade & Campus', href: '#demonstracao', color: '#FBBC04' },
              { label: 'Embaixadores 2026', href: '/ambassadors', color: '#EA4335' },
              { label: 'Buscar eventos', href: '/events', color: '#4285F4' },
              { label: 'Buscar fóruns', href: '/forums', color: '#34A853' },
              { label: 'Como Funciona', href: '#como-funciona', color: '#34A853' },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl border-2 border-[#1e293b] font-extrabold text-sm text-[#1e293b] hover:bg-gray-50"
              >
                <span>{item.label}</span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              </a>
            ))}

            {user ? (
              <><a href="/dashboard" onClick={() => setMenuOpen(false)} className="mt-2 flex items-center justify-center gap-2 text-center bg-[#4285F4] text-white font-black py-3 rounded-xl border-3 border-[#1e293b] shadow-hard-black"><UserRound size={17} /> Meu dashboard</a><button onClick={handleLogout} className="flex items-center justify-center gap-2 text-center bg-[#1e293b] text-white font-black py-3 rounded-xl border-3 border-[#1e293b] shadow-hard-black"><LogOut size={17} /> Sair de {user.name}</button></>
            ) : (
              <a href="/login" onClick={() => setMenuOpen(false)} className="mt-2 text-center bg-[#4285F4] text-white font-black py-3 rounded-xl border-3 border-[#1e293b] shadow-hard-black">
                Acessar Comunidade
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
