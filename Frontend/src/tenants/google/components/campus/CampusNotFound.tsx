import React, { useState, useEffect } from "react";
import { authApi, type Campus } from "../../../../services/auth";
import { Search, MapPin, Building2, ArrowRight, Home } from "lucide-react";
import Logo from "../Logo";

export default function CampusNotFound({ slug }: { slug: string }) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.listCampuses()
      .then((res) => setCampuses(res.campuses))
      .catch(() => setCampuses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campuses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
    (c.state && c.state.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Logo size="sm" />
        </a>
        <a
          href="/campuses"
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Ver todos os campuses
        </a>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 shadow-xl shadow-red-500/5">
          <Building2 className="w-10 h-10" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
          404 · Campus não encontrado
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Nenhum campus encontrado para <span className="text-indigo-400 font-mono">“{slug}”</span>
        </h1>

        <p className="text-slate-400 max-w-lg mb-8 text-sm sm:text-base leading-relaxed">
          O identificador informado não corresponde a nenhum espaço universitário ativo na plataforma.
          Busque a sua universidade abaixo ou explore os campuses cadastrados.
        </p>

        {/* Search Input */}
        <div className="w-full max-w-md relative mb-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por universidade, cidade ou sigla..."
            className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        {/* List of Active Campuses */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Campuses Universitários Disponíveis ({filtered.length})
            </h2>
            <a href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Início
            </a>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Carregando lista de universidades...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-slate-400 text-sm">
              Nenhuma universidade encontrada para “{search}”.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.slice(0, 6).map((c) => (
                <a
                  key={c.id}
                  href={`/${c.slug}`}
                  className="group p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {c.slug}
                      </span>
                      {c.city && c.state && (
                        <span className="text-2xs text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3" />
                          {c.city}, {c.state}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {c.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-2xs text-slate-400 px-4">
        Campus Ambassador Hub · Plataforma Universitária Multi-Campus Independente
      </footer>
    </div>
  );
}
