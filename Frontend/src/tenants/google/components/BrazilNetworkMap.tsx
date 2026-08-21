import { useEffect, useRef, useState } from "react";
import { Building2, CalendarDays, ExternalLink, MapPin, UsersRound } from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { authApi, type AmbassadorDirectoryItem, type Campus, type EventDirectoryItem } from "../../../services/auth";
import Navbar from "./Navbar";
import Footer from "./Footer";

type MarkerKind = "ambassador" | "campus" | "event";
type NetworkMarker = { id: string; kind: MarkerKind; title: string; subtitle: string; city?: string; state?: string; coordinates?: { lat: number; lng: number }; href: string };

const brazilCenter = { lat: -14.235, lng: -51.9253 };
const stateCenters: Record<string, { lat: number; lng: number }> = {
  AC: { lat: -9.974, lng: -67.81 }, AL: { lat: -9.665, lng: -35.736 }, AP: { lat: 0.0356, lng: -51.07 }, AM: { lat: -3.119, lng: -60.021 }, BA: { lat: -12.971, lng: -38.501 }, CE: { lat: -3.732, lng: -38.527 }, DF: { lat: -15.794, lng: -47.882 }, ES: { lat: -20.315, lng: -40.312 }, GO: { lat: -16.686, lng: -49.264 }, MA: { lat: -2.53, lng: -44.302 }, MT: { lat: -15.601, lng: -56.097 }, MS: { lat: -20.469, lng: -54.62 }, MG: { lat: -19.916, lng: -43.935 }, PA: { lat: -1.456, lng: -48.49 }, PB: { lat: -7.119, lng: -34.846 }, PR: { lat: -25.429, lng: -49.271 }, PE: { lat: -8.047, lng: -34.877 }, PI: { lat: -5.092, lng: -42.803 }, RJ: { lat: -22.907, lng: -43.173 }, RN: { lat: -5.795, lng: -35.209 }, RS: { lat: -30.034, lng: -51.23 }, RO: { lat: -8.761, lng: -63.901 }, RR: { lat: 2.823, lng: -60.675 }, SC: { lat: -27.595, lng: -48.548 }, SP: { lat: -23.55, lng: -46.633 }, SE: { lat: -10.947, lng: -37.073 }, TO: { lat: -10.184, lng: -48.333 },
};
const kindMeta: Record<MarkerKind, { label: string; color: string }> = {
  ambassador: { label: "Embaixadores", color: "#4285F4" },
  campus: { label: "Instituições", color: "#34A853" },
  event: { label: "Eventos", color: "#EA4335" },
};
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#202124" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#e8eaed" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#202124" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#5f6368" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#202124" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#292a2d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3c4043" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#171717" }] },
];

