import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { authApi, type AmbassadorPublicProfile } from "../../../../services/auth";
import { getCrossSubdomainUrl } from "../../../../utils/subdomain";
import {
  Building2,
  MapPin,
  ShieldCheck,
  GraduationCap,
  Heart,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Share2,
} from "lucide-react";

export default function AmbassadorProfileView({ identifier }: { identifier: string }) {
  const [profile, setProfile] = useState<AmbassadorPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    authApi
      .getAmbassadorProfile(identifier)
      .then((res) => {
        setProfile(res.profile);
        setLikes(res.profile.likes);
        setLikedByMe(res.profile.likedByMe);
      })
      .catch((err) => {
        setError(err?.message ?? "Não foi possível carregar o perfil deste Ambassador.");
      })
      .finally(() => setLoading(false));
  }, [identifier]);

  const handleLike = async () => {
    if (!profile || liking) return;
    setLiking(true);
    try {
      const res = await authApi.toggleAmbassadorLike(profile.id);
      setLikes(res.likes);
      setLikedByMe(res.likedByMe);
    } catch {
      // Ignore like error
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-28">
          <p className="text-sm font-black text-[#1e293b]">Carregando perfil do Ambassador...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-32 text-center space-y-4">
          <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FCE8E6] border-2 border-[#EA4335] text-[#EA4335] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#1e293b]">Ambassador não encontrado</h2>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              {error || "O perfil solicitado não existe ou está configurado como privado."}
            </p>
            <div className="pt-2">
              <a
                href={getCrossSubdomainUrl("CONNECT", "/ambassadors")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Diretório de Ambassadors
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] font-sans selection:bg-[#FBBC04] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-12 space-y-6 relative z-10">
        {/* Back Link */}
        <a
          href={getCrossSubdomainUrl("CONNECT", "/ambassadors")}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#4285F4] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Ambassadors
        </a>

        {/* Profile Card Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-3 border-[#1e293b] space-y-6 shadow-hard-black relative overflow-hidden">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 pb-2 border-b-2 border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
            <span className="text-2xs font-mono font-bold text-slate-400 ml-2">
              studentembassador.com/ambassadors/{profile.nickname || profile.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-100 border-3 border-[#1e293b] flex items-center justify-center text-[#1e293b] text-2xl sm:text-3xl font-black shrink-0 overflow-hidden shadow-2xs">
                {profile.avatarPath ? (
                  <img src={profile.avatarPath} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1e293b]">{profile.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-xl text-2xs font-mono font-black uppercase bg-[#FFF8E1] text-[#B45309] border-2 border-[#FBBC04] flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-[#B45309]" />
                    Ambassador
                  </span>
                </div>

                {profile.nickname && (
                  <div className="text-xs font-mono font-bold text-slate-500">@{profile.nickname}</div>
                )}

                {profile.course && (
                  <div className="text-xs text-[#475569] font-bold flex items-center gap-1.5 pt-0.5">
                    <GraduationCap className="w-4 h-4 text-[#34A853]" />
                    {profile.course}
                  </div>
                )}
              </div>
            </div>

            {/* Like and Share Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border-2 border-[#1e293b] cursor-pointer ${
                  likedByMe
                    ? "bg-[#FCE8E6] text-[#EA4335] border-[#EA4335] shadow-[2px_2px_0px_#EA4335]"
                    : "bg-white text-[#1e293b] hover:bg-slate-50 shadow-hard-black"
                }`}
              >
                <Heart className={`w-4 h-4 ${likedByMe ? "fill-[#EA4335] text-[#EA4335]" : "text-slate-400"}`} />
                {likes} reconhecimentos
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed pt-3 border-t-2 border-slate-100">
              {profile.bio}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 pt-3 border-t-2 border-slate-100">
            {profile.campusSlug && (
              <a
                href={getCrossSubdomainUrl("CAMPUS", `/${profile.campusSlug}`)}
                className="px-3.5 py-2 rounded-xl bg-[#E8F0FE] hover:bg-[#D2E3FC] border-2 border-[#4285F4] text-[#1D4ED8] text-xs font-black flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-[#4285F4]" />
                Campus: {profile.campusName || profile.universityName}
                <ExternalLink className="w-3 h-3 text-[#4285F4]" />
              </a>
            )}

            {profile.region && (
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-[#1e293b] text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
                Região {profile.region} {profile.city && `· ${profile.city}, ${profile.state}`}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
