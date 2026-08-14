import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  ExternalLink,
  Eye,
  Flag,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  Link2,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  UsersRound,
  UserRoundMinus,
  VolumeX,
  X,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  authApi,
  getAvatarUrl,
  type AvatarFrame,
  type AmbassadorDirectoryItem,
  type CommunityEvent,
  type CommunityForum,
  type CommunityGroup,
  type DashboardData,
  type EventParticipant,
  type ForumMember,
  type ForumMessage,
  type GroupInvitee,
  type ProfileInput,
} from "../../../services/auth";
import BadgeShelf from "./BadgeShelf";
import { EventTags, eventTagOptions } from "./EventTags";
import { EventLocationPicker } from "./EventMap";
import Navbar from "./Navbar";
import Footer from "./Footer";

type Section = "overview" | "events" | "forums" | "groups" | "profile";
type Modal = "event" | "forum" | "group" | "profile" | null;
type ForumFilter = "all" | "owned" | "participating";
type EditableResource = { kind: "event" | "forum" | "group"; item: CommunityEvent | CommunityForum | CommunityGroup };
type Profile = DashboardData["profile"];
const eventStateOptions = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const Dashboard: React.FC = () => {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [forums, setForums] = useState<CommunityForum[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [groupInvitations, setGroupInvitations] = useState<CommunityGroup[]>([]);
  const [forumFilter, setForumFilter] = useState<ForumFilter>("all");
  const [section, setSection] = useState<Section>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [editing, setEditing] = useState<EditableResource | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const ambassador = user?.userType === "ambassador";
  const filteredForums = useMemo(
    () => forums.filter((forum) => {
      if (forumFilter === "owned") return forum.isOwner;
      if (forumFilter === "participating") return !forum.isOwner && forum.isParticipating;
      return true;
    }),
    [forumFilter, forums],
  );
  const load = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [dashboard, eventResult, forumResult, groupResult, invitationResult] =
        await Promise.all([
          authApi.getDashboard(),
          authApi.listEvents(),
          authApi.listForums(),
          ambassador ? authApi.listGroups() : Promise.resolve({ groups: [] }),
          ambassador ? authApi.listGroupInvitations() : Promise.resolve({ groups: [] }),
        ]);
      setData(dashboard);
      setEvents(eventResult.events);
      setForums(forumResult.forums);
      setGroups(groupResult.groups);
      setGroupInvitations(invitationResult.groups);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard.",
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) window.location.assign("/login");
  }, [isLoading, user]);
  useEffect(() => {
    void load();
  }, [user?.id]);

  const participate = async (
    kind: "event" | "forum" | "group",
    id: string,
    joined: boolean,
  ) => {
    setBusy(`${kind}-${id}`);
    setNotice("");
    try {
      if (kind === "event") await authApi.setEventParticipation(id, !joined);
      if (kind === "forum") await authApi.setForumParticipation(id, !joined);
      if (kind === "group") await authApi.setGroupParticipation(id, !joined);
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar sua participação.",
      );
    } finally {
      setBusy("");
    }
  };

  const deleteOwnedForum = async (forum: CommunityForum) => {
    const confirmed = window.confirm(
      `Excluir “${forum.title}”? Esta ação apagará permanentemente todas as mensagens e removerá todos os participantes.`,
    );
    if (!confirmed) return;
    setBusy(`forum-delete-${forum.id}`);
    setNotice("");
    try {
      await authApi.deleteForum(forum.id);
      setForums((items) => items.filter((item) => item.id !== forum.id));
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o fórum.",
      );
    } finally {
      setBusy("");
    }
  };

  const deleteOwnedEvent = async (event: CommunityEvent) => {
    if (!window.confirm(`Excluir “${event.title}”? Esta ação apagará permanentemente o evento, suas inscrições, notícias e o fórum privado vinculado.`)) return;
    setBusy(`event-delete-${event.id}`); setNotice("");
    try { await authApi.deleteEvent(event.id); setEvents((items) => items.filter((item) => item.id !== event.id)); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível excluir o evento."); }
    finally { setBusy(""); }
  };

  const deleteOwnedGroup = async (group: CommunityGroup) => {
    if (!window.confirm(`Excluir “${group.name}”? Esta ação removerá permanentemente o grupo e seus convites pendentes.`)) return;
    setBusy(`group-delete-${group.id}`); setNotice("");
    try { await authApi.deleteGroup(group.id); setGroups((items) => items.filter((item) => item.id !== group.id)); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível excluir o grupo."); }
    finally { setBusy(""); }
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    try {
      if (modal === "event") {
        const capacity = text(form, "capacity").trim();
        const imageUrls = text(form, "imageUrls").split(/[\n,]/).map((url) => url.trim()).filter(Boolean);
        const latitude = text(form, "coordinatesLat").trim();
        const longitude = text(form, "coordinatesLng").trim();
        await authApi.createEvent({
          title: String(form.get("title")),
          description: String(form.get("description")),
          startsAt: String(form.get("startsAt")),
          endsAt: text(form, "endsAt").trim() || undefined,
          location: String(form.get("location")),
          city: text(form, "city").trim() || undefined,
          state: text(form, "state").trim() || undefined,
          coordinates: latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : undefined,
          capacity: capacity ? Number(capacity) : undefined,
          imageUrls,
          tags: form.getAll("tags").map(String),
          organizerIds: form.getAll("organizerIds").map(String),
          groupId: text(form, "groupId").trim() || undefined,
          createForum: form.get("createForum") === "on",
        });
      }
      if (modal === "forum")
        await authApi.createForum({
          title: String(form.get("title")),
          description: String(form.get("description")),
        });
      if (modal === "group")
        await authApi.createGroup({
          name: String(form.get("name")),
          description: String(form.get("description")),
        });
      setModal(null);
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar agora.",
      );
    }
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    try {
      await updateProfile({
        nickname: text(form, "nickname"),
        bio: text(form, "bio"),
        githubUrl: text(form, "githubUrl"),
        linkedinUrl: text(form, "linkedinUrl"),
        instagramUrl: text(form, "instagramUrl"),
        phone: text(form, "phone"),
        avatarFrame: text(form, "avatarFrame") as AvatarFrame,
      });
      setModal(null);
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seu perfil.",
      );
    }
  };
  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setBusy(`edit-${editing.item.id}`);
    setNotice("");
    try {
      if (editing.kind === "event") {
        const capacity = text(form, "capacity").trim();
        const imageUrls = text(form, "imageUrls").split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
        await authApi.updateEvent(editing.item.id, {
          title: text(form, "title"), description: text(form, "description"), location: text(form, "location"),
          startsAt: text(form, "startsAt") || undefined, endsAt: text(form, "endsAt") || undefined,
          city: text(form, "city") || undefined, state: text(form, "state") || undefined,
          capacity: capacity ? Number(capacity) : undefined, imageUrls, tags: form.getAll("tags").map(String),
        });
      }
      if (editing.kind === "forum") await authApi.updateForum(editing.item.id, { title: text(form, "title"), description: text(form, "description") });
      if (editing.kind === "group") await authApi.updateGroup(editing.item.id, { name: text(form, "name"), description: text(form, "description") });
      setEditing(null);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível salvar as alterações.");
    } finally {
      setBusy("");
    }
  };
  const respondToGroupInvite = async (groupId: string, accept: boolean) => {
    setBusy(`group-invite-${groupId}`);
    setNotice("");
    try {
      await authApi.respondToGroupInvitation(groupId, accept);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível responder ao convite.");
    } finally {
      setBusy("");
    }
  };

  if (isLoading || !user || (!data && loadingData)) return <Loading />;
  if (!data)
    return (
      <DashboardUnavailable message={notice} onRetry={() => void load()} />
    );
  const profile = data.profile;
  const navigation = [
    { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
    { id: "events" as const, label: "Eventos", icon: CalendarDays },
    { id: "forums" as const, label: "Fóruns", icon: MessageSquareText },
    ...(ambassador
      ? [{ id: "groups" as const, label: "Grupos", icon: UsersRound }]
      : []),
    { id: "profile" as const, label: "Meu perfil", icon: CircleUserRound },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
      <Navbar />
      <div className="pt-24 sm:pt-28">
        <div className="grid w-full gap-5 px-3 pb-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-10 xl:px-14 2xl:px-20">
          <aside className="rounded-3xl border-3 border-[#1e293b] bg-[#1e293b] p-5 text-white shadow-hard-black lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-300 hover:text-white"
            >
              <ArrowLeft size={16} /> Página inicial
            </a>
            <div className="mt-7 flex items-center gap-3">
              <Avatar profile={profile} />
              <div className="min-w-0">
                <p className="truncate font-black">
                  {profile.nickname ?? profile.name}
                </p>
                <p className="truncate text-xs text-slate-300">
                  {profile.universityName}
                </p>
              </div>
            </div>
            <span
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${ambassador ? "bg-[#FBBC04] text-[#1e293b]" : "bg-[#34A853]"}`}
            >
              {ambassador ? "Embaixador 2026" : "Membro da comunidade"}
            </span>
            <nav className="mt-7 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${section === id ? "bg-white text-[#1e293b]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => void logout()}
              className="mt-5 rounded-xl border-2 border-slate-600 px-3 py-2 text-xs font-black text-slate-300 hover:border-[#EA4335] hover:text-white lg:mt-auto"
            >
              Sair da conta
            </button>
          </aside>
          <section className="min-w-0">
            <Hero
              profile={profile}
              ambassador={ambassador}
              onProfile={() => setModal("profile")}
              onCreate={setModal}
            />
            {notice && (
              <p
                role="status"
                className="mt-5 rounded-xl border-2 border-[#EA4335] bg-[#FDECEA] px-4 py-3 text-sm font-bold"
              >
                {notice}
              </p>
            )}
            {section === "overview" && (
              <Overview
                data={data}
                profile={profile}
                ambassador={ambassador}
                onSection={setSection}
                onProfile={() => setModal("profile")}
              />
            )}
            {section === "profile" && (
              <ProfilePage
                profile={profile}
                ambassador={ambassador}
                badges={data.badges}
                onEdit={() => setModal("profile")}
              />
            )}
            {section === "events" && (
              <ResourcePage
                title="Eventos da comunidade"
                description={
                  ambassador
                    ? "Crie experiências para a sua rede e acompanhe as inscrições."
                    : "Encontre experiências relevantes e participe em poucos cliques."
                }
                icon={CalendarDays}
                create={ambassador ? () => setModal("event") : undefined}
              >
                {events.map((item) => (
                  <EventCard
                    key={item.id}
                    item={item}
                    busy={busy === `event-${item.id}` || busy === `event-delete-${item.id}`}
                    deleting={busy === `event-delete-${item.id}`}
                    onClick={() =>
                      void participate("event", item.id, item.isParticipating)
                    }
                    onEdit={() => setEditing({ kind: "event", item })}
                    onDelete={() => void deleteOwnedEvent(item)}
                  />
                ))}
              </ResourcePage>
            )}
            {section === "forums" && (
              <ResourcePage
                title="Fóruns"
                description="Converse, acompanhe temas e crie conexões com a comunidade."
                icon={MessageSquareText}
                create={ambassador ? () => setModal("forum") : undefined}
              >
                {[
                  <div key="forum-filter" className="flex flex-col gap-3 rounded-2xl border-2 border-[#EBF3FE] bg-[#F8FAFE] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-slate-600">Mostrando apenas fóruns em que você participa ou é dono.</p>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-700">Exibir<select value={forumFilter} onChange={(event) => setForumFilter(event.target.value as ForumFilter)} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-black outline-none focus:border-[#4285F4]"><option value="all">Todos os meus fóruns</option><option value="owned">Criados por mim</option><option value="participating">Que estou acompanhando</option></select></label>
                  </div>,
                  ...(filteredForums.length ? filteredForums.map((item) => <DiscussionCard key={item.id} item={item} kind="forum" busy={busy === `forum-${item.id}` || busy === `forum-delete-${item.id}`} deleting={busy === `forum-delete-${item.id}`} onClick={() => void participate("forum", item.id, item.isParticipating)} onDelete={() => void deleteOwnedForum(item)} onEdit={() => setEditing({ kind: "forum", item })} openHref={`/forums/${item.id}`} />) : [<p key="forum-empty" className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Nenhum fórum neste filtro. Explore a página de fóruns para entrar em novas conversas.</p>]),
                ]}
              </ResourcePage>
            )}
            {section === "groups" && ambassador && (
              <ResourcePage
                title="Grupos"
                description="Espaços privados para embaixadores organizarem iniciativas locais."
                icon={UsersRound}
                create={() => setModal("group")}
              >
                {groupInvitations.length > 0 && <section className="rounded-2xl border-2 border-[#4285F4] bg-[#EBF3FE] p-4"><p className="text-xs font-black uppercase tracking-widest text-[#1A73E8]">Convites pendentes</p><div className="mt-3 space-y-2">{groupInvitations.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">{item.name}</p><p className="mt-1 text-xs text-slate-600">{item.description}</p></div><div className="card-actions"><button type="button" disabled={busy === `group-invite-${item.id}`} onClick={() => void respondToGroupInvite(item.id, false)} className="card-action card-action-neutral">Recusar</button><button type="button" disabled={busy === `group-invite-${item.id}`} onClick={() => void respondToGroupInvite(item.id, true)} className="card-action card-action-primary"><Check size={15} /> Aceitar</button></div></div>)}</div></section>}
                {groups.map((item) => (
                  <DiscussionCard
                    key={item.id}
                    item={item}
                    kind="group"
                    busy={busy === `group-${item.id}` || busy === `group-delete-${item.id}`}
                    deleting={busy === `group-delete-${item.id}`}
                    onClick={() =>
                      void participate("group", item.id, item.isParticipating)
                    }
                    onEdit={() => setEditing({ kind: "group", item })}
                    onDelete={() => void deleteOwnedGroup(item)}
                  />
                ))}
              </ResourcePage>
            )}
          </section>
        </div>
      </div>
      <Footer />
      {modal && modal !== "profile" && (
        <CreateModal
          type={modal}
          groups={groups}
          onClose={() => setModal(null)}
          onSubmit={submitCreate}
        />
      )}
      {modal === "profile" && (
        <ProfileModal
          profile={profile}
          badges={data.badges}
          onClose={() => setModal(null)}
          onSubmit={submitProfile}
        />
      )}
      {editing && <EditResourceModal resource={editing} busy={busy === `edit-${editing.item.id}`} onClose={() => setEditing(null)} onSubmit={saveEdit} />}
    </main>
  );
};

const Hero = ({
  profile,
  ambassador,
  onProfile,
  onCreate,
}: {
  profile: Profile;
  ambassador: boolean;
  onProfile: () => void;
  onCreate: (modal: Exclude<Modal, null>) => void;
}) => (
  <header className="overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black">
    <div className="h-2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04]" />
    <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex gap-4">
        <Avatar profile={profile} large />
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF3FE] px-3 py-1 text-xs font-black text-[#4285F4]">
            <Sparkles size={14} /> Seu espaço no Hub
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Olá, {profile.nickname ?? profile.name.split(" ")[0]}!
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            {profile.bio ||
              (ambassador
                ? "Deixe sua marca no campus. Organize, conecte e compartilhe conhecimento."
                : "Descubra pessoas, eventos e ideias que estão movimentando sua comunidade.")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onProfile} className="button-secondary">
          <Pencil size={15} />
          Personalizar perfil
        </button>
        {ambassador && (
          <>
            <SmallAction
              label="Evento"
              icon={CalendarDays}
              onClick={() => onCreate("event")}
            />
            <SmallAction
              label="Fórum"
              icon={MessageSquareText}
              onClick={() => onCreate("forum")}
            />
            <SmallAction
              label="Grupo"
              icon={UsersRound}
              onClick={() => onCreate("group")}
            />
          </>
        )}
      </div>
    </div>
  </header>
);

const Overview = ({
  data,
  profile,
  ambassador,
  onSection,
  onProfile,
}: {
  data: DashboardData;
  profile: Profile;
  ambassador: boolean;
  onSection: (section: Section) => void;
  onProfile: () => void;
}) => (
  <div className="mt-5 space-y-5">
    <div className="grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Seu cartão de perfil</h2>
          <button
            onClick={onProfile}
            className="text-xs font-black text-[#4285F4]"
          >
            Editar <Pencil className="inline" size={13} />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Avatar profile={profile} large />
          <div className="min-w-0">
            <h3 className="text-xl font-black">
              {profile.nickname ?? profile.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-600">
              <GraduationCap size={16} />
              {profile.universityName}
            </p>
            <p className="mt-3 max-w-lg text-sm text-slate-600">
              {profile.bio ||
                "Adicione uma bio para contar à comunidade o que move você."}
            </p>
            <ProfileLinks profile={profile} />
          </div>
        </div>
      </section>
      <section className="rounded-3xl border-3 border-[#1e293b] bg-[#1e293b] p-5 text-white shadow-hard-black">
        <p className="text-xs font-black uppercase tracking-widest text-[#FBBC04]">
          Seu próximo passo
        </p>
        <h2 className="mt-2 text-xl font-black">
          {profile.bio
            ? "Seu perfil está ganhando vida."
            : "Conte sua história."}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Uma bio, contatos e uma moldura ajudam as pessoas certas a encontrar
          você.
        </p>
        <button
          onClick={onProfile}
          className="mt-5 rounded-xl bg-[#FBBC04] px-4 py-2 text-xs font-black text-[#1e293b]"
        >
          Completar perfil
        </button>
      </section>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        icon={CalendarDays}
        color="blue"
        label={ambassador ? "Eventos criados" : "Eventos participando"}
        value={
          ambassador ? data.stats.eventsCreated : data.stats.eventsParticipating
        }
      />
      <Metric
        icon={MessageSquareText}
        color="red"
        label={ambassador ? "Fóruns criados" : "Fóruns acompanhados"}
        value={
          ambassador ? data.stats.forumsCreated : data.stats.forumsParticipating
        }
      />
      <Metric
        icon={UsersRound}
        color="yellow"
        label={ambassador ? "Grupos ativos" : "Perfil público"}
        value={ambassador ? data.stats.groupsParticipating : "✓"}
      />
      <Metric
        icon={Compass}
        color="green"
        label="Comunidade"
        value={ambassador ? "2026" : "Hub"}
      />
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <MiniList
        title="Próximos eventos"
        icon={CalendarDays}
        onView={() => onSection("events")}
        empty="Participe de um evento e ele aparecerá aqui."
      >
        {data.upcomingEvents.map((item) => (
          <div className="rounded-xl border border-slate-200 p-3" key={item.id}>
            <strong className="text-sm">{item.title}</strong>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <Clock3 size={13} />
              {formatDate(item.startsAt)}
            </p>
          </div>
        ))}
      </MiniList>
      <MiniList
        title="Fóruns acompanhados"
        icon={MessageSquareText}
        onView={() => onSection("forums")}
        empty="Acompanhe um fórum para vê-lo aqui."
      >
        {data.activeForums.map((item) => (
          <div className="rounded-xl border border-slate-200 p-3" key={item.id}>
            <strong className="text-sm">{item.title}</strong>
            <p className="mt-1 text-xs text-slate-600">
              {item.memberCount} participantes
            </p>
          </div>
        ))}
      </MiniList>
    </div>
  </div>
);

const ProfilePage = ({
  profile,
  ambassador,
  badges,
  onEdit,
}: {
  profile: Profile;
  ambassador: boolean;
  badges: DashboardData["badges"];
  onEdit: () => void;
}) => (
  <section className="mt-5 space-y-5">
    <div className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Avatar profile={profile} large />
          <div>
            <span className="rounded-full bg-[#FFF8E7] px-2 py-1 text-[10px] font-black uppercase text-[#9A6700]">
              Perfil da comunidade
            </span>
            <h2 className="mt-2 text-2xl font-black">
              {profile.nickname ?? profile.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {ambassador
                ? "Embaixador estudantil 2026"
                : "Membro da comunidade"}{" "}
              · {profile.universityName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/u/${profile.id}`} className="button-secondary">
            <ExternalLink size={16} />
            Ver público
          </a>
          <button onClick={onEdit} className="button-primary">
            <Pencil size={16} />
            Editar perfil
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_0.7fr]">
        <div>
          <h3 className="font-black">Sobre mim</h3>
          <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {profile.bio || "Este membro ainda não adicionou uma bio."}
          </p>
          <h3 className="mt-6 font-black">Links e contato</h3>
          <ProfileLinks profile={profile} detailed />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-5">
            <h3 className="font-black">Personalização</h3>
            <p className="mt-2 text-sm text-slate-600">Moldura selecionada</p>
            <div className="mt-4 flex items-center gap-4">
              <Avatar profile={profile} large />
              <span className="rounded-full bg-[#EBF3FE] px-3 py-1 text-xs font-black text-[#4285F4]">
                {frameLabels[profile.avatarFrame] || "Sem moldura"}
              </span>
            </div>
            <button
              onClick={onEdit}
              className="mt-5 text-sm font-black text-[#4285F4]"
            >
              Trocar moldura →
            </button>
          </div>
          <InviteCard code={profile.inviteCode} />
        </div>
      </div>
    </div>
    <section className="rounded-3xl border-3 border-[#1e293b] bg-[#242424] p-5 shadow-hard-black sm:p-7">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#FBBC04]">
            Suas medalhas
          </span>
          <h2 className="mt-2 text-2xl font-black text-white">
            Selos conquistados
          </h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
          {badges.length}
        </span>
      </div>
      <div className="mt-6">
        {badges.length ? (
          <BadgeShelf badges={badges} compact />
        ) : (
          <p className="text-sm text-slate-300">
            Crie um fórum, participe de uma conversa ou convide alguém para
            começar sua coleção.
          </p>
        )}
      </div>
    </section>
  </section>
);

