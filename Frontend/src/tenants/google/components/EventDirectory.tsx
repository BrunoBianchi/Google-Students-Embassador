import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, GraduationCap, LoaderCircle, MapPin, Search, SlidersHorizontal, UsersRound } from 'lucide-react';
import { authApi, type EventDirectoryItem } from '../../../services/auth';
import Footer from './Footer';
import Navbar from './Navbar';
import { EventLocationsMap } from './EventMap';
import { EventTags } from './EventTags';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

const EventDirectory = () => {
  const [events, setEvents] = useState<EventDirectoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.discoverEvents()
      .then(({ events: items }) => active && setEvents(items))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os eventos.'))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, []);

  const universities = useMemo(() => [...new Set(events.map((event) => event.organizer?.universityName).filter(Boolean) as string[])]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [events]);
  const states = useMemo(() => [...new Set(events.map((event) => event.state || event.organizer?.state).filter(Boolean) as string[])]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [events]);
  const tags = useMemo(() => [...new Set(events.flatMap((event) => event.tags))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR')), [events]);
  const baseFilteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const normalizedCity = cityFilter.trim().toLocaleLowerCase('pt-BR');
    return events.filter((event) => {
      const searchable = [event.title, event.description, event.location, event.city, event.state, event.organizer?.name, event.organizer?.nickname, event.organizer?.universityName]
        .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      const eventState = event.state || event.organizer?.state || '';
      const eventCity = event.city || event.organizer?.city || '';
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (!stateFilter || eventState === stateFilter)
        && (!universityFilter || event.organizer?.universityName === universityFilter)
        && (!normalizedCity || eventCity.toLocaleLowerCase('pt-BR').includes(normalizedCity))
        && (!tagFilter || event.tags.includes(tagFilter));
    });
  }, [cityFilter, events, query, stateFilter, tagFilter, universityFilter]);
  const visibleEvents = selectedId ? baseFilteredEvents.filter((event) => event.id === selectedId) : baseFilteredEvents;

  const clearFilters = () => {
    setQuery('');
    setStateFilter('');
    setUniversityFilter('');
    setCityFilter('');
    setTagFilter('');
    setSelectedId('');
  };

  return <div className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
    <Navbar />
    <main className="mx-auto w-full max-w-[1720px] px-4 pb-16 pt-28 sm:px-8 sm:pt-32 xl:px-12 2xl:px-16">
      <section className="overflow-hidden rounded-[2rem] border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid h-2.5 grid-cols-4"><div className="bg-[#4285F4]" /><div className="bg-[#EA4335]" /><div className="bg-[#FBBC04]" /><div className="bg-[#34A853]" /></div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end xl:p-10">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-[#FDECEA] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#A61B16]"><CalendarDays size={15} /> Agenda da comunidade</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Encontre eventos perto de você</h1><p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">Filtre por tema, campus, cidade ou UF. Nos eventos presenciais, o mapa indica o local exato marcado pela organização.</p></div>
          <div className="rounded-2xl border-2 border-[#1e293b] bg-[#1e293b] p-5 text-white"><p className="text-xs font-black uppercase tracking-wider text-[#FBBC04]">Próximas experiências</p><p className="mt-2 text-3xl font-black">{events.length}</p><p className="text-sm font-bold text-slate-300">eventos publicados</p></div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border-3 border-[#1e293b] bg-white p-4 shadow-hard-black sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_repeat(4,minmax(135px,0.55fr))_auto] xl:items-end">
          <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black"><Search size={16} className="text-[#4285F4]" /> Buscar evento</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, local ou organização" className="input-auth" /></label>
          <label className="block"><span className="mb-2 block text-sm font-black">UF</span><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="input-auth"><option value="">Todas</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-black">Universidade</span><select value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)} className="input-auth"><option value="">Todas</option>{universities.map((university) => <option key={university} value={university}>{university}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-black">Cidade</span><input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} placeholder="Digite uma cidade" className="input-auth" /></label>
          <label className="block"><span className="mb-2 block text-sm font-black">Tema</span><select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} className="input-auth"><option value="">Todos</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
          <button type="button" onClick={clearFilters} className="button-secondary shrink-0"><SlidersHorizontal size={17} /> Limpar</button>
        </div>
      </section>

      {error && <p role="alert" className="mt-5 rounded-xl border-2 border-[#EA4335] bg-[#FDECEA] px-4 py-3 text-sm font-bold text-[#A61B16]">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black sm:text-2xl">{isLoading ? 'Carregando agenda...' : `${visibleEvents.length} evento${visibleEvents.length === 1 ? '' : 's'} encontrado${visibleEvents.length === 1 ? '' : 's'}`}</h2><p className="mt-1 text-sm font-medium text-slate-500">{selectedId ? 'Você está vendo o evento escolhido no mapa.' : 'Use os filtros ou clique em um pin para refinar a lista.'}</p></div>{selectedId && <button type="button" className="button-secondary !min-h-10 !px-3" onClick={() => setSelectedId('')}>Ver todos no mapa</button>}</div>

      {isLoading ? <Loading /> : baseFilteredEvents.length ? <section className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.75fr)] xl:items-start"><EventLocationsMap events={baseFilteredEvents} selectedId={selectedId} onSelect={setSelectedId} /><div className="max-h-[458px] space-y-3 overflow-y-auto pr-1 xl:pr-2">{visibleEvents.map((event) => <EventListItem event={event} key={event.id} selected={event.id === selectedId} />)}{!visibleEvents.length && <Empty onClear={() => setSelectedId('')} />}</div></section> : <Empty onClear={clearFilters} />}
    </main>
    <Footer />
  </div>;
};

