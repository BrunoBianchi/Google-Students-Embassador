import React, { useState } from 'react';
import { CalendarDays, Check, CircleUserRound, GraduationCap, Heart, Link2, MessageSquareText, MessagesSquare, Network, Share2, Sparkles, Star, ThumbsUp, UsersRound } from 'lucide-react';
import type { Badge } from '../../../services/auth';

const trophyIcons: Record<Badge['id'], React.ElementType> = {
  campus: GraduationCap, 'forum-host': MessagesSquare, 'forum-member': MessageSquareText, 'first-message': Sparkles,
  'event-maker': CalendarDays, 'event-explorer': Star, 'group-builder': UsersRound, 'group-member': Network,
  connector: Link2, 'profile-ready': CircleUserRound, 'profile-love': Heart, 'comment-love': MessagesSquare, supporter: ThumbsUp,
};
const levels = [
  { name: 'Iniciante', from: '#DDEEFF', to: '#4285F4', stroke: '#2468CA', accent: '#2878E8' },
  { name: 'Em evolução', from: '#DDFAE7', to: '#34A853', stroke: '#17803D', accent: '#238D47' },
  { name: 'Destaque', from: '#FFF4CC', to: '#F1A500', stroke: '#B77400', accent: '#B77400' },
  { name: 'Especialista', from: '#F2E5FF', to: '#9265DE', stroke: '#6840AB', accent: '#774AC0' },
  { name: 'Lendário', from: '#F8FCFF', to: '#9B7AF4', stroke: '#6244B8', accent: '#6946C7' },
];

export const formatBadgeDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(value));
const levelFor = (level: number) => levels[Math.min(Math.max(level, 1), levels.length) - 1]!;
const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement('textarea');
  input.value = value; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0';
  document.body.append(input); input.select(); const didCopy = document.execCommand('copy'); input.remove();
  if (!didCopy) throw new Error('Não foi possível copiar o link.');
};

const TrophyMark = ({ badge }: { badge: Badge }) => {
  const style = levelFor(badge.level);
  const Icon = trophyIcons[badge.id];
  const gradientId = `trophy-${badge.id}-${badge.level}`;
  return <div className="relative h-[84px] w-[72px] shrink-0" aria-label={`${badge.title}, nível ${badge.level}`}>
    <svg viewBox="0 0 100 110" className="h-full w-full overflow-visible" role="img">
      <defs><linearGradient id={gradientId} x1="18" y1="10" x2="82" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor={style.from} /><stop offset="1" stopColor={style.to} /></linearGradient></defs>
      {badge.level >= 3 && <path d="M17 59C5 67 8 87 23 94M83 59c12 8 9 28-6 35" stroke={style.stroke} strokeWidth="4" strokeLinecap="round" opacity=".8" />}
      {badge.level >= 4 && <path d="m33 23 7 6 10-12 10 12 7-6v14H33V23Z" fill={style.stroke} stroke="white" strokeWidth="2" />}
      <path d="M50 8 88 30v43L50 95 12 73V30L50 8Z" fill="white" />
      <path d="M50 13 83 32v38L50 89 17 70V32l33-19Z" fill={`url(#${gradientId})`} stroke={style.stroke} strokeWidth="2.5" />
      {badge.level >= 2 && <path d="M50 22 75 36v30L50 80 25 66V36l25-14Z" stroke="white" strokeWidth="2" opacity=".8" />}
      {badge.level >= 5 && <><path d="m20 28 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="white" /><path d="m81 75 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="white" /></>}
    </svg>
    <span className="absolute left-1/2 top-[38%] grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[#14213B] text-white shadow-sm"><Icon size={19} strokeWidth={2.4} /></span>
    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[8px] font-black tracking-wide text-slate-700">LV {badge.level}</span>
  </div>;
};

const TrophyCard = ({ badge, copied, onCopy, onShare }: { badge: Badge; copied: boolean; onCopy: () => void; onShare: () => void }) => {
  const level = levelFor(badge.level);
  const completion = Math.min(100, Math.round((badge.progress / (badge.nextTarget ?? badge.target)) * 100));
  const next = badge.nextTarget ? `Próximo nível: ${badge.nextTarget} ações` : 'Coleção concluída';
  return <article className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(30,41,59,.08)]">
    <TrophyMark badge={badge} />
    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: level.accent }}>{level.name} · nível {badge.level}</p><button type="button" onClick={onShare} aria-label={`Compartilhar ${badge.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#4285F4]"><Share2 size={15} /></button></div><h3 className="mt-1 truncate text-[15px] font-black text-[#17233A]">{badge.title}</h3><p className="mt-1 text-xs text-slate-500">{badge.progress} ações · {next}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${completion}%`, background: level.accent }} /></div><div className="mt-2 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400">{formatBadgeDate(badge.earnedAt)}</span><button type="button" onClick={onCopy} className="inline-flex items-center gap-1 text-[10px] font-black text-[#4285F4] hover:underline"><Link2 size={11} />{copied ? <><Check size={11} />Copiado</> : 'Copiar link'}</button></div></div>
  </article>;
};

const BadgeShelf = ({ badges, compact = false }: { badges: Badge[]; compact?: boolean }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const trophyLink = (badge: Badge) => { const url = new URL(window.location.href); url.searchParams.set('trofeu', badge.id); url.searchParams.set('nivel', String(badge.level)); url.hash = 'trofeus'; return url.toString(); };
  const rememberCopy = (badge: Badge) => { setCopiedId(badge.id); window.setTimeout(() => setCopiedId((id) => id === badge.id ? null : id), 2200); };
  const copyLink = async (badge: Badge) => { await copyText(trophyLink(badge)); rememberCopy(badge); };
  const share = async (badge: Badge) => {
    const url = trophyLink(badge);
    if (!navigator.share) return copyLink(badge);
    try { await navigator.share({ title: `${badge.title} · Nível ${badge.level}`, text: `Conquistei ${badge.title}, nível ${badge.level}, no Google Students Ambassador Hub!`, url }); } catch (error) { if ((error as DOMException).name !== 'AbortError') await copyLink(badge); }
  };
  const cards = <div className="grid gap-3 sm:grid-cols-2">{badges.map((badge) => <TrophyCard key={badge.id} badge={badge} copied={copiedId === badge.id} onCopy={() => void copyLink(badge)} onShare={() => void share(badge)} />)}</div>;
  return compact ? cards : <section id="trofeus" className="rounded-3xl border border-slate-200 bg-[#F8FAFE] p-3 sm:p-5">{cards}</section>;
};

export default BadgeShelf;
