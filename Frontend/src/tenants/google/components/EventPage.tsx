import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, CalendarDays, Check, CircleUserRound, Clock3, GraduationCap,
  Image as ImageIcon, LoaderCircle, MapPin, MessageSquareText, Newspaper,
  Share2, UsersRound,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, getAvatarUrl, type EventDetails, type EventParticipant } from '../../../services/auth';
import { EventTags } from './EventTags';
import { EventLocationPicker } from './EventMap';
import Footer from './Footer';
import Navbar from './Navbar';
import { updateSeo } from '../../../seo';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
type EventTab = 'about' | 'updates' | 'people';

const EventPage = ({ eventId }: { eventId: string }) => {
  const { user, isLoading: isSessionLoading } = useAuth();
  const [data, setData] = useState<EventDetails | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<EventTab>('about');

  const load = async () => {
    setIsLoading(true);
    try {
      setData(await authApi.getEvent(eventId));
      setImageIndex(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Evento não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, [eventId]);
  useEffect(() => {
    if (!data) return;
    const { event } = data;
    updateSeo({ title: `${event.title} | Eventos GSA Hub`, description: event.description.slice(0, 160), canonical: `${window.location.origin}/events/${event.id}`, image: event.imageUrls[0], type: 'article', jsonLd: { '@context': 'https://schema.org', '@type': 'Event', name: event.title, description: event.description, startDate: event.startsAt, endDate: event.endsAt, eventStatus: 'https://schema.org/EventScheduled', location: event.coordinates ? { '@type': 'Place', name: event.location, address: { '@type': 'PostalAddress', addressLocality: event.city, addressRegion: event.state, addressCountry: 'BR' }, geo: { '@type': 'GeoCoordinates', latitude: event.coordinates.lat, longitude: event.coordinates.lng } } : { '@type': 'VirtualLocation', url: window.location.href }, url: window.location.href } });
  }, [data]);

  const toggleParticipation = async () => {
    if (!data || !user) return;
    setIsUpdating(true);
    setError('');
    try {
      await authApi.setEventParticipation(data.event.id, !data.event.isParticipating);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar sua participação.');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Não foi possível copiar o link.');
    }
  };

  if (isLoading || isSessionLoading) return <Loading />;
  if (!data) return <NotFound message={error || 'Esse evento não está mais disponível.'} />;

  const { event, organizer, organizers, participants, ambassadorParticipants, news } = data;
  const isFull = event.availableSpots === 0 && !event.isParticipating;
  const coverImage = event.imageUrls[imageIndex];
  const capacityLabel = event.capacity ? `${event.availableSpots ?? 0} de ${event.capacity} vagas disponíveis` : 'Vagas sem limite definido';

  return <div className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
    <Navbar />
    <main className="mx-auto w-full max-w-[1720px] px-4 pb-16 pt-28 sm:px-8 sm:pt-32 xl:px-12 2xl:px-16">
      <a href="/events" className="inline-flex items-center gap-2 text-sm font-black hover:text-[#4285F4]"><ArrowLeft size={17} />Voltar aos eventos</a>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-[#EA4335] bg-[#FDECEA] px-4 py-3 text-sm font-bold text-[#A61B16]">{error}</p>}

      <section className="mt-5 overflow-hidden rounded-[2rem] border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid min-h-[280px] lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="relative min-h-[280px] bg-[#1e293b]">
            {coverImage ? <img src={coverImage} alt={`Imagem do evento ${event.title}`} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 overflow-hidden bg-[#1e293b]"><div className="absolute -left-10 -top-14 h-56 w-56 rounded-full border-[22px] border-[#4285F4]/50" /><div className="absolute -bottom-16 right-6 h-52 w-52 rounded-full border-[22px] border-[#34A853]/45" /><div className="absolute right-10 top-10 h-20 w-20 rotate-12 rounded-2xl bg-[#FBBC04]" /><CalendarDays className="absolute left-10 top-1/2 -translate-y-1/2 text-white" size={72} /></div>}
            <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#1e293b]">EVENTO DA COMUNIDADE</span>
            {event.imageUrls.length > 1 && <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto rounded-xl bg-[#1e293b]/70 p-2 backdrop-blur-sm">{event.imageUrls.map((url, index) => <button key={url} type="button" onClick={() => setImageIndex(index)} aria-label={`Ver imagem ${index + 1}`} className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${imageIndex === index ? 'border-[#FBBC04]' : 'border-white/70'}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
          </div>
          <div className="flex flex-col justify-between p-6 sm:p-8"><div><span className="inline-flex items-center gap-2 rounded-full bg-[#EBF3FE] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#4285F4]"><CalendarDays size={15} />{dateFormatter.format(new Date(event.startsAt))}</span><EventTags tags={event.tags} className="mt-3" /><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{event.title}</h1><p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">{event.description}</p></div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => void copyLink()} className="button-secondary !min-h-10 !px-3"><Share2 size={16} />{copied ? 'Link copiado' : 'Compartilhar'}</button>{event.isOrganizer && <a href="/dashboard" className="button-secondary !min-h-10 !px-3 text-xs">Gerenciar no Dashboard</a>}</div></div>
        </div>
      </section>

      <nav aria-label="Conteúdo do evento" className="mx-auto mt-7 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-1.5 shadow-sm" role="tablist">
        <EventTabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={CalendarDays}>Sobre</EventTabButton>
        <EventTabButton active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} icon={Newspaper}>Atualizações{news.length ? <span className="ml-1 rounded-full bg-current/10 px-1.5 py-0.5 text-[10px]">{news.length}</span> : null}</EventTabButton>
        <EventTabButton active={activeTab === 'people'} onClick={() => setActiveTab('people')} icon={UsersRound}>Pessoas</EventTabButton>
      </nav>

      {activeTab === 'about' && <div className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><h2 className="text-2xl font-black">Sobre o evento</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">{event.description}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Info icon={CalendarDays} label="Data" value={dateFormatter.format(new Date(event.startsAt))} tone="blue" /><Info icon={Clock3} label="Horário" value={`${timeFormatter.format(new Date(event.startsAt))}${event.endsAt ? ` — ${timeFormatter.format(new Date(event.endsAt))}` : ''}`} tone="yellow" /><Info icon={MapPin} label="Local" value={event.location} tone="red" /><Info icon={UsersRound} label="Inscrições" value={capacityLabel} tone="green" /></div>{event.coordinates && <div className="mt-6"><h3 className="mb-3 text-lg font-black">Como chegar</h3><EventLocationPicker coordinates={event.coordinates} interactive={false} /></div>}</section>
        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start"><ParticipationCard event={event} capacityLabel={capacityLabel} isFull={isFull} isUpdating={isUpdating} user={user} onToggle={() => void toggleParticipation()} /><section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black"><span className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Organização</span>{organizer ? <a href={`/u/${organizer.id}`} className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F8FAFE] p-3 hover:bg-[#EBF3FE]"><Avatar participant={organizer} /><div className="min-w-0"><p className="truncate text-sm font-black">{organizer.nickname ?? organizer.name}</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-600"><GraduationCap size={14} className="text-[#4285F4]" />{organizer.universityName}</p></div></a> : <p className="mt-4 text-sm text-slate-600">Organização do GSA Brasil Hub.</p>}<p className="mt-4 rounded-xl bg-[#FFF8E7] p-3 text-xs font-medium leading-relaxed text-slate-700">Confira local e horário antes de sair. Se algo mudar, as informações desta página serão atualizadas.</p></section>{event.forumId && <section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black"><div className="flex items-center gap-2"><MessageSquareText className="text-[#4285F4]" size={19} /><div><h2 className="font-black">Fórum da organização</h2><p className="text-xs text-slate-600">Canal privado da equipe do evento.</p></div></div><a href={`/forums/${event.forumId}`} className="button-primary mt-4 w-full"><MessageSquareText size={16} />Abrir fórum privado</a></section>}{event.imageUrls.length > 0 && <section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black"><div className="flex items-center gap-2"><ImageIcon className="text-[#EA4335]" size={19} /><h2 className="font-black">Galeria</h2></div><div className="mt-4 grid grid-cols-3 gap-2">{event.imageUrls.map((url, index) => <button key={url} onClick={() => setImageIndex(index)} className="aspect-square overflow-hidden rounded-xl border-2 border-slate-200 hover:border-[#4285F4]"><img src={url} alt={`Imagem ${index + 1} do evento`} className="h-full w-full object-cover" /></button>)}</div></section>}</aside>
      </div>}

      {activeTab === 'updates' && <section className="mt-5 rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex items-end justify-between gap-3"><div><span className="text-xs font-black uppercase tracking-widest text-[#EA4335]">Atualizações</span><h2 className="mt-2 text-2xl font-black">Notícias do evento</h2><p className="mt-2 text-sm text-slate-600">Acompanhe os comunicados publicados pela organização.</p></div><Newspaper className="text-[#EA4335]" size={23} /></div>{news.length ? <div className="mt-6 space-y-3">{news.slice().reverse().map((item) => <article key={item.id} className="rounded-2xl border-2 border-slate-200 p-4 sm:p-5"><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.content}</p><p className="mt-3 text-xs font-bold text-slate-500">{item.author?.nickname ?? item.author?.name ?? 'Equipe de organização'} · {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</p></article>)}</div> : <Empty icon={Newspaper} text="Ainda não há notícias publicadas." />}</section>}

      {activeTab === 'people' && <div className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-7"><section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-xs font-black uppercase tracking-widest text-[#34A853]">Equipe do evento</span><h2 className="mt-2 text-2xl font-black">Embaixadores da organização</h2><p className="mt-1 text-sm text-slate-600">Pessoas convidadas para organizar essa experiência.</p></div><span className="rounded-full bg-[#EFFBF3] px-3 py-1 text-xs font-black text-[#18753A]">{ambassadorParticipants.length} embaixador{ambassadorParticipants.length === 1 ? '' : 'es'}</span></div>{ambassadorParticipants.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{ambassadorParticipants.map((participant) => <ParticipantCard key={participant.id} participant={participant} ambassador />)}</div> : <Empty icon={GraduationCap} text="A equipe organizadora aparecerá aqui." />}</section><section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Pessoas confirmadas</h2><p className="mt-1 text-sm text-slate-600">{event.participantCount} pessoa{event.participantCount === 1 ? '' : 's'} na lista de presença.</p></div><span className="rounded-full bg-[#EBF3FE] px-3 py-1 text-xs font-black text-[#4285F4]">Comunidade aberta</span></div>{participants.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{participants.map((participant) => <ParticipantCard key={participant.id} participant={participant} />)}</div> : <Empty icon={UsersRound} text="Seja a primeira pessoa a confirmar presença." />}</section></div><aside className="xl:sticky xl:top-28 xl:self-start"><ParticipationCard event={event} capacityLabel={capacityLabel} isFull={isFull} isUpdating={isUpdating} user={user} onToggle={() => void toggleParticipation()} /></aside></div>}
    </main>
    <Footer />
  </div>;
};

const EventTabButton = ({ active, children, icon: Icon, onClick }: { active: boolean; children: React.ReactNode; icon: React.ElementType; onClick: () => void }) => <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition-colors ${active ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-600 hover:bg-[#F1F5F9] hover:text-[#1e293b]'}`}><Icon size={16} />{children}</button>;

const ParticipationCard = ({ event, capacityLabel, isFull, isUpdating, user, onToggle }: { event: EventDetails['event']; capacityLabel: string; isFull: boolean; isUpdating: boolean; user: unknown; onToggle: () => void }) => <section className="rounded-3xl border-3 border-[#1e293b] bg-[#1e293b] p-6 text-white shadow-hard-black"><span className="text-xs font-black uppercase tracking-widest text-[#FBBC04]">Garanta sua vaga</span><p className="mt-3 text-3xl font-black">{event.participantCount} inscrito{event.participantCount === 1 ? '' : 's'}</p><p className="mt-1 text-sm font-medium text-slate-300">{capacityLabel}</p><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">{event.capacity && <div className="h-full bg-[#FBBC04] transition-all" style={{ width: `${Math.min(100, (event.participantCount / event.capacity) * 100)}%` }} />}</div>{!user ? <a href="/login" className="button-primary mt-6 w-full">Entrar para participar</a> : <button type="button" disabled={isUpdating || isFull} onClick={onToggle} className={`mt-6 w-full ${event.isParticipating ? 'button-secondary !border-[#34A853] !bg-[#EFFBF3] !text-[#18753A]' : 'button-primary'}`}>{isUpdating ? <><LoaderCircle className="animate-spin" size={17} />Atualizando…</> : event.isParticipating ? <><Check size={17} />Presença confirmada</> : isFull ? 'Evento lotado' : <><UsersRound size={17} />Participar do evento</>}</button>}<p className="mt-4 text-center text-xs font-medium text-slate-300">{event.isParticipating ? 'Não poderá comparecer? Você pode cancelar a presença.' : isFull ? 'As inscrições estão completas.' : 'Embaixadores e estudantes podem participar.'}</p></section>;

const Info = ({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'blue' | 'red' | 'yellow' | 'green' }) => <div className="flex gap-3 rounded-2xl border-2 border-slate-200 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone === 'blue' ? 'bg-[#EBF3FE] text-[#4285F4]' : tone === 'red' ? 'bg-[#FDECEA] text-[#EA4335]' : tone === 'yellow' ? 'bg-[#FFF8E7] text-[#9A6700]' : 'bg-[#EFFBF3] text-[#34A853]'}`}><Icon size={18} /></span><div><p className="text-xs font-black text-slate-500">{label}</p><p className="mt-1 text-sm font-bold leading-relaxed">{value}</p></div></div>;
const Avatar = ({ participant }: { participant: EventParticipant }) => <span className={`avatar-frame avatar-frame-${participant.avatarFrame} h-11 w-11 shrink-0`}><span className="avatar-inner">{getAvatarUrl(participant.avatarPath) ? <img src={getAvatarUrl(participant.avatarPath)} alt="" /> : <CircleUserRound size={23} />}</span></span>;
const ParticipantCard = ({ participant, ambassador = false }: { participant: EventParticipant; ambassador?: boolean }) => <a href={`/u/${participant.id}`} className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 p-3 transition-colors hover:border-[#4285F4] hover:bg-[#EBF3FE]"><Avatar participant={participant} /><div className="min-w-0"><p className="truncate text-sm font-black">{participant.nickname ?? participant.name}</p><p className="mt-1 truncate text-xs font-bold text-slate-600">{participant.universityName}</p>{ambassador && <span className="mt-1 inline-block rounded-full bg-[#FFF8E7] px-2 py-0.5 text-[10px] font-black text-[#9A6700]">EMBAIXADOR 2026</span>}</div></a>;
const Empty = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-sm font-medium text-slate-500"><Icon className="mx-auto text-[#4285F4]" size={24} /><p className="mt-2">{text}</p></div>;
const Loading = () => <main className="grid min-h-screen place-items-center bg-[#F8FAFE]"><div className="flex items-center gap-3 rounded-2xl border-3 border-[#1e293b] bg-white px-5 py-4 font-black shadow-hard-black"><LoaderCircle className="animate-spin text-[#4285F4]" />Carregando evento…</div></main>;
const NotFound = ({ message }: { message: string }) => <main className="grid min-h-screen place-items-center bg-[#F8FAFE] p-4"><section className="max-w-md rounded-3xl border-3 border-[#1e293b] bg-white p-7 text-center shadow-hard-black"><CalendarDays className="mx-auto text-[#4285F4]" size={34} /><h1 className="mt-4 text-2xl font-black">Evento indisponível</h1><p className="mt-2 text-sm text-slate-600">{message}</p><a href="/dashboard" className="button-primary mt-6">Ver eventos</a></section></main>;

export default EventPage;