const EventListItem = ({ event, selected }: { event: EventDirectoryItem; selected: boolean }) => {
  const safeDateStr = (() => {
    try {
      const d = new Date(event.startsAt);
      return isNaN(d.getTime()) ? 'Data a confirmar' : dateFormatter.format(d);
    } catch {
      return 'Data a confirmar';
    }
  })();
  return <a href={`/events/${event.id}`} className={`block rounded-3xl border-3 bg-white p-5 shadow-hard-black transition-transform hover:-translate-y-0.5 ${selected ? 'border-[#EA4335]' : 'border-[#1e293b]'}`}><div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-[#EBF3FE] px-2.5 py-1 text-[11px] font-black text-[#4285F4]"><CalendarDays size={14} />{safeDateStr}</span>{event.capacity ? <span className="text-xs font-bold text-slate-500">{event.participantCount}/{event.capacity}</span> : <span className="text-xs font-bold text-slate-500">{event.participantCount} inscritos</span>}</div><h3 className="mt-3 text-lg font-black leading-snug">{event.title}</h3><EventTags tags={event.tags} className="mt-3" /><p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600"><MapPin className="mt-0.5 shrink-0 text-[#EA4335]" size={16} /><span>{event.location}{event.city ? ` · ${event.city}${event.state ? `, ${event.state}` : ''}` : ''}</span></p>{event.organizer && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500"><GraduationCap size={15} className="text-[#4285F4]" />{event.organizer.universityName}</p>}<span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#4285F4]">Ver detalhes <ArrowRight size={16} /></span></a>;
};

const Loading = () => <div className="grid min-h-72 place-items-center"><div className="flex items-center gap-3 rounded-2xl border-3 border-[#1e293b] bg-white px-5 py-4 font-black shadow-hard-black"><LoaderCircle className="animate-spin text-[#4285F4]" />Carregando eventos…</div></div>;
const Empty = ({ onClear }: { onClear: () => void }) => <section className="mt-5 rounded-3xl border-3 border-dashed border-slate-300 bg-white p-10 text-center"><UsersRound className="mx-auto text-[#4285F4]" size={34} /><h2 className="mt-4 text-xl font-black">Nenhum evento encontrado</h2><p className="mt-2 text-sm font-medium text-slate-600">Tente ajustar os filtros para ampliar a busca.</p><button type="button" onClick={onClear} className="button-primary mt-5">Limpar filtros</button></section>;

export default EventDirectory;
