import React from 'react';

export const eventTagOptions = [
  { value: 'workshop', label: 'Workshop', className: 'border-[#4285F4] bg-[#4285F4] text-white' },
  { value: 'study-jam', label: 'Study Jam', className: 'border-[#34A853] bg-[#34A853] text-white' },
  { value: 'conference', label: 'Conferência', className: 'border-[#EA4335] bg-[#EA4335] text-white' },
  { value: 'meetup', label: 'Meetup', className: 'border-[#B77900] bg-[#FBBC04] text-[#1e293b]' },
  { value: 'hackathon', label: 'Hackathon', className: 'border-[#7C3AED] bg-[#EDE9FE] text-[#5B21B6]' },
  { value: 'talk', label: 'Palestra', className: 'border-[#0284C7] bg-[#E0F2FE] text-[#075985]' },
  { value: 'panel', label: 'Painel', className: 'border-[#C2410C] bg-[#FFF7ED] text-[#9A3412]' },
  { value: 'networking', label: 'Networking', className: 'border-[#0F766E] bg-[#CCFBF1] text-[#115E59]' },
  { value: 'career', label: 'Carreira', className: 'border-[#BE123C] bg-[#FFE4E6] text-[#9F1239]' },
  { value: 'ai', label: 'IA', className: 'border-[#4F46E5] bg-[#EEF2FF] text-[#3730A3]' },
  { value: 'cloud', label: 'Cloud', className: 'border-[#0369A1] bg-[#E0F2FE] text-[#075985]' },
  { value: 'android', label: 'Android', className: 'border-[#4D7C0F] bg-[#ECFCCB] text-[#3F6212]' },
  { value: 'web', label: 'Web', className: 'border-[#A21CAF] bg-[#FAE8FF] text-[#86198F]' },
  { value: 'community', label: 'Comunidade', className: 'border-[#15803D] bg-[#DCFCE7] text-[#166534]' },
] as const;

const tagByValue = new Map(eventTagOptions.map((tag) => [tag.value, tag]));

export const EventTags = ({ tags, limit, className = '' }: { tags: string[]; limit?: number; className?: string }) => {
  const visibleTags = limit ? tags.slice(0, limit) : tags;
  if (!visibleTags.length) return null;
  return <div className={`flex flex-wrap gap-1.5 ${className}`}>{visibleTags.map((value) => {
    const tag = tagByValue.get(value);
    if (!tag) return null;
    return <span key={value} className={`rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${tag.className}`}>{tag.label}</span>;
  })}{limit && tags.length > limit && <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] font-black text-slate-600">+{tags.length - limit}</span>}</div>;
};
