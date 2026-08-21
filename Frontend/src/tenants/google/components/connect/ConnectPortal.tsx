import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { authApi, type AmbassadorDirectoryItem, type MacroRegion, type AnnouncementItem } from "../../../../services/auth";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  UsersRound,
  MapPin,
  Building2,
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  Heart,
  Globe,
  Bell,
  MessageSquare,
  Filter,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

export type ConnectTab = "ambassadors" | "regions" | "announcements" | "community";

export default function ConnectPortal({
  initialTab = "ambassadors",
  selectedRegionSlug,
}: {
  initialTab?: ConnectTab;
  selectedRegionSlug?: string;
}) {
  const [activeTab, setActiveTab] = useState<ConnectTab>(initialTab);

  // Ambassadors State
  const [ambassadors, setAmbassadors] = useState<AmbassadorDirectoryItem[]>([]);
  const [ambLoading, setAmbLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(selectedRegionSlug || "ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Regions State
  const [regions, setRegions] = useState<MacroRegion[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [annLoading, setAnnLoading] = useState(true);

  // Campus List for dropdown filter
  const [campuses, setCampuses] = useState<Array<{ slug: string; name: string }>>([]);

  useEffect(() => {
    authApi.listCampuses()
      .then((res) => setCampuses(res.campuses.map((c) => ({ slug: c.slug, name: c.name }))))
      .catch(() => setCampuses([]));

    const params = new URLSearchParams(window.location.search);
    const campusParam = params.get("campus");
    if (campusParam) {
      setSelectedCampus(campusParam);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "ambassadors") return;
    setAmbLoading(true);
    authApi
      .getAmbassadors({
        search: search.trim() || undefined,
        campus: selectedCampus || undefined,
        region: selectedRegion !== "ALL" ? selectedRegion : undefined,
        state: selectedState !== "ALL" ? selectedState : undefined,
      })
      .then((res) => setAmbassadors(res.ambassadors))
      .catch(() => setAmbassadors([]))
      .finally(() => setAmbLoading(false));
  }, [activeTab, search, selectedCampus, selectedRegion, selectedState]);

  useEffect(() => {
    if (activeTab !== "regions") return;
    setRegionsLoading(true);
    authApi
      .getRegions()
      .then((res) => setRegions(res.regions))
      .catch(() => setRegions([]))
      .finally(() => setRegionsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "announcements") return;
    setAnnLoading(true);
    authApi
      .getAnnouncements()
      .then((res) => setAnnouncements(res.announcements))
      .catch(() => setAnnouncements([]))
      .finally(() => setAnnLoading(false));
  }, [activeTab]);

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
        <img src="/heart.png" alt="" className="w-16 lg:w-24 h-auto drop-shadow-md" />
      </div>
      <div className="absolute top-32 right-[4%] float-medium z-10 hidden md:block pointer-events-none">
        <img src="/chat.png" alt="" className="w-20 lg:w-28 h-auto drop-shadow-md" />
      </div>

      {/* Hero Banner in Light Theme */}
      <section className="relative pt-28 sm:pt-36 pb-10 px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1 hover:rotate-1 transition-transform">
            <UsersRound className="w-4 h-4" />
            <span>CONNECT &amp; COMUNIDADE ACADÊMICA</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.15]">
            Conecte-se com Líderes.<br />
            <span className="relative inline-block mt-2">
              <span className="bg-[#34A853] text-white px-4 py-1 rounded-2xl border-3 border-[#1e293b] shadow-hard-black -rotate-2 inline-block">
                Ambassadors &amp; Regiões.
              </span>
            </span>
          </h1>

          <p className="text-[#475569] font-medium text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Descubra lideranças estudantis por universidade e macrorregião, acompanhe comunicados oficiais e conecte-se com quem faz a comunidade acontecer.
          </p>
        </div>
      </section>

      {/* Navigation Subtabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="flex items-center justify-between gap-4 border-b-2 border-slate-200 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ambassadors")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "ambassadors"
                  ? "bg-[#34A853] text-white border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b]"
                  : "bg-white text-slate-700 hover:text-[#1e293b] border-2 border-slate-200 hover:border-[#1e293b]"
              }`}
            >
              <UsersRound className="w-4 h-4" />
              Diretório de Ambassadors
            </button>

            <button
              onClick={() => setActiveTab("regions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "regions"
                  ? "bg-[#34A853] text-white border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b]"
                  : "bg-white text-slate-700 hover:text-[#1e293b] border-2 border-slate-200 hover:border-[#1e293b]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Ambassadors por Região
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "announcements"
                  ? "bg-[#34A853] text-white border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b]"
                  : "bg-white text-slate-700 hover:text-[#1e293b] border-2 border-slate-200 hover:border-[#1e293b]"
              }`}
            >
              <Bell className="w-4 h-4" />
              Comunicados Oficiais
            </button>

            <a
              href="/forums"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black bg-white text-slate-700 hover:text-[#1e293b] border-2 border-slate-200 hover:border-[#1e293b] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Fóruns da Comunidade
            </a>
          </div>
        </div>

        {/* TAB 1: AMBASSADORS DIRECTORY */}
        {activeTab === "ambassadors" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou bio..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#34A853]"
                />
              </div>

              {/* Campus Filter */}
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                aria-label="Filtrar por Campus Universitário"
                className="w-full px-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#34A853] font-bold cursor-pointer"
              >
                <option value="">Todos os Campuses</option>
                {campuses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.slug.toUpperCase()})
                  </option>
                ))}
              </select>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                aria-label="Filtrar por Macrorregião"
                className="w-full px-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#34A853] font-bold cursor-pointer"
              >
                <option value="ALL">Todas as Regiões</option>
                <option value="sudeste">Sudeste (SP, MG, RJ, ES)</option>
                <option value="sul">Sul (RS, SC, PR)</option>
                <option value="nordeste">Nordeste (BA, PE, CE...)</option>
                <option value="centro-oeste">Centro-Oeste (DF, GO, MT, MS)</option>
                <option value="norte">Norte (AM, PA, AC...)</option>
              </select>

              {/* Reset Filters */}
              {(search || selectedCampus || selectedRegion !== "ALL" || selectedState !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCampus("");
                    setSelectedRegion("ALL");
                    setSelectedState("ALL");
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1e293b] text-xs font-black text-[#1e293b] transition-colors cursor-pointer shadow-2xs"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Ambassadors Grid */}
            {ambLoading ? (
              <div className="p-16 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
                Carregando embaixadores...
              </div>
            ) : ambassadors.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-3 shadow-hard-black">
                <UsersRound className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-black text-[#1e293b]">Nenhum embaixador encontrado</h3>
                <p className="text-xs text-[#64748b] font-medium max-w-sm mx-auto">
                  Tente alterar os termos de busca ou filtros de universidade e região.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ambassadors.map((amb) => (
                  <a
                    key={amb.id}
                    href={`/ambassadors/${amb.nickname || amb.id}`}
                    className="group p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-[#1e293b] flex items-center justify-center text-[#1e293b] text-lg font-black shrink-0 overflow-hidden shadow-2xs">
                          {amb.avatarPath ? (
                            <img src={amb.avatarPath} alt={amb.name} className="w-full h-full object-cover" />
                          ) : (
                            amb.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-[#1e293b] group-hover:text-[#34A853] transition-colors truncate">
                            {amb.name}
                          </h3>
                          <div className="text-2xs text-[#B45309] font-black flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                            Ambassador
                          </div>
                          {amb.course && (
                            <div className="text-2xs text-[#64748b] truncate mt-0.5 flex items-center gap-1 font-bold">
                              <GraduationCap className="w-3 h-3 text-slate-500" />
                              {amb.course}
                            </div>
                          )}
                        </div>
                      </div>

                      {amb.bio && (
                        <p className="text-xs text-[#475569] font-medium line-clamp-2 leading-relaxed">{amb.bio}</p>
                      )}

                      {/* University & Region Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-[#E8F0FE] text-[#1D4ED8] border border-[#4285F4] text-2xs font-mono font-black flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#4285F4]" />
                          {amb.universityName}
                        </span>
                        {amb.region && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#E6F4EA] text-[#137333] border border-[#34A853] text-2xs font-mono font-black flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#34A853]" />
                            {amb.region}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-2xs">
                      <span className="text-[#64748b] font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[#EA4335]" />
                        {amb.likes} reconhecimentos
                      </span>
                      <span className="font-black text-[#34A853] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Ver perfil
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGIONS DISCOVERY */}
        {activeTab === "regions" && (
          <div className="space-y-6">
            <div className="text-xs font-black uppercase tracking-wider text-[#475569]">
              Descubra embaixadores universitários organizados pelas macrorregiões brasileiras.
            </div>

            {regionsLoading ? (
              <div className="p-16 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
                Carregando regiões...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regions.map((reg) => (
                  <button
                    key={reg.slug}
                    onClick={() => {
                      setSelectedRegion(reg.slug);
                      setActiveTab("ambassadors");
                    }}
                    className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853] flex items-center justify-center shadow-2xs">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-2xs font-mono font-black uppercase bg-[#FFF8E1] text-[#B45309] border border-[#FBBC04]">
                          {reg.totalAmbassadors ?? 0} Ambassadors
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#1e293b] group-hover:text-[#34A853] transition-colors">
                        Região {reg.name}
                      </h3>

                      <p className="text-xs text-[#475569] font-medium leading-relaxed">{reg.description}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {reg.states.map((st) => (
                          <span key={st} className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-2xs font-mono font-black">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-2xs font-black text-[#34A853]">
                      <span>Ver Ambassadors desta região</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="text-xs font-black uppercase tracking-wider text-[#475569]">
              Comunicados e novidades oficiais transmitidos para todo o ecossistema Student Ambassador.
            </div>

            {annLoading ? (
              <div className="p-16 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
                Carregando comunicados...
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-3 shadow-hard-black">
                <Bell className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-black text-[#1e293b]">Nenhum comunicado recente</h3>
                <p className="text-xs text-[#64748b] font-medium max-w-sm mx-auto">
                  Avisos e comunicados gerais serão publicados nesta área.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-2xs font-mono font-black uppercase bg-[#E8F0FE] text-[#1D4ED8] border border-[#4285F4]">
                          {ann.category}
                        </span>
                        {ann.isPinned && (
                          <span className="px-2.5 py-0.5 rounded-lg text-2xs font-black bg-[#FFF8E1] text-[#B45309] border border-[#FBBC04]">
                            Fixado
                          </span>
                        )}
                      </div>
                      <span className="text-2xs font-bold text-slate-500">
                        {new Date(ann.publishedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#1e293b]">{ann.title}</h3>
                    <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>

                    <div className="pt-2 text-2xs text-[#64748b] flex items-center gap-1 border-t border-slate-100">
                      <span>Publicado por:</span>
                      <span className="font-black text-[#1e293b]">{ann.authorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
