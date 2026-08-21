import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { authApi, type EventDirectoryItem } from "../../../../services/auth";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Globe,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Building2,
} from "lucide-react";

export type EventsTimeframe = "upcoming" | "calendar" | "past";

export default function EventsPortal({ initialTab = "upcoming" }: { initialTab?: EventsTimeframe }) {
  const [activeTab, setActiveTab] = useState<EventsTimeframe>(initialTab);
  const [events, setEvents] = useState<EventDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  const timeframeApiMap: Record<EventsTimeframe, "upcoming" | "month" | "past"> = {
    upcoming: "upcoming",
    calendar: "month",
    past: "past",
  };

  useEffect(() => {
    setLoading(true);
    authApi
      .getGlobalEvents({
        timeframe: timeframeApiMap[activeTab],
        search: search.trim() || undefined,
        tag: selectedTag !== "ALL" ? selectedTag : undefined,
      })
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [activeTab, search, selectedTag]);

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
        <img src="/sparkle.png" alt="" className="w-20 lg:w-28 h-auto drop-shadow-md" />
      </div>
      <div className="absolute top-32 right-[4%] float-medium z-10 hidden md:block pointer-events-none">
        <img src="/levels.png" alt="" className="w-20 lg:w-28 h-auto drop-shadow-md" />
      </div>

      {/* Hero Banner in Light Theme */}
      <section className="relative pt-28 sm:pt-36 pb-10 px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-3 border-[#1e293b] shadow-hard-black -rotate-1 hover:rotate-1 transition-transform">
            <Globe className="w-4 h-4" />
            <span>PORTAL GLOBAL DE EVENTOS &amp; SUMMITS</span>
            <span className="bg-[#1e293b] text-[#FBBC04] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              2026 BR
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.15]">
            Eventos, Summits &amp; Study Jams.<br />
            <span className="relative inline-block mt-2">
              <span className="bg-[#4F46E5] text-white px-4 py-1 rounded-2xl border-3 border-[#1e293b] shadow-hard-black -rotate-2 inline-block">
                Agenda Global Aberta.
              </span>
            </span>
          </h1>

          <p className="text-[#475569] font-medium text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Iniciativas globais e abertas organizadas por embaixadores e comunidades universitárias de tecnologia em todo o Brasil.
          </p>

          <div className="pt-2">
            <a
              href={getCrossSubdomainUrl("CAMPUS", "/")}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#4285F4] hover:underline"
            >
              <Building2 className="w-3.5 h-3.5" />
              Procurando eventos exclusivos do seu campus? Acesse o diretório de universidades →
            </a>
          </div>
        </div>
      </section>

      {/* Main Events Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Navigation Tabs and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black">
          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-[#1e293b] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-[#4285F4] text-white border border-[#1e293b] shadow-2xs"
                  : "text-slate-700 hover:text-[#1e293b]"
              }`}
            >
              Próximos Eventos
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-[#FBBC04] text-[#1e293b] border border-[#1e293b] shadow-2xs"
                  : "text-slate-700 hover:text-[#1e293b]"
              }`}
            >
              Calendário (Este Mês)
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "past"
                  ? "bg-[#EA4335] text-white border border-[#1e293b] shadow-2xs"
                  : "text-slate-700 hover:text-[#1e293b]"
              }`}
            >
              Anteriores
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar evento por tema..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              aria-label="Filtrar eventos por categoria"
              className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-black text-[#1e293b] focus:outline-none focus:border-[#4285F4] cursor-pointer"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="ai">Inteligência Artificial (IA)</option>
              <option value="workshop">Workshops</option>
              <option value="study-jam">Study Jams</option>
              <option value="cloud">Cloud &amp; DevOps</option>
              <option value="web">Desenvolvimento Web</option>
              <option value="hackathon">Hackathons</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
            Carregando eventos globais...
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-3 shadow-hard-black">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-[#1e293b]">Nenhum evento global encontrado</h3>
            <p className="text-xs text-[#64748b] font-medium max-w-sm mx-auto">
              {search ? "Tente alterar os termos de busca." : "Acompanhe as atualizações ou veja os eventos locais nos campuses."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="group p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Badge & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-2xs font-mono font-black uppercase tracking-wider bg-[#E8F0FE] text-[#1D4ED8] border-2 border-[#4285F4] flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Evento Global
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {(() => {
                        try {
                          const d = new Date(event.startsAt);
                          return isNaN(d.getTime())
                            ? "A confirmar"
                            : d.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                        } catch {
                          return "A confirmar";
                        }
                      })()}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-[#1e293b] group-hover:text-[#4285F4] transition-colors line-clamp-2 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#475569] font-medium line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-2xs font-mono font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-2xs text-[#64748b]">
                  <span className="flex items-center gap-1 truncate max-w-[140px] font-bold">
                    <MapPin className="w-3 h-3 text-[#EA4335] shrink-0" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1 font-black text-[#4285F4] group-hover:translate-x-0.5 transition-transform">
                    Ver detalhes
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
