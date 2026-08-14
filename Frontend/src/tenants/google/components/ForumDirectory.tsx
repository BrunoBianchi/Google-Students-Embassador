import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CircleUserRound, GraduationCap, LoaderCircle, MapPin, MessageSquareText, Search, SlidersHorizontal, UsersRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, getAvatarUrl, type ForumDirectoryItem } from '../../../services/auth';
import Footer from './Footer';
import Navbar from './Navbar';

const ForumDirectory = () => {
  const { user } = useAuth();
  const [forums, setForums] = useState<ForumDirectoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState('');

  useEffect(() => {
    let active = true;
    authApi.discoverForums()
      .then(({ forums: items }) => active && setForums(items))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os fóruns.'))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, []);

  const universities = useMemo(() => [...new Set(forums.map((forum) => forum.organizer?.universityName).filter(Boolean) as string[])]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [forums]);
  const states = useMemo(() => [...new Set(forums.map((forum) => forum.organizer?.state).filter(Boolean) as string[])]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [forums]);
  const filteredForums = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const normalizedCity = cityFilter.trim().toLocaleLowerCase('pt-BR');
    return forums.filter((forum) => {
      const organizer = forum.organizer;
      const searchable = [forum.title, forum.description, organizer?.name, organizer?.nickname, organizer?.universityName, organizer?.state, organizer?.city]
        .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (!stateFilter || organizer?.state === stateFilter)
        && (!universityFilter || organizer?.universityName === universityFilter)
        && (!normalizedCity || (organizer?.city ?? '').toLocaleLowerCase('pt-BR').includes(normalizedCity));
    });
  }, [cityFilter, forums, query, stateFilter, universityFilter]);

  const clearFilters = () => {
    setQuery('');
    setStateFilter('');
    setUniversityFilter('');
    setCityFilter('');
  };
  const openForum = async (forum: ForumDirectoryItem) => {
    if (!user) { window.location.assign('/login'); return; }
    setJoiningId(forum.id);
    setError('');
    try {
      if (!forum.isParticipating) await authApi.setForumParticipation(forum.id, true);
      window.location.assign(`/forums/${forum.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível entrar neste fórum.');
      setJoiningId('');
    }
  };

  return <div className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
    <Navbar />
    <main className="mx-auto w-full max-w-[1720px] px-4 pb-16 pt-28 sm:px-8 sm:pt-32 xl:px-12 2xl:px-16">
      <section className="overflow-hidden rounded-[2rem] border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid h-2.5 grid-cols-4"><div className="bg-[#4285F4]" /><div className="bg-[#EA4335]" /><div className="bg-[#FBBC04]" /><div className="bg-[#34A853]" /></div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end xl:p-10"><div><span className="inline-flex items-center gap-2 rounded-full bg-[#EFFBF3] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#18753A]"><MessageSquareText size={15} /> Conversas da comunidade</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Encontre fóruns para participar</h1><p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">Descubra discussões do seu campus, cidade ou região. Entre no espaço que fizer sentido para você e acompanhe as respostas no seu ritmo.</p></div><div className="rounded-2xl border-2 border-[#1e293b] bg-[#1e293b] p-5 text-white"><p className="text-xs font-black uppercase tracking-wider text-[#34A853]">Espaços ativos</p><p className="mt-2 text-3xl font-black">{forums.length}</p><p className="text-sm font-bold text-slate-300">fóruns no Hub</p></div></div>
      </section>

      <section className="mt-6 rounded-3xl border-3 border-[#1e293b] bg-white p-4 shadow-hard-black sm:p-6"><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(160px,0.65fr))_auto] xl:items-end"><label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black"><Search size={16} className="text-[#4285F4]" /> Buscar fórum</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tema, pessoa ou universidade" className="input-auth" /></label><label className="block"><span className="mb-2 block text-sm font-black">UF</span><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="input-auth"><option value="">Todas</option>{states.map((state) => <option value={state} key={state}>{state}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-black">Universidade</span><select value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)} className="input-auth"><option value="">Todas</option>{universities.map((university) => <option value={university} key={university}>{university}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-black">Cidade</span><input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} placeholder="Digite uma cidade" className="input-auth" /></label><button type="button" onClick={clearFilters} className="button-secondary shrink-0"><SlidersHorizontal size={17} /> Limpar</button></div></section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black sm:text-2xl">{isLoading ? 'Carregando conversas...' : `${filteredForums.length} fórum${filteredForums.length === 1 ? '' : 's'} encontrado${filteredForums.length === 1 ? '' : 's'}`}</h2><p className="text-sm font-bold text-slate-500">Entre para acompanhar as mensagens.</p></div>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-[#EA4335] bg-[#FDECEA] px-4 py-3 text-sm font-bold text-[#A61B16]">{error}</p>}
      {isLoading ? <Loading /> : filteredForums.length ? <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filteredForums.map((forum) => <ForumCard forum={forum} joining={joiningId === forum.id} onOpen={openForum} key={forum.id} />)}</section> : <Empty onClear={clearFilters} />}
    </main>
    <Footer />
  </div>;
};

const ForumCard = ({ forum, joining, onOpen }: { forum: ForumDirectoryItem; joining: boolean; onOpen: (forum: ForumDirectoryItem) => void }) => {
  const organizer = forum.organizer;
  const avatarUrl = getAvatarUrl(organizer?.avatarPath);
  return <article className="flex min-h-[285px] flex-col overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black"><div className="h-2.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]" /><div className="flex flex-1 flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EBF3FE] text-[#4285F4]"><MessageSquareText size={22} /></span><span className="inline-flex items-center gap-1 rounded-full bg-[#EFFBF3] px-2.5 py-1 text-[11px] font-black text-[#18753A]"><UsersRound size={13} /> {forum.memberCount}</span></div><h3 className="mt-5 text-xl font-black leading-snug">{forum.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{forum.description}</p>{organizer && <a href={`/u/${organizer.id}`} className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F8FAFE] p-3 transition-colors hover:bg-[#EBF3FE]"><span className={`avatar-frame avatar-frame-${organizer.avatarFrame} h-9 w-9 shrink-0`}><span className="avatar-inner">{avatarUrl ? <img src={avatarUrl} alt="" /> : <CircleUserRound size={20} />}</span></span><span className="min-w-0"><span className="block truncate text-xs font-black">{organizer.nickname ?? organizer.name}</span><span className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-slate-500"><GraduationCap size={13} className="shrink-0 text-[#4285F4]" />{organizer.universityName}</span>{organizer.city && <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-slate-500"><MapPin size={13} className="shrink-0 text-[#EA4335]" />{organizer.city}{organizer.state ? `, ${organizer.state}` : ''}</span>}</span></a>}<button type="button" disabled={joining} onClick={() => void onOpen(forum)} className="button-primary mt-5 w-full">{joining ? <><LoaderCircle className="animate-spin" size={17} /> Entrando…</> : <>{forum.isParticipating ? 'Abrir discussão' : 'Participar do fórum'} <ArrowRight size={17} /></>}</button></div></article>;
};

const Loading = () => <div className="grid min-h-72 place-items-center"><div className="flex items-center gap-3 rounded-2xl border-3 border-[#1e293b] bg-white px-5 py-4 font-black shadow-hard-black"><LoaderCircle className="animate-spin text-[#4285F4]" />Carregando fóruns…</div></div>;
const Empty = ({ onClear }: { onClear: () => void }) => <section className="mt-5 rounded-3xl border-3 border-dashed border-slate-300 bg-white p-10 text-center"><MessageSquareText className="mx-auto text-[#4285F4]" size={34} /><h2 className="mt-4 text-xl font-black">Nenhum fórum encontrado</h2><p className="mt-2 text-sm font-medium text-slate-600">Tente outro campus, cidade ou estado.</p><button type="button" onClick={onClear} className="button-primary mt-5">Limpar filtros</button></section>;

export default ForumDirectory;
