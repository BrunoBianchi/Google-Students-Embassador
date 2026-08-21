import React, { useState, useEffect } from "react";
import { authApi, type Campus } from "../../../../services/auth";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  Building2,
  Search,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  Filter,
} from "lucide-react";

export default function CampusDirectory() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");

  useEffect(() => {
    setLoading(true);
    authApi
      .listCampuses({
        query: search.trim() || undefined,
        region: selectedRegion !== "ALL" ? selectedRegion : undefined,
        state: selectedState !== "ALL" ? selectedState : undefined,
      })
      .then((res) => setCampuses(res.campuses))
      .catch(() => setCampuses([]))
      .finally(() => setLoading(false));
  }, [search, selectedRegion, selectedState]);

  const states = Array.from(new Set(campuses.map((c) => c.state).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] font-sans selection:bg-[#FBBC04] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating 3D Stickers */}
      <div className="absolute top-36 left-[4%] float-slow z-10 hidden md:block pointer-events-none">
        <img src="/smiley.png" alt="" className="w-20 lg:w-28 h-auto drop-shadow-md" />
      </div>
      <div className="absolute top-32 right-[4%] float-medium z-10 hidden md:block pointer-events-none">
        <img src="/sparkle.png" alt="" className="w-24 lg:w-32 h-auto drop-shadow-md" />
      </div>

      {/* Hero Banner in Google Neo-Brutalist Light Theme */}
      <section className="relative pt-28 sm:pt-36 pb-10 px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Slanted Sticker Tag */}
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1 hover:rotate-1 transition-transform">
            <img src="/sparkle.png" alt="" className="w-4 h-4 object-contain" />
            <span>DIRETÓRIO DE UNIVERSIDADES &amp; CAMPI</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              REDE 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.15]">
            Universidades &amp; Campi.<br />
            <span className="relative inline-block mt-2">
              <span className="bg-[#4F46E5] text-white px-4 py-1 rounded-2xl border-3 border-[#1e293b] shadow-hard-black -rotate-2 inline-block">
                Espaços Acadêmicos.
              </span>
            </span>
          </h1>

          <p className="text-[#475569] font-medium text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Descubra espaços acadêmicos dedicados a cada universidade, com agendas de eventos locais, workshops práticos e lideranças estudantis.
          </p>

          {/* Search, Region & State Filter Container */}
          <div className="pt-4 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por universidade..."
                className="w-full pl-10 pr-4 py-3 bg-white border-3 border-[#1e293b] rounded-2xl text-xs font-bold text-[#1e293b] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4] shadow-hard-black transition-all"
              />
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Filtrar por Região"
              className="w-full px-4 py-3 bg-white border-3 border-[#1e293b] rounded-2xl text-xs font-black text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#4285F4] shadow-hard-black cursor-pointer"
            >
              <option value="ALL">Todas as Regiões</option>
              <option value="sudeste">Sudeste (SP, MG, RJ, ES)</option>
              <option value="sul">Sul (RS, SC, PR)</option>
              <option value="nordeste">Nordeste (BA, PE, CE...)</option>
              <option value="centro-oeste">Centro-Oeste (DF, GO, MT, MS)</option>
              <option value="norte">Norte (AM, PA, AC...)</option>
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filtrar por Estado"
              className="w-full px-4 py-3 bg-white border-3 border-[#1e293b] rounded-2xl text-xs font-black text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#4285F4] shadow-hard-black cursor-pointer"
            >
              <option value="ALL">Todos os Estados</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content List */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#475569] bg-white px-3 py-1.5 rounded-xl border-2 border-[#1e293b] shadow-2xs">
            Universidades Cadastradas ({campuses.length})
          </h2>
          <span className="text-2xs text-[#475569] font-mono font-bold">
            campus.studentembassador.com/:slug
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
            Carregando lista de universidades...
          </div>
        ) : campuses.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-4 shadow-hard-black">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-[#1e293b]">Nenhum campus encontrado</h3>
            <p className="text-xs text-[#64748b] font-medium max-w-sm mx-auto">
              Tente alterar os termos de busca ou filtros de região e estado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campuses.map((c) => (
              <div
                key={c.id}
                className="group bg-white border-3 border-[#1e293b] rounded-3xl shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between p-6 overflow-hidden relative"
              >
                <div className="space-y-4">
                  {/* Card Header with macOS Dots & Slug */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-2xs font-mono font-black uppercase bg-[#4285F4] text-white border border-[#1e293b]">
                      {c.slug}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-xl font-black text-[#1e293b] group-hover:text-[#4285F4] transition-colors mb-1.5">
                      {c.name}
                    </h3>
                    {c.city && c.state && (
                      <div className="text-xs text-[#64748b] font-bold flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
                        {c.city}, {c.state} {c.region && `· Região ${c.region}`}
                      </div>
                    )}
                    <p className="text-xs text-[#475569] font-medium line-clamp-3 leading-relaxed">
                      {c.description ||
                        `Espaço acadêmico dedicado da ${c.name} para workshops práticos, grupos de estudo de IA e encontros universitários.`}
                    </p>
                  </div>

                  {/* Badges / Stats */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-2xs">
                    {c.ambassadorCount !== undefined && c.ambassadorCount > 0 && (
                      <a
                        href={getCrossSubdomainUrl("CONNECT", `/ambassadors?campus=${c.slug}`)}
                        className="px-2.5 py-1 rounded-xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#1e293b] font-black flex items-center gap-1 hover:bg-[#FEF08A] transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                        {c.ambassadorCount} Ambassadors
                      </a>
                    )}
                    {c.eventsCount !== undefined && c.eventsCount > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#1D4ED8] font-black flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
                        {c.eventsCount} eventos
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#137333] font-black flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#34A853]" />
                      {c.totalMembers ?? 0} membros
                    </span>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                  <span className="text-2xs font-mono font-bold text-slate-500">
                    /{c.slug}
                  </span>
                  <a
                    href={`/${c.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b] group-hover:translate-x-0.5 transition-all"
                  >
                    Acessar Campus
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