const loadGoogleMaps = (key: string) => new Promise<any>((resolve, reject) => {
  const existing = (window as any).google?.maps;
  if (existing) return resolve(existing);
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=marker`;
  script.async = true;
  script.onload = () => resolve((window as any).google?.maps);
  script.onerror = () => reject(new Error("Não foi possível carregar a API do Google Maps."));
  document.head.appendChild(script);
});

const toAmbassadorMarker = (ambassador: AmbassadorDirectoryItem): NetworkMarker => ({ id: `ambassador-${ambassador.id}`, kind: "ambassador", title: ambassador.nickname || ambassador.name, subtitle: [ambassador.universityName, ambassador.city, ambassador.state].filter(Boolean).join(" · "), city: ambassador.city, state: ambassador.state, href: `/ambassadors/${ambassador.id}` });
const toCampusMarker = (campus: Campus): NetworkMarker => ({ id: `campus-${campus.id}`, kind: "campus", title: campus.name, subtitle: [campus.city, campus.state, campus.ambassadorCount ? `${campus.ambassadorCount} embaixador(es)` : ""].filter(Boolean).join(" · "), city: campus.city, state: campus.state, href: `/${campus.slug}` });
const toEventMarker = (event: EventDirectoryItem): NetworkMarker => ({ id: `event-${event.id}`, kind: "event", title: event.title, subtitle: [event.city, event.state, new Date(event.startsAt).toLocaleDateString("pt-BR")].filter(Boolean).join(" · "), city: event.city, state: event.state, coordinates: event.coordinates, href: `/events/${event.id}` });

export default function BrazilNetworkMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markerInstances = useRef<any[]>([]);
  const geocoder = useRef<any>(null);
  const resolvedLocations = useRef(new Map<string, { lat: number; lng: number }>());
  const [markers, setMarkers] = useState<NetworkMarker[]>([]);
  const [enabledKinds, setEnabledKinds] = useState<Record<MarkerKind, boolean>>({ ambassador: true, campus: true, event: true });
  const [mapReady, setMapReady] = useState(false);
  const [mapProvider, setMapProvider] = useState<"google" | "preview">("google");
  const [message, setMessage] = useState("Carregando a rede nacional…");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      authApi.getAmbassadors({ limit: 100 }),
      authApi.listCampuses(),
      authApi.getGlobalEvents({ timeframe: "all", limit: 100 }),
    ]).then(([ambassadors, campuses, events]) => {
      if (!cancelled) {
        setMarkers([
          ...ambassadors.ambassadors.map(toAmbassadorMarker),
          ...campuses.campuses.filter((campus) => campus.city && campus.state).map(toCampusMarker),
          ...events.events.filter((event) => event.coordinates || (event.city && event.state)).map(toEventMarker),
        ]);
      }
    }).catch(() => !cancelled && setMessage("Não foi possível carregar os dados da comunidade agora."));

    void authApi.getMapConfig().then(async ({ googleMapsApiKey, googleMapId }) => {
      if (!googleMapsApiKey) {
        if (!cancelled && container.current) {
          const previewMap = L.map(container.current, { zoomControl: true, scrollWheelZoom: false }).setView([brazilCenter.lat, brazilCenter.lng], 4);
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          }).addTo(previewMap);
          (previewMap as any).__provider = "preview";
          map.current = previewMap;
          setMapProvider("preview"); setMapReady(true);
          setMessage("");
        }
        return;
      }
      const maps = await loadGoogleMaps(googleMapsApiKey);
      if (cancelled || !container.current || !maps) return;
      map.current = new maps.Map(container.current, {
        center: brazilCenter, zoom: 4, mapId: googleMapId || undefined,
        streetViewControl: false, mapTypeControl: false, fullscreenControl: true,
        gestureHandling: "cooperative",
        styles: googleMapId ? undefined : darkMapStyles,
      });
      // Advanced markers need a Map ID. Keep the map usable with the regular
      // Maps marker for installations that have configured only a browser key.
      map.current.__usesAdvancedMarkers = Boolean(googleMapId);
      map.current.__provider = "google";
      geocoder.current = new maps.Geocoder();
      setMapProvider("google"); setMapReady(true); setMessage("");
    }).catch((error: Error) => !cancelled && setMessage(error.message));
    return () => {
      cancelled = true;
      markerInstances.current.forEach((marker) => marker.setMap ? marker.setMap(null) : marker.remove ? marker.remove() : marker.map = null);
      if (map.current?.__provider === "preview") map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !container.current || !map.current) return;
    const resizeMap = () => {
      if (mapProvider === "preview") map.current?.invalidateSize?.({ animate: false, pan: false });
      else if ((window as any).google?.maps) (window as any).google.maps.event.trigger(map.current, "resize");
    };
    const observer = new ResizeObserver(resizeMap);
    observer.observe(container.current);
    const frame = window.requestAnimationFrame(resizeMap);
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); };
  }, [mapProvider, mapReady]);

  useEffect(() => {
    if (!mapReady || !map.current) return;
    let cancelled = false;
    markerInstances.current.forEach((marker) => marker.setMap ? marker.setMap(null) : marker.remove ? marker.remove() : marker.map = null);
    markerInstances.current = [];
    if (mapProvider === "preview") {
      const visible = markers.filter((item) => enabledKinds[item.kind]);
      const bounds = L.latLngBounds([]);
      visible.forEach((item, index) => {
        const base = item.coordinates ?? stateCenters[item.state ?? ""];
        if (!base) return;
        const offset = item.coordinates ? 0 : ((index % 7) - 3) * 0.07;
        const position: L.LatLngExpression = [base.lat + offset, base.lng - offset];
        const marker = L.circleMarker(position, { radius: 9, color: "#fff", weight: 2, fillColor: kindMeta[item.kind].color, fillOpacity: 1 })
          .addTo(map.current)
          .bindPopup(`<div style="max-width:230px"><strong>${item.title}</strong><p style="margin:5px 0;color:#475569;font-size:12px">${item.subtitle}</p><a style="color:#1a73e8;font-weight:700;font-size:12px" href="${item.href}">Ver detalhes</a></div>`);
        markerInstances.current.push(marker); bounds.extend(position);
      });
      if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      return () => { cancelled = true; markerInstances.current.forEach((marker) => marker.remove?.()); markerInstances.current = []; };
    }
    const maps = (window as any).google.maps;
    const infoWindow = new maps.InfoWindow();
    const resolveLocation = async (item: NetworkMarker) => {
      if (item.coordinates) return item.coordinates;
      const cacheKey = `${item.city}|${item.state}`;
      const cached = resolvedLocations.current.get(cacheKey);
      if (cached) return cached;
      if (!item.city || !item.state || !geocoder.current) return stateCenters[item.state ?? ""];
      try {
        const result = await geocoder.current.geocode({ address: `${item.city}, ${item.state}, Brasil`, region: "BR" });
        const point = result.results[0]?.geometry?.location;
        if (point) {
          const coordinates = { lat: point.lat(), lng: point.lng() };
          resolvedLocations.current.set(cacheKey, coordinates);
          return coordinates;
        }
      } catch { /* A UF ainda oferece um ponto útil quando a cidade não é encontrada. */ }
      return stateCenters[item.state ?? ""];
    };
    const addMarkers = async () => {
      const visible = markers.filter((item) => enabledKinds[item.kind]);
      const bounds = new maps.LatLngBounds();
      for (const item of visible) {
        const position = await resolveLocation(item);
        if (cancelled || !position) continue;
        const marker = map.current.__usesAdvancedMarkers
          ? new maps.marker.AdvancedMarkerElement({ map: map.current, position, title: item.title, content: new maps.marker.PinElement({ background: kindMeta[item.kind].color, borderColor: "#ffffff", glyphColor: "#ffffff", glyphText: item.kind === "ambassador" ? "●" : item.kind === "campus" ? "◆" : "★" }).element })
          : new maps.Marker({ map: map.current, position, title: item.title, icon: { path: maps.SymbolPath.CIRCLE, fillColor: kindMeta[item.kind].color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 9 } });
        marker.addListener("click", () => {
          infoWindow.setContent(`<div style="max-width:230px;padding:4px;font-family:Arial,sans-serif"><strong>${item.title}</strong><p style="margin:5px 0;color:#475569;font-size:12px">${item.subtitle}</p><a style="color:#1a73e8;font-weight:700;font-size:12px" href="${item.href}">Ver detalhes</a></div>`);
          infoWindow.open({ map: map.current, anchor: marker });
        });
        markerInstances.current.push(marker); bounds.extend(position);
      }
      if (!bounds.isEmpty()) map.current.fitBounds(bounds, 48);
    };
    void addMarkers();
    return () => { cancelled = true; };
  }, [enabledKinds, mapProvider, mapReady, markers]);

  const visibleMarkers = markers.filter((marker) => enabledKinds[marker.kind]);
  const counts = (kind: MarkerKind) => markers.filter((marker) => marker.kind === kind).length;
  return <div className="min-h-screen overflow-x-clip bg-[#f8faff] text-[#1e293b]">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <section className="rounded-[2rem] border-3 border-[#1e293b] bg-[#202124] p-5 text-white shadow-hard-black sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-[#4285F4] px-3 py-1 text-xs font-black"><MapPin size={14} /> MAPA DA COMUNIDADE</span><h1 className="mt-4 text-3xl font-black sm:text-5xl">Brasil conectado, campus por campus.</h1><p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">Veja onde estão embaixadores, instituições e eventos públicos. As localizações são apresentadas por cidade/UF; nenhum endereço pessoal é exibido.</p></div><a href="https://developers.google.com/maps/innovators?hl=pt-br" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#FBBC04] bg-[#FBBC04] px-4 py-3 text-sm font-black text-[#202124] hover:bg-[#f5b300]"><ExternalLink size={16} /> Google Maps Innovators</a></div>
      </section>
      <section className="mt-6 grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative isolate z-0 min-w-0 overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black lg:sticky lg:top-20"><div ref={container} className="relative isolate z-0 h-[58dvh] min-h-[340px] max-h-[560px] w-full bg-[#e8f0fe] sm:h-[64dvh] sm:min-h-[420px] lg:h-[calc(100dvh-7rem)] lg:max-h-[680px]" aria-label="Mapa do Brasil com a comunidade estudantil" />{message && <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-center text-xs font-bold text-slate-700 shadow-lg backdrop-blur-sm sm:text-sm">{message}</div>}</div>
        <aside className="min-w-0 rounded-3xl border-3 border-[#1e293b] bg-white p-5 shadow-hard-black lg:sticky lg:top-20"><h2 className="text-lg font-black">O que aparece no mapa</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Ative as camadas que deseja explorar.</p><div className="mt-5 space-y-3">{(["ambassador", "campus", "event"] as MarkerKind[]).map((kind) => { const Icon = kind === "ambassador" ? UsersRound : kind === "campus" ? Building2 : CalendarDays; return <label key={kind} className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-3 hover:border-slate-400"><input type="checkbox" checked={enabledKinds[kind]} onChange={(event) => setEnabledKinds((current) => ({ ...current, [kind]: event.target.checked }))} className="h-4 w-4 accent-[#4285F4]" /><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: kindMeta[kind].color }}><Icon size={16} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{kindMeta[kind].label}</strong><span className="text-[11px] text-slate-500">{counts(kind)} no mapa</span></span></label>; })}</div><div className="mt-5 rounded-2xl bg-[#f8faff] p-4"><strong className="text-xs">{visibleMarkers.length} pontos visíveis</strong><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Os dados são atualizados a partir dos perfis, campuses e eventos publicados no Hub.</p></div></aside>
      </section>
    </main>
    <Footer />
  </div>;
}
