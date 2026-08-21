import React, { useState, useEffect } from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { authApi, type EventDirectoryItem } from "../../../../services/auth";
import CampusAccessGate from "./CampusAccessGate";
import {
  Calendar,
  Globe,
  Lock,
  Plus,
  Search,
  MapPin,
  Users,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const EVENTS_PER_PAGE = 6;

const safeFormatDate = (val: string | number | Date | null | undefined, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }): string => {
  if (!val) return "A definir";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "A definir" : d.toLocaleDateString("pt-BR", options);
  } catch {
    return "A definir";
  }
};

const safeFormatTime = (val: string | number | Date | null | undefined): string => {
  if (!val) return "";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function CampusEvents() {
  const { campus, membership } = useCampus();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "campus" | "global">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState(campus?.city ?? "");
  const [state, setState] = useState(campus?.state ?? "");
  const [capacity, setCapacity] = useState("");
  const [visibility, setVisibility] = useState<"GLOBAL" | "CAMPUS">("CAMPUS");
  const [selectedTag, setSelectedTag] = useState<string>("workshop");

  const loadEvents = () => {
    if (!campus) return;
    setLoading(true);
    authApi.getCampusEvents(campus.slug)
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [campus]);

  if (!campus) return null;

  const isMember = membership?.isMember ?? false;
  const isAmbassador = membership?.isAmbassador ?? (user?.userType === "ambassador");

  // Strict Privacy Check: If not a member, only show access gate!
  if (!isMember) {
    return (
      <div className="py-4">
        <CampusAccessGate
          featureTitle="Agenda de Eventos Exclusiva do Campus"
          featureDescription="Os eventos e encontros presenciais deste campus são restritos aos estudantes com e-mail institucional confirmado."
        />
      </div>
    );
  }

  const filteredEvents = events.filter((e) => {
    const isLocal = e.visibility === "CAMPUS" || e.campusId === campus.id;
    if (filter === "campus" && !isLocal) return false;
    if (filter === "global" && isLocal) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      await authApi.createEvent({
        title,
        description,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        location,
        city: city || undefined,
        state: state || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        visibility,
        campusId: visibility === "CAMPUS" ? campus.id : undefined,
        imageUrls: [],
        tags: [selectedTag as any],
      });

      setIsCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
      setLocation("");
      loadEvents();
    } catch (err: any) {
      setCreateError(err?.message ?? "Não foi possível criar o evento.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
            Agenda do Campus
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Eventos &amp; Encontros</h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5 max-w-xl">
            Programação local da {campus.name} e iniciativas acadêmicas abertas.
          </p>
        </div>

        {isAmbassador && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2D9249] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Criar Evento no Campus</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => { setFilter("all"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#4285F4] text-white border-2 border-[#1e293b] shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Todos ({events.length})
          </button>
          <button
            onClick={() => { setFilter("campus"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              filter === "campus"
                ? "bg-[#FBBC04] text-[#1e293b] border-2 border-[#1e293b] shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Lock size={12} />
            <span>Do Campus</span>
          </button>
          <button
            onClick={() => { setFilter("global"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              filter === "global"
                ? "bg-[#34A853] text-white border-2 border-[#1e293b] shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Globe size={12} />
            <span>Globais</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por título, tag ou local..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#4285F4]"
          />
        </div>
      </div>

      {/* Events Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold text-xs">Carregando eventos do campus...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-2 shadow-hard-black">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-black text-[#1e293b]">Nenhum evento encontrado</h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto">
            Não há eventos cadastrados correspondentes a esta busca ou filtro.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedEvents.map((event) => (
              <div
                key={event.id}
                className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-2xs font-mono font-black uppercase ${
                        event.visibility === "GLOBAL"
                          ? "bg-[#E8F0FE] text-[#1D4ED8] border border-[#4285F4]"
                          : "bg-[#FFF8E1] text-[#B45309] border border-[#FBBC04]"
                      }`}
                    >
                      {event.visibility === "GLOBAL" ? "Global" : "Exclusivo Campus"}
                    </span>
                    <span className="text-2xs font-bold text-slate-500">
                      {safeFormatDate(event.startsAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#1e293b] line-clamp-1 mb-1">{event.title}</h3>
                    <p className="text-xs text-[#475569] line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-1 text-2xs font-bold text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    {safeFormatTime(event.startsAt) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{safeFormatTime(event.startsAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-2xs">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {event.participantCount} confirmados
                  </span>
                  <a
                    href={`/events/${event.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black border border-[#1e293b] shadow-2xs transition-all"
                  >
                    Inscrever-se →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Paginator */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-300 shadow-2xs">
              <span className="text-xs font-bold text-slate-600">
                Página <strong className="text-[#1e293b]">{currentPage}</strong> de <strong className="text-[#1e293b]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Anterior</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#4285F4] text-white border-2 border-[#1e293b] shadow-2xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Próximo</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h3 className="text-base font-black text-[#1e293b]">Criar Evento no Campus {campus.slug.toUpperCase()}</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-[#FCE8E6] border-2 border-[#EA4335] text-[#C5221F] text-xs font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Study Jam Google Gemini & Python"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes, programação e requisitos para os participantes..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Início *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Término (opcional)</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Local ou Link da Sala *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Auditório Principal ou Google Meet"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Visibilidade</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] font-bold"
                  >
                    <option value="CAMPUS">Exclusivo para Alunos do Campus</option>
                    <option value="GLOBAL">Aberto Globalmente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Limite de Vagas</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Sem limite"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#34A853] hover:bg-[#2D9249] disabled:opacity-50 text-white font-black text-xs border-2 border-[#1e293b] shadow-2xs cursor-pointer"
                >
                  {creating ? "Publicando..." : "Publicar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
