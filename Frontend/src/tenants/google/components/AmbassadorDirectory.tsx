import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CircleUserRound, GraduationCap, Heart, LoaderCircle, MapPin, Search, SlidersHorizontal, UsersRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, getAvatarUrl, type AmbassadorDirectoryItem } from '../../../services/auth';
import Footer from './Footer';
import Navbar from './Navbar';

const brazilianStateLabels: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

const AmbassadorDirectory = () => {
  const { user } = useAuth();
  const [ambassadors, setAmbassadors] = useState<AmbassadorDirectoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [likingId, setLikingId] = useState('');

  useEffect(() => {
    let active = true;
    authApi.listAmbassadors()
      .then(({ ambassadors: items }) => active && setAmbassadors(items))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os embaixadores.'))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, []);

  const universities = useMemo(() => [...new Set(ambassadors.map((ambassador) => ambassador.universityName).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [ambassadors]);
  const states = useMemo(() => [...new Set(ambassadors.map((ambassador) => ambassador.state).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [ambassadors]);
  const filteredAmbassadors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const normalizedCity = cityFilter.trim().toLocaleLowerCase('pt-BR');
    return ambassadors.filter((ambassador) => {
      const searchable = [ambassador.name, ambassador.nickname, ambassador.universityName, ambassador.city, ambassador.state]
        .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (!stateFilter || ambassador.state === stateFilter)
        && (!universityFilter || ambassador.universityName === universityFilter)
        && (!normalizedCity || ambassador.city.toLocaleLowerCase('pt-BR').includes(normalizedCity));
    });
  }, [ambassadors, cityFilter, query, stateFilter, universityFilter]);

  const toggleLike = async (ambassadorId: string) => {
    if (!user) {
      setError('Entre na sua conta para curtir um embaixador.');
      return;
    }
    setLikingId(ambassadorId);
    setError('');
    try {
      const result = await authApi.toggleAmbassadorLike(ambassadorId);
      setAmbassadors((items) => items.map((item) => item.id === ambassadorId ? { ...item, ...result } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível registrar a curtida.');
    } finally {
      setLikingId('');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setStateFilter('');
    setUniversityFilter('');
    setCityFilter('');
  };

  return <div className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
    <Navbar />
    <main className="mx-auto w-full max-w-[1720px] px-4 pb-16 pt-28 sm:px-8 sm:pt-32 xl:px-12 2xl:px-16">
      <section className="overflow-hidden rounded-[2rem] border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid h-2.5 grid-cols-4"><div className="bg-[#4285F4]" /><div className="bg-[#EA4335]" /><div className="bg-[#FBBC04]" /><div className="bg-[#34A853]" /></div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end xl:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF8E7] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#9A6700]"><UsersRound size={15} /> Comunidade 2026</span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Conheça os Embaixadores Estudantis 2026</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">Encontre pessoas da sua cidade, universidade ou estado. Visite perfis, descubra iniciativas e fortaleça a sua rede local.</p>
          </div>
          <div className="rounded-2xl border-2 border-[#1e293b] bg-[#1e293b] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-wider text-[#FBBC04]">Rede em movimento</p>
            <p className="mt-2 text-3xl font-black">{ambassadors.length}</p>
            <p className="text-sm font-bold text-slate-300">embaixadores no Hub</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border-3 border-[#1e293b] bg-white p-4 shadow-hard-black sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="block flex-1"><span className="mb-2 flex items-center gap-2 text-sm font-black"><Search size={16} className="text-[#4285F4]" /> Buscar embaixador</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, cidade ou universidade" className="input-auth" /></label>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[650px]">
            <label className="block"><span className="mb-2 block text-sm font-black">Estado (UF)</span><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="input-auth"><option value="">Todos</option>{states.map((state) => <option key={state} value={state}>{state} — {brazilianStateLabels[state] ?? state}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm font-black">Universidade</span><select value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)} className="input-auth"><option value="">Todas</option>{universities.map((university) => <option key={university} value={university}>{university}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm font-black">Cidade</span><input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} placeholder="Digite uma cidade" className="input-auth" /></label>
          </div>
          <button type="button" onClick={clearFilters} className="button-secondary shrink-0"><SlidersHorizontal size={17} /> Limpar</button>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black sm:text-2xl">{isLoading ? 'Carregando a rede...' : `${filteredAmbassadors.length} embaixador${filteredAmbassadors.length === 1 ? '' : 'es'} encontrado${filteredAmbassadors.length === 1 ? '' : 's'}`}</h2>
        {!isLoading && <p className="text-sm font-bold text-slate-500">Clique em um card para conhecer o perfil.</p>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-[#EA4335] bg-[#FDECEA] px-4 py-3 text-sm font-bold text-[#A61B16]">{error}</p>}

      {isLoading ? <div className="grid min-h-72 place-items-center"><div className="flex items-center gap-3 rounded-2xl border-3 border-[#1e293b] bg-white px-5 py-4 font-black shadow-hard-black"><LoaderCircle className="animate-spin text-[#4285F4]" />Carregando embaixadores…</div></div> : filteredAmbassadors.length ? <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filteredAmbassadors.map((ambassador) => <AmbassadorCard ambassador={ambassador} liking={likingId === ambassador.id} onLike={toggleLike} key={ambassador.id} />)}</section> : <section className="mt-5 rounded-3xl border-3 border-dashed border-slate-300 bg-white p-10 text-center"><UsersRound className="mx-auto text-[#4285F4]" size={34} /><h2 className="mt-4 text-xl font-black">Nenhum embaixador encontrado</h2><p className="mt-2 text-sm font-medium text-slate-600">Tente outro estado, universidade ou cidade.</p><button type="button" onClick={clearFilters} className="button-primary mt-5">Ver toda a rede</button></section>}
    </main>
    <Footer />
  </div>;
};

const AmbassadorCard = ({ ambassador, liking, onLike }: { ambassador: AmbassadorDirectoryItem; liking: boolean; onLike: (id: string) => void }) => {
  const name = ambassador.nickname ?? ambassador.name;
  const avatarUrl = getAvatarUrl(ambassador.avatarPath);
  return <article className="group relative overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black transition-transform duration-200 hover:-translate-y-1">
    <div className="h-2.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]" />
    <a href={`/u/${ambassador.id}`} className="block p-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4285F4]/30 sm:p-6">
      <div className="flex items-start gap-4">
        <span className={`avatar-frame avatar-frame-${ambassador.avatarFrame} h-16 w-16 shrink-0`}><span className="avatar-inner">{avatarUrl ? <img src={avatarUrl} alt="" /> : <CircleUserRound size={32} />}</span></span>
        <div className="min-w-0"><span className="inline-flex rounded-full bg-[#FFF8E7] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#9A6700]">Embaixador 2026</span><h3 className="mt-2 truncate text-lg font-black">{name}</h3><p className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold text-slate-600"><GraduationCap size={15} className="shrink-0 text-[#4285F4]" />{ambassador.universityName}</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-600"><span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5"><MapPin size={14} className="text-[#EA4335]" />{ambassador.city || 'Cidade não informada'}{ambassador.state ? ` · ${ambassador.state}` : ''}</span></div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-600">{ambassador.bio || 'Conheça o perfil deste embaixador e suas iniciativas na comunidade.'}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#4285F4]">Visitar perfil <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
    </a>
    <div className="border-t-2 border-slate-100 px-5 py-3 sm:px-6"><button type="button" disabled={liking} onClick={() => onLike(ambassador.id)} aria-pressed={ambassador.likedByMe} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border-2 px-3 text-sm font-black transition-colors disabled:cursor-wait ${ambassador.likedByMe ? 'border-[#EA4335] bg-[#FDECEA] text-[#A61B16]' : 'border-slate-200 text-slate-600 hover:border-[#EA4335] hover:text-[#EA4335]'}`}><Heart size={17} fill={ambassador.likedByMe ? 'currentColor' : 'none'} />{ambassador.likes} {ambassador.likes === 1 ? 'curtida' : 'curtidas'}</button></div>
  </article>;
};

export default AmbassadorDirectory;
