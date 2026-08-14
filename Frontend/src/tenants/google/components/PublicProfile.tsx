import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, CircleUserRound, ExternalLink, GraduationCap, Heart, Link2, LoaderCircle, MessageSquareText, Sparkles, UsersRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, getAvatarUrl, type PublicProfileData } from '../../../services/auth';
import BadgeShelf from './BadgeShelf';
import { updateSeo } from '../../../seo';

const PublicProfile = ({ userId }: { userId: string }) => {
  const { user } = useAuth();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    authApi.getPublicProfile(userId).then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : 'Perfil não encontrado.'));
  }, [userId]);

  useEffect(() => {
    if (!data) return;
    const name = data.profile.nickname ?? data.profile.name;
    updateSeo({
      title: `${name} | Embaixador no GSA Hub`,
      description: data.profile.bio || `Perfil público de ${name}, da ${data.profile.universityName}.`,
      canonical: `${window.location.origin}/u/${userId}`,
      image: getAvatarUrl(data.profile.avatarPath),
      type: 'profile',
      jsonLd: { '@context': 'https://schema.org', '@type': 'Person', name, affiliation: { '@type': 'CollegeOrUniversity', name: data.profile.universityName }, url: `${window.location.origin}/u/${userId}` },
    });
  }, [data, userId]);

  const toggleLike = async () => {
    if (!data || !user || user.id === data.profile.id) return;
    setIsLiking(true);
    try {
      const result = await authApi.toggleProfileLike(data.profile.id);
      setData((current) => current ? { ...current, profile: { ...current.profile, ...result } } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível registrar a curtida.');
    } finally {
      setIsLiking(false);
    }
  };

  if (error && !data) return <NotFound message={error} />;
  if (!data) return <main className="grid min-h-screen place-items-center bg-[#F8FAFE]"><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black shadow-sm"><LoaderCircle className="animate-spin text-[#4285F4]" />Carregando perfil…</div></main>;

  const { profile, stats, badges } = data;
  const name = profile.nickname ?? profile.name;
  const isOwnProfile = user?.id === profile.id;

  return <main className="min-h-screen bg-[#F8FAFE] text-[#1e293b]">
    <div className="grid h-2.5 grid-cols-4"><div className="bg-[#4285F4]" /><div className="bg-[#EA4335]" /><div className="bg-[#FBBC04]" /><div className="bg-[#34A853]" /></div>
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-9">
      <a href="/" className="inline-flex items-center gap-2 text-sm font-black hover:text-[#4285F4]"><ArrowLeft size={16} />Voltar ao Hub</a>
      <section className="mt-5 overflow-hidden rounded-3xl border-2 border-[#1e293b] bg-white shadow-hard-black">
        <div className="h-20 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] sm:h-28" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <Avatar profile={profile} />
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#FFF8E7] px-3 py-1 text-xs font-black text-[#9A6700]">{profile.userType === 'ambassador' ? 'Embaixador 2026' : 'Membro do Hub'}</span>
              <span className="rounded-full bg-[#EBF3FE] px-3 py-1 text-xs font-black text-[#4285F4]">{stats.badgesEarned} selos</span>
              {!isOwnProfile && (user ? <button type="button" disabled={isLiking} onClick={() => void toggleLike()} aria-pressed={profile.likedByMe} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black transition disabled:opacity-60 ${profile.likedByMe ? 'bg-[#FDECEA] text-[#C5221F]' : 'bg-slate-100 text-slate-600 hover:bg-[#FDECEA] hover:text-[#C5221F]'}`}><Heart size={14} fill={profile.likedByMe ? 'currentColor' : 'none'} />{profile.likes} {profile.likes === 1 ? 'curtida' : 'curtidas'}</button> : <a href="/login" className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-[#FDECEA] hover:text-[#C5221F]"><Heart size={14} />{profile.likes} {profile.likes === 1 ? 'curtida' : 'curtidas'}</a>)}
            </div>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600"><GraduationCap size={18} className="text-[#4285F4]" />{profile.universityName}</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-700">{profile.bio || 'Este membro ainda não adicionou uma bio.'}</p>
          <PublicLinks profile={profile} />
        </div>
      </section>
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      <section className="mt-6 grid gap-4 sm:grid-cols-4"><Stat icon={Sparkles} label="Selos" value={stats.badgesEarned} color="blue" /><Stat icon={CalendarDays} label="Eventos criados" value={stats.eventsCreated} color="red" /><Stat icon={MessageSquareText} label="Fóruns criados" value={stats.forumsCreated} color="yellow" /><Stat icon={UsersRound} label="Grupos criados" value={stats.groupsCreated} color="green" /></section>
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(30,41,59,.07)] sm:p-7"><div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-[11px] font-black uppercase tracking-[.16em] text-[#B77900]">Coleção de troféus</span><h2 className="mt-1 text-2xl font-black text-[#17233A]">Conquistas de {name}</h2><p className="mt-1 text-sm text-slate-500">Cada nível representa uma nova etapa na sua jornada.</p></div><span className="w-fit rounded-full bg-[#F2F6FC] px-3 py-1 text-xs font-black text-slate-600">{badges.length} conquistados</span></div><div className="mt-5">{badges.length ? <BadgeShelf badges={badges} /> : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">As primeiras conquistas aparecem conforme a pessoa usa o Hub.</p>}</div></section>
      <p className="mt-8 text-center text-xs text-slate-500">Projeto acadêmico independente, sem vínculo oficial com a Google LLC.</p>
    </div>
  </main>;
};

const Avatar = ({ profile }: { profile: PublicProfileData['profile'] }) => <span className={`avatar-frame avatar-frame-${profile.avatarFrame} h-24 w-24`}><span className="avatar-inner">{getAvatarUrl(profile.avatarPath) ? <img src={getAvatarUrl(profile.avatarPath)} alt="" /> : <CircleUserRound size={50} />}</span></span>;
const PublicLinks = ({ profile }: { profile: PublicProfileData['profile'] }) => { const links = [{ value: profile.githubUrl, label: 'GitHub' }, { value: profile.linkedinUrl, label: 'LinkedIn' }, { value: profile.instagramUrl, label: 'Instagram' }]; return <div className="mt-5 flex flex-wrap gap-2">{links.map(({ value, label }) => value && <a key={label} href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-black hover:border-[#4285F4] hover:text-[#4285F4]"><Link2 size={15} />{label}<ExternalLink size={12} /></a>)}</div>; };
const Stat = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: 'blue' | 'red' | 'yellow' | 'green' }) => <div className="rounded-2xl border-2 border-[#1e293b] bg-white p-4 shadow-hard-black"><Icon className={color === 'blue' ? 'text-[#4285F4]' : color === 'red' ? 'text-[#EA4335]' : color === 'yellow' ? 'text-[#B77900]' : 'text-[#34A853]'} size={20} /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs font-bold text-slate-600">{label}</p></div>;
const NotFound = ({ message }: { message: string }) => <main className="grid min-h-screen place-items-center bg-[#F8FAFE] p-4"><section className="max-w-md rounded-3xl border-2 border-[#1e293b] bg-white p-7 text-center shadow-hard-black"><Link2 className="mx-auto text-[#4285F4]" size={32} /><h1 className="mt-4 text-2xl font-black">Perfil indisponível</h1><p className="mt-2 text-sm text-slate-600">{message}</p><a href="/" className="button-primary mt-6">Voltar ao Hub</a></section></main>;

export default PublicProfile;
