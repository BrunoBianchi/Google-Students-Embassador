import React, { useState, useEffect } from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import { authApi, type EventDirectoryItem } from "../../../../services/auth";
import CampusAccessGate from "./CampusAccessGate";
import {
  Layers,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Terminal,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const WORKSHOPS_PER_PAGE = 6;

const safeFormatDate = (val: string | number | Date | null | undefined, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }): string => {
  if (!val) return "A definir";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "A definir" : d.toLocaleDateString("pt-BR", options);
  } catch {
    return "A definir";
  }
};

export default function CampusWorkshops() {
  const { campus, membership } = useCampus();
  const [workshops, setWorkshops] = useState<EventDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!campus) return;
    authApi.getCampusWorkshops(campus.slug)
      .then((res) => setWorkshops(res.workshops))
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false));
  }, [campus]);

  if (!campus) return null;

  const isMember = membership?.isMember ?? false;

  // Strict Privacy: If non-member, ONLY display the clean access gate!
  if (!isMember) {
    return (
      <div className="py-4">
        <CampusAccessGate
          featureTitle="Acesso às Oficinas Práticas do Campus"
          featureDescription="Os materiais das Study Jams e a inscrição em oficinas locais são liberados com a validação do seu e-mail institucional."
        />
      </div>
    );
  }

  const standardTracks = [
    {
      id: "track-gemini-starter",
      title: `Study Jam Gemini & IA Generativa (${campus.slug.toUpperCase()})`,
      description: "Prática com APIs de modelos generativos, grounding acadêmico e técnicas para pesquisas universitárias.",
      icon: Sparkles,
      tag: "Inteligência Artificial",
      level: "Iniciante a Intermediário",
      iconBg: "bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309]",
    },
    {
      id: "track-web-cloud",
      title: "Desenvolvimento Web Fullstack & Cloud",
      description: "Construção de APIs modernas com Bun, TypeScript e implantação segura em servidores Linux.",
      icon: Terminal,
      tag: "Engenharia de Software",
      level: "Intermediário",
      iconBg: "bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4]",
    },
    {
      id: "track-prompt-eng",
      title: "Oficina Avançada de Engenharia de Prompts",
      description: "Laboratório prático de Chain-of-Thought, personas acadêmicas e validação cruzada anti-alucinação.",
      icon: Cpu,
      tag: "Engenharia de Prompts",
      level: "Avançado",
      iconBg: "bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853]",
    },
  ];

  const totalPages = Math.ceil(workshops.length / WORKSHOPS_PER_PAGE) || 1;
  const paginatedWorkshops = workshops.slice(
    (currentPage - 1) * WORKSHOPS_PER_PAGE,
    currentPage * WORKSHOPS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
          Trilhas Práticas &amp; Study Jams
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Workshops Universitários</h2>
        <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5 max-w-2xl leading-relaxed">
          Oficinas práticas ministradas por embaixadores e convidados da comunidade acadêmica da {campus.name}.
        </p>
      </div>

      {/* Standard Community Tracks */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
          Trilhas em Destaque no Campus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {standardTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs ${track.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {track.level}
                    </span>
                  </div>
                  <span className="text-2xs font-mono font-black uppercase text-[#4285F4]">
                    {track.tag}
                  </span>
                  <h4 className="text-base font-black text-[#1e293b] mt-1 mb-2">
                    {track.title}
                  </h4>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-slate-100">
                  <a
                    href="/students"
                    className="inline-flex items-center gap-1 text-xs font-black text-[#4285F4] hover:underline"
                  >
                    <span>Ver material do curso</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Campus Workshops Grid with Pagination */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
            Oficinas Agendadas no Campus ({workshops.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">Carregando workshops...</div>
        ) : workshops.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-2 shadow-hard-black">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-black text-[#1e293b]">Nenhum workshop agendado no momento</div>
            <p className="text-2xs text-[#475569] max-w-sm mx-auto">
              Novas sessões práticas são publicadas pelos embaixadores ao longo do semestre.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedWorkshops.map((w) => (
                <div
                  key={w.id}
                  className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FFF8E1] text-[#B45309] border border-[#FBBC04] text-2xs font-mono font-black uppercase">
                        Hands-on
                      </span>
                      <span className="text-2xs font-bold text-slate-500">
                        {safeFormatDate(w.startsAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#1e293b] line-clamp-1">{w.title}</h4>
                    <p className="text-2xs text-[#475569] line-clamp-2">{w.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-2xs">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {w.participantCount} inscritos
                    </span>
                    <a
                      href={`/events/${w.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black border border-[#1e293b] shadow-2xs transition-all"
                    >
                      Participar →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginator */}
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
      </div>
    </div>
  );
}
