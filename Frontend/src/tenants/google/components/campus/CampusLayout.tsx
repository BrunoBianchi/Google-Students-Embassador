import React, { useState, useEffect, useRef } from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import { authApi, type Campus } from "../../../../services/auth";
import Logo from "../Logo";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  Info,
  ChevronDown,
  ExternalLink,
  MapPin,
  ShieldCheck,
  UserCheck,
  Search,
  Users,
  CheckCircle,
} from "lucide-react";

export type CampusTab = "home" | "events" | "workshops" | "resources" | "gemini" | "about";

export default function CampusLayout({
  activeTab = "home",
  children,
}: {
  activeTab?: CampusTab;
  children: React.ReactNode;
}) {
  const { campus, membership, isLoading, isNotFound, campusSlug } = useCampus();
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [allCampuses, setAllCampuses] = useState<Campus[]>([]);
  const [campusSearch, setCampusSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authApi.listCampuses()
      .then((res) => setAllCampuses(res.campuses))
      .catch(() => setAllCampuses([]));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCampusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-28">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0FE] border-2 border-[#1e293b] flex items-center justify-center mb-4 shadow-hard-black animate-pulse">
            <Building2 className="w-7 h-7 text-[#4285F4]" />
          </div>
          <p className="text-sm font-black text-[#1e293b]">Carregando dados do campus...</p>
        </div>
      </div>
    );
  }

  if (isNotFound || !campus) {
    return (
      <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-32 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FCE8E6] border-2 border-[#EA4335] text-[#EA4335] mx-auto flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#1e293b]">Campus Não Encontrado</h2>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              O campus <span className="font-mono font-bold text-[#4285F4]">/{campusSlug}</span> ainda não está cadastrado ou o endereço digitado está incorreto.
            </p>
            <div className="pt-2">
              <a
                href={getCrossSubdomainUrl("CAMPUS", "/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all"
              >
                Ver Diretório de Campuses
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const basePath = `/${campus.slug}`;
  const filteredCampuses = allCampuses.filter(
    (c) =>
      c.slug !== campus.slug &&
      (c.name.toLowerCase().includes(campusSearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(campusSearch.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(campusSearch.toLowerCase())))
  );

  const tabs: Array<{ id: CampusTab; label: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "home", label: "Início", href: basePath, icon: Building2 },
    { id: "events", label: "Eventos", href: `${basePath}/events`, icon: Calendar },
    { id: "workshops", label: "Workshops", href: `${basePath}/workshops`, icon: Layers },
    { id: "resources", label: "Recursos", href: `${basePath}/resources`, icon: BookOpen },
    { id: "gemini", label: "Gemini & IA", href: `${basePath}/gemini`, icon: Sparkles },
    { id: "about", label: "Sobre o Campus", href: `${basePath}/about`, icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] font-sans selection:bg-[#FBBC04] flex flex-col relative overflow-hidden">
      {/* Standard Fixed Navbar */}
      <Navbar />

      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Unified Campus Header & Navigation Section */}
      <section className="relative pt-24 sm:pt-28 pb-4 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Main Campus Hero Card */}
          <div className="rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black p-6 sm:p-8 space-y-6">
            
            {/* Top Bar: Breadcrumb + Campus Switcher + Membership Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-100">
              
              {/* Breadcrumb & Switcher */}
              <div className="flex items-center gap-2">
                <a
                  href={getCrossSubdomainUrl("CAMPUS", "/")}
                  className="text-xs font-black text-slate-500 hover:text-[#4285F4] transition-colors"
                >
                  Universidades
                </a>
                <span className="text-slate-300 font-bold">/</span>

                {/* Campus Quick Switcher Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1e293b] text-xs font-black text-[#1e293b] transition-all cursor-pointer shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#4285F4]" />
                    <span className="uppercase font-mono text-[#4285F4]">{campus.slug}</span>
                    <span className="hidden sm:inline text-slate-600 truncate max-w-[180px]">· {campus.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${campusDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {campusDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border-3 border-[#1e293b] shadow-hard-black p-2.5 z-50 animate-fadeIn">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={campusSearch}
                          onChange={(e) => setCampusSearch(e.target.value)}
                          placeholder="Buscar outra universidade..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#4285F4]"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredCampuses.map((c) => (
                          <a
                            key={c.id}
                            href={`/${c.slug}`}
                            onClick={() => setCampusDropdownOpen(false)}
                            className="p-2 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-black text-[#1e293b] group-hover:text-[#4285F4] truncate">
                                {c.name}
                              </div>
                              <div className="text-2xs text-[#64748b] flex items-center gap-1 font-mono">
                                <span className="text-[#4285F4] font-black uppercase">{c.slug}</span>
                                {c.city && <span>· {c.city}</span>}
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#4285F4] shrink-0" />
                          </a>
                        ))}
                      </div>

                      <div className="pt-2 mt-2 border-t-2 border-slate-100 text-center">
                        <a
                          href={getCrossSubdomainUrl("CAMPUS", "/")}
                          className="text-2xs font-black text-[#4285F4] hover:underline flex items-center justify-center gap-1 py-1"
                        >
                          <Users className="w-3 h-3" />
                          Ver diretório completo de universidades
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status / Membership Badges */}
              <div className="flex items-center gap-2">
                {membership?.isAmbassador && (
                  <span className="px-3 py-1 rounded-xl text-2xs font-black bg-[#FFF8E1] text-[#B45309] border-2 border-[#FBBC04] flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                    Embaixador do Campus
                  </span>
                )}
                {membership?.isMember && !membership?.isAmbassador && (
                  <span className="px-3 py-1 rounded-xl text-2xs font-black bg-[#E6F4EA] text-[#137333] border-2 border-[#34A853] flex items-center gap-1 shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5 text-[#34A853]" />
                    Estudante Verificado
                  </span>
                )}
                <span className="px-3 py-1 rounded-xl text-2xs font-black bg-[#E8F0FE] text-[#1D4ED8] border-2 border-[#4285F4] shadow-2xs">
                  {campus.totalMembers ?? 0} Membros
                </span>
              </div>
            </div>

            {/* Main Campus Title & Description */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-[#FBBC04] text-[#1e293b] border-2 border-[#1e293b] shadow-2xs -rotate-1">
                  Campus {campus.slug.toUpperCase()}
                </span>
                {campus.city && campus.state && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F1F5F9] text-[#1e293b] border-2 border-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
                    {campus.city}, {campus.state}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
                {campus.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-3xl leading-relaxed">
                {campus.description ||
                  `Espaço acadêmico dedicado da ${campus.name} para workshops práticos, grupos de estudo de IA e encontros universitários.`}
              </p>
            </div>

            {/* Seamless Integrated Navigation Tabs Bar */}
            <div className="pt-4 border-t-2 border-slate-100">
              <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Navegação do Campus">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <a
                      key={tab.id}
                      href={tab.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#4285F4] text-white border-2 border-[#1e293b] shadow-hard-black"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#1e293b] border-2 border-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

          </div>

        </div>
      </section>

      {/* Campus Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