const ResourcePage = ({
  title,
  description,
  icon: Icon,
  create,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  create?: () => void;
  children: React.ReactNode[];
}) => (
  <section className="mt-5 rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black">
          <Icon className="text-[#4285F4]" />
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      {create && (
        <SmallAction label="Criar novo" icon={Plus} onClick={create} />
      )}
    </div>
    <div className="mt-6 grid gap-3">
      {children.length ? (
        children
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Nada por aqui ainda. A comunidade está só começando.
        </p>
      )}
    </div>
  </section>
);

const EventCard = ({
  item,
  busy,
  deleting = false,
  onClick,
  onEdit,
  onDelete,
}: {
  item: CommunityEvent;
  busy: boolean;
  deleting?: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <article className="rounded-2xl border-2 border-slate-200 p-4 hover:border-[#4285F4]">
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div>
        <EventTags tags={item.tags} limit={3} className="mb-2" />
        <div className="flex gap-2">
          <h3 className="font-black">{item.title}</h3>
          {item.isOwner ? <Tag>Seu evento</Tag> : item.isOrganizer && <Tag>Equipe organizadora</Tag>}
        </div>
        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Clock3 size={14} />
            {formatDate(item.startsAt)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <UsersRound size={14} />
            {item.participantCount} inscritos
          </span>
        </div>
      </div>
       <div className="card-actions"><a href={`/events/${item.id}`} className="card-action card-action-neutral">Ver detalhes</a>{item.isOwner || item.isOrganizer ? <><button type="button" onClick={onEdit} className="card-action card-action-primary"><Pencil size={15} /> Editar evento</button>{item.isOwner && <button type="button" disabled={busy} onClick={onDelete} className="card-action card-action-danger">{deleting ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}{deleting ? "Excluindo…" : "Excluir"}</button>}</> : <JoinButton joined={item.isParticipating} busy={busy} onClick={onClick} />}</div>
    </div>
  </article>
);
const DiscussionCard = ({
  item,
  kind,
  busy,
  deleting = false,
  onClick,
  onDelete,
  onEdit,
  openHref,
}: {
  item: CommunityForum | CommunityGroup;
  kind: "forum" | "group";
  busy: boolean;
  deleting?: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onEdit: () => void;
  openHref?: string;
}) => (
  <article className="rounded-2xl border-2 border-slate-200 p-4 hover:border-[#4285F4]">
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div>
        <div className="flex gap-2">
          <h3 className="font-black">
            {"name" in item ? item.name : item.title}
          </h3>
          {item.isOwner && (
            <Tag>{kind === "group" ? "Seu grupo" : "Seu fórum"}</Tag>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
        <p className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-600">
          <UsersRound size={14} />
          {item.memberCount} participantes
        </p>
      </div>
      <div className="card-actions sm:justify-end">
        {openHref && (
          <a href={openHref} className="card-action card-action-neutral">
            <MessageSquareText size={15} />
            Conversar
          </a>
        )}
        {item.isOwner ? <><button type="button" onClick={onEdit} className="card-action card-action-primary"><Pencil size={15} /> Editar</button><button type="button" disabled={busy} onClick={onDelete} className="card-action card-action-danger">{deleting ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}{deleting ? "Excluindo…" : "Excluir"}</button></> : <JoinButton joined={item.isParticipating} busy={busy} onClick={onClick} />}
      </div>
    </div>
  </article>
);
const JoinButton = ({
  joined,
  busy,
  onClick,
}: {
  joined: boolean;
  busy: boolean;
  onClick: () => void;
}) => (
  <button
    disabled={busy}
    onClick={onClick}
    className={`inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-xl border-2 px-3 py-2 text-xs font-black ${joined ? "border-[#34A853] bg-[#EFFBF3] text-[#18753A]" : "border-[#1e293b] hover:bg-[#EBF3FE]"}`}
  >
    {busy ? (
      <LoaderCircle className="animate-spin" size={15} />
    ) : joined ? (
      <Check size={15} />
    ) : (
      <Plus size={15} />
    )}
    {joined ? "Sair" : "Participar"}
  </button>
);
const InviteCard = ({ code }: { code?: string }) => (
  <div className="rounded-2xl border-2 border-[#4285F4] bg-[#EBF3FE] p-5">
    <div className="flex items-center gap-2">
      <Link2 size={18} className="text-[#4285F4]" />
      <h3 className="font-black">Convide para o Hub</h3>
    </div>
    <p className="mt-2 text-sm text-slate-600">
      Quando alguém criar a conta com seu link, você ganha o selo Conector.
    </p>
    {code && (
      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#4285F4]/30 bg-white p-2">
        <code className="truncate text-xs font-black">{code}</code>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard?.writeText(
              `${window.location.origin}/register?ref=${code}`,
            )
          }
          className="rounded-lg bg-[#4285F4] px-3 py-2 text-xs font-black text-white"
        >
          Copiar link
        </button>
      </div>
    )}
  </div>
);
const ForumConversation = ({
  forum,
  onClose,
  onSent,
}: {
  forum: CommunityForum;
  onClose: () => void;
  onSent: () => void;
}) => {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    authApi
      .listForumMessages(forum.id)
      .then((result) => setMessages(result.messages))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar a conversa.",
        ),
      );
  }, [forum.id]);
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      const result = await authApi.sendForumMessage(forum.id, content.trim());
      setMessages((current) => [...current, result.message]);
      setContent("");
      onSent();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e293b]/60 p-4">
      <section className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black">
        <header className="flex items-center justify-between border-b-2 border-slate-200 p-5">
          <div>
            <h2 className="font-black">{forum.title}</h2>
            <p className="text-xs text-slate-600">Conversa do fórum</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar conversa"
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </header>
        <div className="min-h-35 flex-1 space-y-3 overflow-y-auto p-5">
          {error && (
            <p className="rounded-xl bg-[#FDECEA] p-3 text-sm font-bold">
              {error}
            </p>
          )}
          {messages.length ? (
            messages.map((message) => (
              <article key={message.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Avatar profile={message.author} />
                  <div>
                    <a
                      href={`/u/${message.author.id}`}
                      className="text-sm font-black hover:text-[#4285F4]"
                    >
                      {message.author.nickname ?? message.author.name}
                    </a>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {message.content}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              Seja a primeira pessoa a compartilhar uma ideia.
            </p>
          )}
        </div>
        <form onSubmit={send} className="border-t-2 border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={1000}
              placeholder="Compartilhe uma ideia…"
              className="input-auth"
            />
            <button
              disabled={sending}
              className="button-primary !min-h-10 !px-4"
            >
              {sending ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                "Enviar"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const ProfileModal = ({
  profile,
  badges,
  onClose,
  onSubmit,
}: {
  profile: Profile;
  badges: DashboardData["badges"];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e293b]/60 p-3 sm:p-5">
    <form
      onSubmit={onSubmit}
      className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:max-h-[calc(100dvh-2.5rem)] sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Personalize seu perfil</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mostre quem você é e facilite novas conexões.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-xl p-2 hover:bg-slate-100"
        >
          <X />
        </button>
      </div>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 xl:grid xl:grid-cols-[minmax(430px,0.95fr)_minmax(0,1.05fr)] xl:gap-7 xl:overflow-visible">
        <div>
          <p className="text-sm font-black">Escolha sua moldura</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Complete troféus para liberar molduras especiais animadas.</p>
          <div className="mt-3 grid max-h-[19rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 xl:max-h-[22rem]">
            {(Object.keys(frameLabels) as AvatarFrame[]).map((frame) => {
              const unlocked = isFrameUnlocked(frame, badges);
              const requirement = frameRequirements[frame];
              return <label key={frame} className={unlocked ? "cursor-pointer" : "cursor-not-allowed"}>
                <input className="peer sr-only" type="radio" name="avatarFrame" value={frame} disabled={!unlocked} defaultChecked={profile.avatarFrame === frame} />
                <span className={`relative flex min-h-[5.25rem] flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 p-2 transition-all peer-checked:border-[#4285F4] peer-checked:bg-[#EBF3FE] ${unlocked ? 'border-slate-200 hover:-translate-y-0.5 hover:border-[#8AB4F8]' : 'border-slate-200 bg-slate-50 opacity-65'}`}>
                  <Avatar profile={{ ...profile, avatarFrame: frame }} />
                  <span className="text-center text-[10px] font-black leading-tight">{frameLabels[frame]}</span>
                  {!unlocked && <span className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded-md bg-[#1e293b] px-1 py-1 text-center text-[9px] font-black leading-tight text-white"><LockKeyhole size={10} />{requirement}</span>}
                </span>
              </label>;
            })}
          </div>
        </div>
        <div className="mt-5 space-y-3 xl:mt-0">
          <Field
            name="nickname"
            label="Apelido"
            defaultValue={profile.nickname}
            placeholder="Como quer aparecer?"
            maxLength={40}
          />
          <label className="block text-sm font-black">
            Bio
            <textarea
              name="bio"
              defaultValue={profile.bio}
              maxLength={280}
              rows={3}
              placeholder="Conte o que você estuda, cria ou quer descobrir."
              className="input-auth mt-2 resize-y"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              name="githubUrl"
              label="GitHub"
              defaultValue={profile.githubUrl}
              placeholder="https://github.com/..."
            />
            <Field
              name="linkedinUrl"
              label="LinkedIn"
              defaultValue={profile.linkedinUrl}
              placeholder="https://linkedin.com/in/..."
            />
            <Field
              name="instagramUrl"
              label="Instagram"
              defaultValue={profile.instagramUrl}
              placeholder="https://instagram.com/..."
            />
            <Field
              name="phone"
              label="Telefone"
              defaultValue={profile.phone}
              placeholder="+55 (11) 99999-9999"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex shrink-0 gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className="button-secondary">
          Cancelar
        </button>
        <button className="button-primary flex-1">
          Salvar perfil <Check size={16} />
        </button>
      </div>
    </form>
  </div>
);
const EditResourceModal = ({ resource, busy, onClose, onSubmit }: { resource: EditableResource; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) => {
  const isEvent = resource.kind === "event";
  const isGroup = resource.kind === "group";
  const title = isGroup ? (resource.item as CommunityGroup).name : (resource.item as CommunityEvent | CommunityForum).title;
  if (isGroup) return <GroupEditModal group={resource.item as CommunityGroup} busy={busy} onClose={onClose} onSubmit={onSubmit} />;
  if (isEvent) return <EventEditModal event={resource.item as CommunityEvent} busy={busy} onClose={onClose} onSubmit={onSubmit} />;
  if (resource.kind === "forum") return <ForumEditModal forum={resource.item as CommunityForum} busy={busy} onClose={onClose} onSubmit={onSubmit} />;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e293b]/60 p-4"><form onSubmit={onSubmit} className="w-full max-w-xl rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Editar {isEvent ? 'evento' : isGroup ? 'grupo' : 'fórum'}</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><label className="mt-6 block text-sm font-black">{isGroup ? 'Nome do grupo' : 'Título'}<input name={isGroup ? 'name' : 'title'} defaultValue={title} className="input-auth mt-2" minLength={3} maxLength={100} required /></label>{isEvent && <label className="mt-4 block text-sm font-black">Local<input name="location" defaultValue={(resource.item as CommunityEvent).location} className="input-auth mt-2" minLength={2} maxLength={140} required /></label>}<label className="mt-4 block text-sm font-black">Descrição<textarea name="description" defaultValue={resource.item.description} className="input-auth mt-2 resize-y" rows={6} minLength={8} maxLength={1500} required /></label><div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="button-secondary">Cancelar</button><button disabled={busy} className="button-primary flex-1">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Pencil size={16} />} Salvar alterações</button></div></form></div>;
};

const EventEditModal = ({ event, busy, onClose, onSubmit }: { event: CommunityEvent; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) => {
  const [details, setDetails] = useState<import("../../../services/auth").EventDetails | null>(null);
  const [teamError, setTeamError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const loadDetails = async () => {
    try { setDetails(await authApi.getEvent(event.id)); } catch (error) { setTeamError(error instanceof Error ? error.message : "Não foi possível carregar a equipe."); }
  };
  useEffect(() => { void loadDetails(); }, [event.id]);
  const removeOrganizer = async (member: EventParticipant) => {
    if (!window.confirm(`Remover ${member.nickname ?? member.name} da organização deste evento?`)) return;
    setRemovingId(member.id);
    setTeamError("");
    try { await authApi.removeEventOrganizer(event.id, member.id); await loadDetails(); } catch (error) { setTeamError(error instanceof Error ? error.message : "Não foi possível remover a pessoa da equipe."); } finally { setRemovingId(""); }
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e293b]/60 p-4"><form onSubmit={onSubmit} className="mx-auto my-4 w-full max-w-3xl rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Editar evento</p><h2 className="mt-1 text-2xl font-black">{event.title}</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-black sm:col-span-2">Título<input name="title" defaultValue={event.title} className="input-auth mt-2" minLength={3} maxLength={100} required /></label><label className="text-sm font-black">Início<input name="startsAt" type="datetime-local" defaultValue={toDateTimeInput(event.startsAt)} className="input-auth mt-2" required /></label><label className="text-sm font-black">Término<input name="endsAt" type="datetime-local" defaultValue={event.endsAt ? toDateTimeInput(event.endsAt) : ""} className="input-auth mt-2" /></label><label className="text-sm font-black sm:col-span-2">Local<input name="location" defaultValue={event.location} className="input-auth mt-2" minLength={2} maxLength={140} required /></label><label className="text-sm font-black">Cidade<input name="city" defaultValue={event.city} className="input-auth mt-2" maxLength={100} /></label><label className="text-sm font-black">UF<select name="state" defaultValue={event.state} className="input-auth mt-2"><option value="">Selecione</option>{eventStateOptions.map((state) => <option key={state} value={state}>{state}</option>)}</select></label><label className="text-sm font-black">Limite de vagas<input name="capacity" type="number" min="1" max="10000" defaultValue={event.capacity ?? ""} className="input-auth mt-2" /></label></div><label className="mt-4 block text-sm font-black">Descrição<textarea name="description" defaultValue={event.description} className="input-auth mt-2 resize-y" rows={5} minLength={8} maxLength={1500} required /></label><fieldset className="mt-5"><legend className="text-sm font-black">Tags</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{eventTagOptions.map((tag) => <label key={tag.value} className="cursor-pointer"><input type="checkbox" name="tags" value={tag.value} defaultChecked={event.tags.includes(tag.value)} className="peer sr-only" /><span className={`block rounded-xl border-2 px-3 py-2 text-center text-xs font-black peer-checked:ring-2 peer-checked:ring-[#1e293b] ${tag.className}`}>{tag.label}</span></label>)}</div></fieldset><label className="mt-5 block text-sm font-black">Imagens do evento<textarea name="imageUrls" defaultValue={event.imageUrls.join("\n")} className="input-auth mt-2 resize-y" rows={3} placeholder="Uma URL HTTPS por linha" /><span className="mt-1 block text-xs font-medium text-slate-500">Use até cinco imagens HTTPS; a primeira será a capa.</span></label><section className="mt-5 rounded-2xl border-2 border-[#EBF3FE] bg-[#F8FAFE] p-4"><div><p className="text-sm font-black">Equipe organizadora</p><p className="mt-1 text-xs text-slate-600">Remova embaixadores que não devem mais editar ou administrar o evento.</p></div>{teamError && <p role="alert" className="mt-3 rounded-lg bg-[#FDECEA] p-2 text-xs font-bold text-[#A61B16]">{teamError}</p>}<div className="mt-3 space-y-2">{details ? details.organizers.map((member) => <div key={member.id} className="flex items-center gap-3 rounded-xl bg-white p-2"><Avatar profile={member} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{member.nickname ?? member.name}</span><span className="block truncate text-[10px] text-slate-500">{member.universityName}</span></span><button type="button" disabled={Boolean(removingId) || member.id === details.organizer?.id} onClick={() => void removeOrganizer(member)} className="card-action card-action-danger !min-h-8 !px-2 !py-1 text-[10px]">{removingId === member.id ? <LoaderCircle className="animate-spin" size={13} /> : <UserRoundMinus size={13} />} Remover</button></div>) : <p className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-slate-500"><LoaderCircle className="animate-spin" size={14} /> Carregando equipe…</p>}</div></section><div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="button-secondary">Cancelar</button><button disabled={busy} className="button-primary flex-1">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Pencil size={16} />} Salvar evento</button></div></form></div>;
};

const ForumEditModal = ({ forum, busy, onClose, onSubmit }: { forum: CommunityForum; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) => {
  const [members, setMembers] = useState<ForumMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberAction, setMemberAction] = useState("");
  const [memberError, setMemberError] = useState("");
  const loadMembers = async () => {
    setLoadingMembers(true);
    try { const result = await authApi.listForumMembers(forum.id); setMembers(result.members); } catch (error) { setMemberError(error instanceof Error ? error.message : "Não foi possível carregar os participantes."); } finally { setLoadingMembers(false); }
  };
  useEffect(() => { void loadMembers(); }, [forum.id]);
  const updateMember = async (member: ForumMember, input: Parameters<typeof authApi.updateForumMember>[2]) => {
    setMemberAction(member.id);
    setMemberError("");
    try { await authApi.updateForumMember(forum.id, member.id, input); await loadMembers(); } catch (error) { setMemberError(error instanceof Error ? error.message : "Não foi possível atualizar a permissão."); } finally { setMemberAction(""); }
  };
  const removeMember = async (member: ForumMember) => {
    if (!window.confirm(`Remover ${member.nickname ?? member.name} deste fórum?`)) return;
    setMemberAction(member.id);
    setMemberError("");
    try { await authApi.removeForumMember(forum.id, member.id); await loadMembers(); } catch (error) { setMemberError(error instanceof Error ? error.message : "Não foi possível remover o participante."); } finally { setMemberAction(""); }
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e293b]/60 p-4"><form onSubmit={onSubmit} className="mx-auto my-4 w-full max-w-3xl rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Editar fórum</p><h2 className="mt-1 text-2xl font-black">{forum.title}</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><label className="mt-6 block text-sm font-black">Título<input name="title" defaultValue={forum.title} className="input-auth mt-2" minLength={3} maxLength={100} required /></label><label className="mt-4 block text-sm font-black">Descrição<textarea name="description" defaultValue={forum.description} className="input-auth mt-2 resize-y" rows={4} minLength={8} maxLength={1500} required /></label><section className="mt-5 rounded-2xl border-2 border-[#EBF3FE] bg-[#F8FAFE] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black">Participantes e permissões</p><p className="mt-1 text-xs text-slate-600">Altere cargos, escrita, silenciamento, banimento ou remova pessoas.</p></div><button type="button" onClick={() => void loadMembers()} className="card-action card-action-neutral">Atualizar</button></div>{memberError && <p role="alert" className="mt-3 rounded-lg bg-[#FDECEA] p-2 text-xs font-bold text-[#A61B16]">{memberError}</p>}<div className="mt-4 max-h-[48vh] space-y-2 overflow-y-auto pr-1">{loadingMembers ? <p className="flex items-center justify-center gap-2 rounded-xl bg-white p-5 text-xs font-bold text-slate-500"><LoaderCircle className="animate-spin" size={16} /> Carregando participantes…</p> : members.map((member) => { const busyMember = memberAction === member.id; const muted = Boolean(member.mutedUntil && new Date(member.mutedUntil) > new Date()); return <article key={member.id} className="rounded-xl bg-white p-3"><div className="flex flex-wrap items-center gap-3"><Avatar profile={member} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{member.nickname ?? member.name}</p><p className="mt-0.5 text-[11px] font-bold text-slate-500">{member.isBot ? "Moderador automático" : member.role}{member.banned ? " · banido" : ""}{member.readOnly ? " · somente leitura" : ""}{muted ? " · silenciado" : ""}</p></div>{!member.isBot && member.role !== "owner" && <select value={member.role} disabled={busyMember} onChange={(event) => void updateMember(member, { role: event.target.value as "admin" | "moderator" | "member" })} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-bold"><option value="member">Membro</option><option value="moderator">Moderador</option><option value="admin">Administrador</option></select>}</div>{!member.isBot && member.role !== "owner" && <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busyMember || member.banned} onClick={() => void updateMember(member, { mutedForMinutes: muted ? 0 : 60 })} className="card-action card-action-neutral !min-h-8 !px-2 !py-1 text-[10px]"><VolumeX size={13} /> {muted ? "Desmutar" : "Silenciar"}</button><button type="button" disabled={busyMember || member.banned} onClick={() => void updateMember(member, { readOnly: !member.readOnly })} className="card-action card-action-neutral !min-h-8 !px-2 !py-1 text-[10px]"><Eye size={13} /> {member.readOnly ? "Permitir escrever" : "Somente leitura"}</button><button type="button" disabled={busyMember} onClick={() => void updateMember(member, { banned: !member.banned })} className="card-action card-action-danger !min-h-8 !px-2 !py-1 text-[10px]"><Ban size={13} /> {member.banned ? "Desbanir" : "Banir"}</button><button type="button" disabled={busyMember} onClick={() => void removeMember(member)} className="card-action card-action-danger !min-h-8 !px-2 !py-1 text-[10px]"><UserRoundMinus size={13} /> Remover</button></div>}</article>; })}</div></section><div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="button-secondary">Cancelar</button><button disabled={busy} className="button-primary flex-1">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Pencil size={16} />} Salvar alterações</button></div></form></div>;
};

const GroupEditModal = ({ group, busy, onClose, onSubmit }: { group: CommunityGroup; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) => {
  const [query, setQuery] = useState("");
  const [ambassadors, setAmbassadors] = useState<AmbassadorDirectoryItem[]>([]);
  const [invitingId, setInvitingId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [pendingMembers, setPendingMembers] = useState<GroupInvitee[]>([]);
  useEffect(() => {
    void authApi.listAmbassadors().then(({ ambassadors: items }) => setAmbassadors(items)).catch(() => setInviteError("Não foi possível carregar os embaixadores."));
  }, []);
  useEffect(() => {
    void authApi.listPendingGroupMembers(group.id).then(({ members }) => setPendingMembers(members)).catch(() => undefined);
  }, [group.id]);
  const invite = async (userId: string) => {
    setInvitingId(userId);
    setInviteError("");
    try {
      await authApi.inviteGroupMember(group.id, userId);
      const result = await authApi.listPendingGroupMembers(group.id);
      setPendingMembers(result.members);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Não foi possível enviar o convite.");
    } finally {
      setInvitingId("");
    }
  };
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const matches = ambassadors.filter((ambassador) => `${ambassador.name} ${ambassador.nickname ?? ""} ${ambassador.universityName}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)).slice(0, 8);
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e293b]/60 p-4"><form onSubmit={onSubmit} className="mx-auto my-4 w-full max-w-xl rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Editar grupo</p><h2 className="mt-1 text-2xl font-black">{group.name}</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><label className="mt-6 block text-sm font-black">Nome do grupo<input name="name" defaultValue={group.name} className="input-auth mt-2" minLength={3} maxLength={100} required /></label><label className="mt-4 block text-sm font-black">Descrição<textarea name="description" defaultValue={group.description} className="input-auth mt-2 resize-y" rows={5} minLength={8} maxLength={1500} required /></label><section className="mt-5 rounded-2xl border-2 border-[#EBF3FE] bg-[#F8FAFE] p-4"><p className="text-sm font-black">Convidar embaixadores</p><p className="mt-1 text-xs leading-relaxed text-slate-600">O embaixador só entrará no grupo depois de confirmar o convite no próprio painel.</p>{pendingMembers.length > 0 && <div className="mt-3 rounded-xl border border-[#F6C343] bg-[#FFF8E7] p-3"><p className="text-[11px] font-black uppercase tracking-wide text-[#705600]">Convites pendentes · {pendingMembers.length}</p><div className="mt-2 space-y-1">{pendingMembers.map((member) => <div key={member.id} className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5"><Avatar profile={member} /><span className="min-w-0 flex-1 truncate text-xs font-black">{member.nickname ?? member.name}</span><span className="rounded-full bg-[#FFF1CC] px-2 py-0.5 text-[10px] font-black text-[#9A6700]">Pendente</span></div>)}</div></div>}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou universidade" className="input-auth mt-3 !min-h-10" />{inviteError && <p role="alert" className="mt-2 text-xs font-bold text-[#C5221F]">{inviteError}</p>}<div className="mt-3 max-h-52 space-y-2 overflow-y-auto">{normalizedQuery ? matches.map((ambassador) => { const pending = pendingMembers.some((member) => member.id === ambassador.id); return <div key={ambassador.id} className="flex items-center gap-2 rounded-xl bg-white p-2"><Avatar profile={ambassador} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{ambassador.nickname ?? ambassador.name}</span><span className="block truncate text-[10px] text-slate-500">{ambassador.universityName}</span></span><button type="button" disabled={Boolean(invitingId) || pending} onClick={() => void invite(ambassador.id)} className="card-action card-action-primary !min-h-8 !px-2 !py-1 text-[10px]">{invitingId === ambassador.id ? <LoaderCircle className="animate-spin" size={13} /> : pending ? <Check size={13} /> : <Plus size={13} />}{pending ? "Pendente" : "Convidar"}</button></div>; }) : <p className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">Digite para buscar embaixadores.</p>}{normalizedQuery && !matches.length && <p className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">Nenhum embaixador encontrado.</p>}</div></section><div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="button-secondary">Cancelar</button><button disabled={busy} className="button-primary flex-1">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Pencil size={16} />} Salvar alterações</button></div></form></div>;
};

const CreateModal = ({
  type,
  groups,
  onClose,
  onSubmit,
}: {
  type: Exclude<Modal, null | "profile">;
  groups: CommunityGroup[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [eventCity, setEventCity] = useState("");
  const [eventState, setEventState] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCoordinates, setEventCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [ambassadors, setAmbassadors] = useState<AmbassadorDirectoryItem[]>([]);
  useEffect(() => {
    if (type === "event") void authApi.listAmbassadors().then(({ ambassadors: items }) => setAmbassadors(items)).catch(() => setAmbassadors([]));
  }, [type]);
  const config =
    type === "event"
      ? {
          heading: "Novo evento",
          name: "title",
          placeholder: "Ex.: Encontro no campus",
          action: "Publicar evento",
        }
      : type === "forum"
        ? {
            heading: "Novo fórum",
            name: "title",
            placeholder: "Ex.: IA e carreira",
            action: "Abrir fórum",
          }
        : {
            heading: "Novo grupo",
            name: "name",
            placeholder: "Ex.: GSA região Sul",
            action: "Criar grupo",
          };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e293b]/60 p-3 sm:grid sm:place-items-center sm:p-6">
      <form
        onSubmit={onSubmit}
        className="mx-auto my-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black sm:my-0 sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
          <h2 className="text-xl font-black">{config.heading}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
        <Field
          name={config.name}
          label="Nome"
          placeholder={config.placeholder}
          required
        />
        {type === "event" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              name="startsAt"
              label="Data e hora"
              type="datetime-local"
              required
            />
            <Field
              name="endsAt"
              label="Término (opcional)"
              type="datetime-local"
            />
            <label className="mt-4 block text-sm font-black">Local<input name="location" value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} placeholder="Campus ou online" maxLength={280} required className="input-auth mt-2" /><span className="mt-1 block text-[11px] font-medium text-slate-500">Ao marcar o mapa, o endereço completo será preenchido automaticamente.</span></label>
            <Field
              name="capacity"
              label="Limite de vagas (opcional)"
              type="number"
              placeholder="Ex.: 80"
            />
          </div>
        )}
        {type === "event" && <><div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]"><label className="block text-sm font-black">Cidade<input name="city" value={eventCity} onChange={(event) => setEventCity(event.target.value)} maxLength={100} placeholder="Ex.: São Paulo" className="input-auth mt-2" /></label><label className="block text-sm font-black">Estado (UF)<select name="state" value={eventState} onChange={(event) => setEventState(event.target.value)} className="input-auth mt-2"><option value="">Selecione</option>{eventStateOptions.map((state) => <option key={state} value={state}>{state}</option>)}</select></label></div><input type="hidden" name="coordinatesLat" value={eventCoordinates?.lat ?? ""} /><input type="hidden" name="coordinatesLng" value={eventCoordinates?.lng ?? ""} /><div className="mt-4"><EventLocationPicker coordinates={eventCoordinates} onChange={setEventCoordinates} onAddressChange={(address) => { setEventLocation(address.label); if (address.city) setEventCity(address.city); if (address.state && eventStateOptions.some((state) => state === address.state)) setEventState(address.state); }} searchQuery={[eventCity, eventState, 'Brasil'].filter(Boolean).join(', ')} /></div></>}
        {type === "event" && <fieldset className="mt-5"><legend className="text-sm font-black">Tags do evento <span className="font-medium text-slate-500">(escolha até 5)</span></legend><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{eventTagOptions.map((tag) => <label key={tag.value} className="cursor-pointer"><input type="checkbox" name="tags" value={tag.value} checked={selectedTags.includes(tag.value)} onChange={(event) => setSelectedTags((current) => event.target.checked ? current.length < 5 ? [...current, tag.value] : current : current.filter((value) => value !== tag.value))} className="peer sr-only" /><span className={`block rounded-xl border-2 px-3 py-2 text-center text-xs font-black transition-colors peer-checked:ring-2 peer-checked:ring-[#1e293b] ${tag.className}`}>{tag.label}</span></label>)}</div></fieldset>}
        <label className="mt-4 block text-sm font-black">
          Descrição
          <textarea
            required
            name="description"
            minLength={8}
            maxLength={1500}
            rows={4}
            placeholder="Conte à comunidade o que ela pode esperar."
            className="input-auth mt-2 resize-y"
          />
        </label>
        {type === "event" && <><label className="mt-4 block text-sm font-black">Imagens do evento <span className="font-medium text-slate-500">(opcional)</span><textarea name="imageUrls" maxLength={10_000} rows={3} placeholder="Cole até 5 links HTTPS, separados por vírgula ou uma linha por imagem." className="input-auth mt-2 resize-y" /><span className="mt-1 block text-xs font-medium text-slate-500">A primeira imagem será a capa do evento.</span></label><fieldset className="mt-5 rounded-2xl border-2 border-[#EBF3FE] bg-[#F8FAFE] p-4"><legend className="px-1 text-sm font-black">Equipe de organização</legend><p className="text-xs leading-relaxed text-slate-600">As pessoas escolhidas poderão editar o evento, publicar notícias e administrar o fórum privado.</p>{groups.length > 0 && <label className="mt-3 block text-xs font-black">Adicionar um grupo inteiro<select name="groupId" className="input-auth mt-1 !min-h-10"><option value="">Nenhum grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name} · {group.memberCount} membros</option>)}</select></label>}{ambassadors.length > 0 && <div className="mt-3"><p className="text-xs font-black">Adicionar pessoas</p><div className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-xl bg-white p-2">{ambassadors.slice(0, 30).map((ambassador) => <label key={ambassador.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#EBF3FE]"><input type="checkbox" name="organizerIds" value={ambassador.id} className="accent-[#4285F4]" /><span className="text-xs font-bold">{ambassador.nickname ?? ambassador.name}</span><span className="ml-auto text-[10px] text-slate-500">{ambassador.universityName}</span></label>)}</div></div>}<label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl bg-white p-3 text-xs font-bold"><input type="checkbox" name="createForum" className="mt-0.5 accent-[#4285F4]" /><span><strong className="block text-slate-800">Criar fórum privado da organização</strong><span className="mt-0.5 block text-slate-500">Apenas a equipe organizadora terá acesso.</span></span></label></fieldset></>}
        </div>
        <div className="flex shrink-0 gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="button-secondary">
            Cancelar
          </button>
          <button className="button-primary flex-1">
            {config.action} <Flag size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

const Avatar = ({
  profile,
  large = false,
}: {
  profile: Pick<Profile, "name" | "avatarPath" | "avatarFrame">;
  large?: boolean;
}) => (
  <span
    className={`avatar-frame avatar-frame-${profile.avatarFrame} ${large ? "h-16 w-16" : "h-12 w-12"}`}
  >
    <span className="avatar-inner">
      {getAvatarUrl(profile.avatarPath) ? (
        <img src={getAvatarUrl(profile.avatarPath)} alt="" />
      ) : (
        <CircleUserRound size={large ? 34 : 25} />
      )}
    </span>
  </span>
);
const ProfileLinks = ({
  profile,
  detailed = false,
}: {
  profile: Profile;
  detailed?: boolean;
}) => {
  const links = [
    { value: profile.githubUrl, label: "GitHub", icon: Link2 },
    { value: profile.linkedinUrl, label: "LinkedIn", icon: Link2 },
    { value: profile.instagramUrl, label: "Instagram", icon: Link2 },
    { value: profile.phone, label: "Telefone", icon: Phone },
  ];
  const active = links.filter((item) => item.value);
  return (
    <div
      className={`mt-4 flex flex-wrap gap-2 ${detailed ? "flex-col items-start" : ""}`}
    >
      {active.length ? (
        active.map(
          ({ value, label, icon: Icon }) =>
            value && (
              <a
                key={label}
                href={label === "Telefone" ? `tel:${value}` : value}
                target={label === "Telefone" ? undefined : "_blank"}
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black hover:border-[#4285F4] hover:text-[#4285F4]"
              >
                <Icon size={15} />
                {detailed ? label : ""}
                {label !== "Telefone" && <ExternalLink size={12} />}
              </a>
            ),
        )
      ) : (
        <span className="text-xs text-slate-500">
          Nenhum link adicionado ainda.
        </span>
      )}
    </div>
  );
};
const Metric = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "red" | "yellow" | "green";
}) => (
  <div className="rounded-2xl border-3 border-[#1e293b] bg-white p-4 shadow-hard-black">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${color === "blue" ? "bg-[#EBF3FE] text-[#4285F4]" : color === "red" ? "bg-[#FDECEA] text-[#EA4335]" : color === "yellow" ? "bg-[#FFF8E7] text-[#9A6700]" : "bg-[#EFFBF3] text-[#34A853]"}`}
    >
      <Icon size={18} />
    </div>
    <p className="mt-3 text-2xl font-black">{value}</p>
    <p className="text-xs font-bold text-slate-600">{label}</p>
  </div>
);
const MiniList = ({
  title,
  icon: Icon,
  onView,
  empty,
  children,
}: {
  title: string;
  icon: React.ElementType;
  onView: () => void;
  empty: string;
  children?: React.ReactNode;
}) => (
  <section className="rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black">
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-black">
        <Icon size={19} className="text-[#4285F4]" />
        {title}
      </h2>
      <button onClick={onView} className="text-xs font-black text-[#4285F4]">
        Ver todos <ChevronRight className="inline" size={14} />
      </button>
    </div>
    <div className="mt-4 grid gap-2">
      {children || (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          {empty}
        </p>
      )}
    </div>
  </section>
);
const SmallAction = ({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex min-h-9 items-center gap-2 rounded-xl border-2 border-[#1e293b] bg-[#4285F4] px-3 py-2 text-xs font-black text-white shadow-hard-black hover:-translate-y-0.5"
  >
    <Icon size={15} />
    {label}
  </button>
);
const Field = ({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) => (
  <label className="mt-4 block text-sm font-black">
    {label}
    <input
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      maxLength={maxLength}
      className="input-auth mt-2"
    />
  </label>
);
const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-[#FFF8E7] px-2 py-0.5 text-[10px] font-black text-[#9A6700]">
    {children}
  </span>
);
const Loading = () => (
  <main className="grid min-h-screen place-items-center bg-[#F8FAFE]">
    <div className="flex items-center gap-3 rounded-2xl border-3 border-[#1e293b] bg-white px-5 py-4 font-black shadow-hard-black">
      <LoaderCircle className="animate-spin text-[#4285F4]" />
      Carregando seu Hub…
    </div>
  </main>
);
const DashboardUnavailable = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <main className="grid min-h-screen place-items-center bg-[#F8FAFE] p-4">
    <section className="max-w-md rounded-3xl border-3 border-[#1e293b] bg-white p-7 text-center shadow-hard-black">
      <Compass className="mx-auto text-[#4285F4]" size={34} />
      <h1 className="mt-4 text-2xl font-black">
        Não foi possível abrir seu espaço
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {message || "Verifique sua conexão e tente novamente."}
      </p>
      <button onClick={onRetry} className="button-primary mt-6">
        Tentar novamente
      </button>
      <a href="/" className="mt-4 block text-sm font-black text-[#4285F4]">
        Voltar ao Hub
      </a>
    </section>
  </main>
);
const text = (form: FormData, key: string) => String(form.get(key) ?? "");
const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};
const frameLabels: Record<AvatarFrame, string> = {
  none: "Sem moldura",
  google: "Google",
  gold: "Dourada",
  rainbow: "Arco-íris",
  campus: "Campus",
  gemini: "Gemini Aurora",
  orbit: "Órbita Google",
  pixel: "Pixel Fórum",
  network: "Rede Campus",
  constellation: "Constelação",
  chrome: "Cromo Giratório",
  android: "Android Verde",
  cloud: "Nuvem Flutuante",
  firebase: "Chama Firebase",
  maps: "Mapa em Movimento",
  codejam: "Code Jam",
  community: "Comunidade Viva",
  prism: "Prisma Neon",
  devfest: "DevFest",
  studio: "Studio Pastel",
  spark: "Spark Estelar",
  material: "Material Color",
  heart: "Coração da comunidade",
  applause: "Aplausos da conversa",
  comet: "Cometa social",
  aura: "Aura de conversa",
  mosaic: "Mosaico do apoio",
};
const frameRequirements: Partial<Record<AvatarFrame, string>> = {
  gold: "Crie 1 evento",
  rainbow: "Complete o perfil",
  gemini: "Ideias em movimento · Nível 2",
  orbit: "Explorador de eventos · Nível 2",
  pixel: "Guardião das conversas · Nível 2",
  network: "Construtor de rede · Nível 2",
  constellation: "Conector do Hub · Nível 1",
  chrome: "Complete o perfil",
  android: "Explorador de eventos · Nível 1",
  cloud: "Guardião das conversas · Nível 1",
  firebase: "Ideias em movimento · Nível 3",
  maps: "Criador de encontros · Nível 2",
  codejam: "Construtor de rede · Nível 1",
  community: "Voz da comunidade · Nível 2",
  prism: "Ideias em movimento · Nível 4",
  devfest: "Criador de encontros · Nível 3",
  studio: "Em rede · Nível 2",
  spark: "Conector do Hub · Nível 1",
  heart: "Perfil que inspira · Nível 1",
  applause: "Conversas que marcam · Nível 1",
  comet: "Perfil que inspira · Nível 3",
  aura: "Conversas que marcam · Nível 3",
  mosaic: "Apoiador da comunidade · Nível 2",
};
const isFrameUnlocked = (frame: AvatarFrame, badges: DashboardData["badges"]) => {
  const requirements: Partial<Record<AvatarFrame, { badge: DashboardData["badges"][number]["id"]; level: number }>> = {
    gold: { badge: "event-maker", level: 1 }, rainbow: { badge: "profile-ready", level: 1 }, gemini: { badge: "first-message", level: 2 }, orbit: { badge: "event-explorer", level: 2 }, pixel: { badge: "forum-host", level: 2 }, network: { badge: "group-builder", level: 2 }, constellation: { badge: "connector", level: 1 }, chrome: { badge: "profile-ready", level: 1 }, android: { badge: "event-explorer", level: 1 }, cloud: { badge: "forum-host", level: 1 }, firebase: { badge: "first-message", level: 3 }, maps: { badge: "event-maker", level: 2 }, codejam: { badge: "group-builder", level: 1 }, community: { badge: "forum-member", level: 2 }, prism: { badge: "first-message", level: 4 }, devfest: { badge: "event-maker", level: 3 }, studio: { badge: "group-member", level: 2 }, spark: { badge: "connector", level: 1 }, heart: { badge: "profile-love", level: 1 }, applause: { badge: "comment-love", level: 1 }, comet: { badge: "profile-love", level: 3 }, aura: { badge: "comment-love", level: 3 }, mosaic: { badge: "supporter", level: 2 },
  };
  const requirement = requirements[frame];
  return !requirement || badges.some((badge) => badge.id === requirement.badge && badge.level >= requirement.level);
};

const AsyncForumConversation = ({
  forum,
  onClose,
  onSent,
}: {
  forum: CommunityForum;
  onClose: () => void;
  onSent: () => void;
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [members, setMembers] = useState<ForumMember[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const upsertMessage = (message: ForumMessage) =>
    setMessages((current) => {
      const index = current.findIndex((item) => item.id === message.id);
      if (index === -1) return [...current, message];
      return current.map((item) =>
        item.id === message.id ? { ...item, ...message } : item,
      );
    });
  const refreshMembers = () =>
    authApi
      .listForumMembers(forum.id)
      .then(({ members: items }) => setMembers(items))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Nao foi possivel atualizar os participantes.",
        ),
      );

  useEffect(() => {
    let active = true;
    setError("");
    void Promise.all([
      authApi.listForumMessages(forum.id),
      authApi.listForumMembers(forum.id),
    ])
      .then(([messageResult, memberResult]) => {
        if (active) {
          setMessages(messageResult.messages);
          setMembers(memberResult.members);
        }
      })
      .catch(
        (reason) =>
          active &&
          setError(
            reason instanceof Error
              ? reason.message
              : "Nao foi possivel carregar a conversa.",
          ),
      );
    return () => {
      active = false;
    };
  }, [forum.id]);

  const me = members.find((member) => member.id === user?.id);
  const canModerate =
    me?.role === "owner" || me?.role === "admin" || me?.role === "moderator";
  const mentionMatch = content.match(/(?:^|\s)@([\p{L}\p{N}_-]*)$/u);
  const mentionQuery = mentionMatch?.[1]?.toLocaleLowerCase() ?? "";
  const suggestions = mentionMatch
    ? members
        .filter(
          (member) =>
            !member.isBot &&
            member.id !== user?.id &&
            (member.nickname ?? member.name)
              .toLocaleLowerCase()
              .includes(mentionQuery),
        )
        .slice(0, 5)
    : [];
  const selectMention = (member: ForumMember) => {
    const tag = (member.nickname ?? member.name).trim().split(/\s+/)[0];
    setContent((current) =>
      current.replace(/@([\p{L}\p{N}_-]*)$/u, `@${tag} `),
    );
  };
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = content.trim();
    if (!value) return;
    setSending(true);
    setError("");
    try {
      const { message } = await authApi.sendForumMessage(forum.id, value);
      upsertMessage(message);
      setContent("");
      onSent();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Nao foi possivel enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  };
  const toggleLike = async (messageId: string) => {
    try {
      const { message } = await authApi.toggleForumMessageLike(
        forum.id,
        messageId,
      );
      upsertMessage(message);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Nao foi possivel reagir a mensagem.",
      );
    }
  };
  const manage = async (
    member: ForumMember,
    input: Parameters<typeof authApi.updateForumMember>[2],
  ) => {
    try {
      await authApi.updateForumMember(forum.id, member.id, input);
      await refreshMembers();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Nao foi possivel atualizar a permissao.",
      );
    }
  };
  const remove = async (member: ForumMember) => {
    try {
      await authApi.removeForumMember(forum.id, member.id);
      await refreshMembers();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Nao foi possivel remover o participante.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1e293b]/70 p-0 sm:grid sm:place-items-center sm:p-4">
      <section className="flex h-full w-full flex-col bg-white sm:h-[min(85vh,760px)] sm:max-w-5xl sm:rounded-3xl sm:border-3 sm:border-[#1e293b] sm:shadow-hard-black">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black">{forum.title}</h2>
            <p className="text-xs text-slate-600">
              Conversa da comunidade · {members.length} participantes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers((value) => !value)}
              className="button-secondary !min-h-9 !px-3"
            >
              <UsersRound size={15} />
              Participantes
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar conversa"
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <X />
            </button>
          </div>
        </header>
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#EA4335] bg-[#FDECEA] p-3 text-sm font-bold text-[#9b1c13]"
                >
                  {error}
                </p>
              )}
              {messages.length ? (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-2xl p-3 sm:p-4 ${message.isDeleted ? "border border-dashed border-slate-300 bg-slate-100" : "bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar profile={message.author} />
                      <div className="min-w-0">
                        <a
                          href={`/u/${message.author.id}`}
                          className="text-sm font-black hover:text-[#4285F4]"
                        >
                          {message.author.nickname ?? message.author.name}
                        </a>
                        <p className="text-[10px] text-slate-500">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed ${message.isDeleted ? "italic text-slate-500" : "text-slate-700"}`}
                    >
                      {message.isDeleted
                        ? message.content
                        : highlightMentions(message.content)}
                    </p>
                    {!message.isDeleted && (
                      <button
                        type="button"
                        onClick={() => void toggleLike(message.id)}
                        className={`mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black ${message.likedByMe ? "bg-[#FDECEA] text-[#EA4335]" : "text-slate-500 hover:bg-white"}`}
                        aria-label="Curtir mensagem"
                      >
                        <Heart
                          size={14}
                          fill={message.likedByMe ? "currentColor" : "none"}
                        />
                        {message.likes || ""}
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <p className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  Seja a primeira pessoa a compartilhar uma ideia.
                </p>
              )}
            </div>
            <form
              onSubmit={send}
              className="relative border-t-2 border-slate-200 p-3 sm:p-4"
            >
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border-2 border-[#1e293b] bg-white shadow-hard-black sm:left-4 sm:right-auto sm:w-80">
                  {suggestions.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => selectMention(member)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold hover:bg-[#EBF3FE]"
                    >
                      <Avatar profile={member} />@
                      {(member.nickname ?? member.name).trim().split(/\s+/)[0]}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={1000}
                  placeholder="Escreva uma mensagem. Use @ para mencionar."
                  className="input-auth"
                />
                <button
                  disabled={sending}
                  className="button-primary !min-h-10 !px-4"
                >
                  {sending ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-500">
                As mensagens ficam registradas no forum. Respeite a comunidade.
              </p>
            </form>
          </div>
          <aside
            className={`${showMembers ? "block" : "hidden"} overflow-y-auto border-t-2 border-slate-200 bg-slate-50 p-4 lg:block lg:border-l-2 lg:border-t-0`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Participantes
            </p>
            <div className="mt-3 space-y-2">
              {members.map((member) => {
                const canManage = Boolean(
                  canModerate &&
                    !member.isBot &&
                    member.id !== user?.id &&
                    (me?.role === "owner" || member.role === "member"),
                );
                const muted = Boolean(
                  member.mutedUntil && new Date(member.mutedUntil) > new Date(),
                );
                return (
                  <div key={member.id} className="rounded-xl bg-white p-2">
                    <div className="flex items-center gap-2">
                      <Avatar profile={member} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black">
                          {member.nickname ?? member.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                          {member.isBot ? "moderador automatico" : member.role}
                          {member.banned ? " · banido" : ""}
                          {member.readOnly ? " · somente leitura" : ""}
                          {muted ? " · silenciado" : ""}
                        </p>
                      </div>
                    </div>
                    {canManage && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {me?.role === "owner" && (
                          <select
                            value={member.role}
                            onChange={(event) =>
                              void manage(member, {
                                role: event.target.value as
                                  | "admin"
                                  | "moderator"
                                  | "member",
                              })
                            }
                            className="rounded border border-slate-300 bg-white px-1 py-1 text-[10px] font-bold"
                          >
                            <option value="member">Membro</option>
                            <option value="moderator">Moderador</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        {!member.banned && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void manage(member, {
                                  mutedForMinutes: muted ? 0 : 60,
                                })
                              }
                              className="rounded bg-[#FFF8E7] px-2 py-1 text-[10px] font-black text-[#9A6700]"
                            >
                              {muted ? "Desmutar" : "Silenciar"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void manage(member, {
                                  readOnly: !member.readOnly,
                                })
                              }
                              className="rounded bg-[#EBF3FE] px-2 py-1 text-[10px] font-black text-[#4285F4]"
                            >
                              {member.readOnly
                                ? "Liberar escrita"
                                : "Somente leitura"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void remove(member)}
                              className="rounded bg-[#FDECEA] px-2 py-1 text-[10px] font-black text-[#EA4335]"
                            >
                              Remover
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            void manage(member, { banned: !member.banned })
                          }
                          className="rounded bg-[#1e293b] px-2 py-1 text-[10px] font-black text-white"
                        >
                          {member.banned ? "Desbanir" : "Banir"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

const highlightMentions = (content: string) =>
  content.split(/(@[\p{L}\p{N}_-]+)/gu).map((part, index) =>
    part.startsWith("@") ? (
      <mark
        key={index}
        className="rounded bg-[#EBF3FE] px-1 font-bold text-[#1a73e8]"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );

export default Dashboard;
