import { useEffect, useRef, useState, type RefObject } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EventCoordinates } from '../../../services/auth';

type ResolvedAddress = { label: string; city?: string; state?: string };
const brazilCenter: EventCoordinates = { lat: -14.235, lng: -51.9253 };
const stateAbbreviations: Record<string, string> = { Acre: 'AC', Alagoas: 'AL', Amapá: 'AP', Amazonas: 'AM', Bahia: 'BA', Ceará: 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', Goiás: 'GO', Maranhão: 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', Pará: 'PA', Paraíba: 'PB', Paraná: 'PR', Pernambuco: 'PE', Piauí: 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', Rondônia: 'RO', Roraima: 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', Sergipe: 'SE', Tocantins: 'TO' };
const markerIcon = (active = false) => L.divIcon({ className: 'gsa-map-marker', html: `<span style="display:grid;place-items:center;width:${active ? 34 : 28}px;height:${active ? 34 : 28}px;border:3px solid #fff;border-radius:9999px;background:${active ? '#EA4335' : '#4285F4'};box-shadow:0 2px 7px rgba(15,23,42,.35);color:#fff;font-size:15px;line-height:1">●</span>`, iconSize: [active ? 34 : 28, active ? 34 : 28], iconAnchor: [active ? 17 : 14, active ? 17 : 14] });
const locationError = (error: GeolocationPositionError) => error.code === 1 ? 'Permissão de localização negada. Libere o acesso nas configurações do navegador e tente novamente.' : error.code === 2 ? 'Sua localização não está disponível agora. Tente novamente em alguns instantes.' : 'A localização demorou demais. Verifique a conexão e tente novamente.';

const useBaseMap = (containerRef: RefObject<HTMLDivElement | null>, coordinates?: EventCoordinates, interactive = true) => {
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial = coordinates ?? brazilCenter;
    const map = L.map(containerRef.current, { zoomControl: interactive, dragging: interactive, scrollWheelZoom: false, doubleClickZoom: interactive, touchZoom: interactive, keyboard: interactive, attributionControl: true }).setView([initial.lat, initial.lng], coordinates ? 14 : 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    mapRef.current = map;
    const invalidate = () => map.invalidateSize({ animate: false, pan: false });
    const observer = new ResizeObserver(invalidate);
    observer.observe(containerRef.current);
    const frame = window.requestAnimationFrame(invalidate);
    window.addEventListener('resize', invalidate);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', invalidate); observer.disconnect(); map.remove(); mapRef.current = null; };
  }, [containerRef, interactive]);
  return mapRef;
};

const resolveAddress = async (coordinates: EventCoordinates): Promise<ResolvedAddress | undefined> => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.search = new URLSearchParams({ format: 'jsonv2', lat: String(coordinates.lat), lon: String(coordinates.lng), zoom: '18', addressdetails: '1' }).toString();
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Não foi possível obter o endereço.');
  const result = await response.json() as { display_name?: string; address?: Record<string, string> };
  if (!result.display_name) return undefined;
  const address = result.address ?? {};
  const city = address.city ?? address.town ?? address.municipality ?? address.village ?? address.county;
  const state = address.state ? stateAbbreviations[address.state] ?? address.state : undefined;
  return { label: result.display_name.slice(0, 280), city, state };
};

export const EventLocationPicker = ({ coordinates, onChange, onAddressChange, searchQuery, interactive = true }: { coordinates?: EventCoordinates; onChange?: (coordinates: EventCoordinates) => void; onAddressChange?: (address: ResolvedAddress) => void; searchQuery?: string; interactive?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useBaseMap(containerRef, coordinates, interactive);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const addressRequestRef = useRef(0);
  const [searchStatus, setSearchStatus] = useState('');
  const [locating, setLocating] = useState(false);
  onChangeRef.current = onChange;
  const updateAddress = async (next: EventCoordinates) => {
    if (!interactive || !onAddressChange) return;
    const request = ++addressRequestRef.current;
    setSearchStatus('Obtendo o endereço completo do pin…');
    try {
      const address = await resolveAddress(next);
      if (request !== addressRequestRef.current) return;
      if (address) { onAddressChange(address); setSearchStatus('Endereço completo preenchido a partir da marcação do mapa.'); }
      else setSearchStatus('Não encontramos o endereço deste ponto. Você pode informar o local manualmente.');
    } catch {
      if (request === addressRequestRef.current) setSearchStatus('Não foi possível obter o endereço agora. Você pode informar o local manualmente.');
    }
  };
  const putUserMarker = (next: EventCoordinates) => {
    const map = mapRef.current;
    if (!map) return;
    if (!userMarkerRef.current) userMarkerRef.current = L.marker([next.lat, next.lng], { icon: markerIcon(false) }).addTo(map).bindTooltip('Você está aqui', { direction: 'top' });
    else userMarkerRef.current.setLatLng([next.lat, next.lng]);
    map.setView([next.lat, next.lng], 15);
  };
  const choosePoint = (next: EventCoordinates) => { onChangeRef.current?.(next); void updateAddress(next); };
  const useMyLocation = () => {
    if (!navigator.geolocation) { setSearchStatus('Seu navegador não oferece suporte à localização.'); return; }
    setLocating(true); setSearchStatus('Pedindo permissão para acessar sua localização…');
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { lat: Number(position.coords.latitude.toFixed(6)), lng: Number(position.coords.longitude.toFixed(6)) };
      putUserMarker(next);
      if (interactive) choosePoint(next);
      else setSearchStatus('Sua localização foi marcada em azul no mapa.');
      setLocating(false);
    }, (error) => { setSearchStatus(locationError(error)); setLocating(false); }, { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 });
  };
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const setPin = (next: EventCoordinates, shouldCenter = false) => {
      if (!markerRef.current) markerRef.current = L.marker([next.lat, next.lng], { icon: markerIcon(true) }).addTo(map);
      else markerRef.current.setLatLng([next.lat, next.lng]);
      if (shouldCenter) map.setView([next.lat, next.lng], 15);
      window.requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    };
    if (coordinates) setPin(coordinates, true);
    if (!interactive) return;
    const onMapClick = (event: L.LeafletMouseEvent) => choosePoint({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) });
    map.on('click', onMapClick);
    return () => { map.off('click', onMapClick); };
  }, [coordinates, interactive, mapRef]);
  const searchCity = async () => {
    if (!searchQuery?.trim() || !mapRef.current) return;
    setSearchStatus('Buscando cidade…');
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'br', q: searchQuery }).toString();
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const results = await response.json() as Array<{ lat: string; lon: string }>;
      const first = results[0];
      if (!first) { setSearchStatus('Não encontramos essa cidade. Ajuste o texto e tente novamente.'); return; }
      const next = { lat: Number(first.lat), lng: Number(first.lon) };
      mapRef.current.setView([next.lat, next.lng], 13); choosePoint(next);
      setSearchStatus('Cidade encontrada. Clique no mapa para ajustar o pin exatamente.');
    } catch { setSearchStatus('Não foi possível localizar a cidade agora. Você ainda pode marcar o ponto manualmente.'); }
  };
  return <div className="rounded-2xl border-2 border-slate-200 p-3 sm:p-4"><div className="mb-3 flex flex-col gap-2"><p className="text-xs font-bold text-slate-600">{interactive ? 'Busque a cidade, use sua localização ou clique no mapa para posicionar o pin.' : 'Veja o local do evento e, se quiser, marque onde você está.'}</p><div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={locating} onClick={useMyLocation} className="button-primary flex-1 !min-h-9 !px-3 !py-2 text-xs disabled:opacity-60">{locating ? 'Localizando…' : 'Usar minha localização'}</button>{interactive && <button type="button" disabled={!searchQuery?.trim()} onClick={() => void searchCity()} className="button-secondary flex-1 !min-h-9 !px-3 !py-2 text-xs disabled:opacity-50">Buscar cidade</button>}</div></div><div ref={containerRef} className="relative isolate z-0 h-48 overflow-hidden rounded-xl bg-[#EBF3FE] sm:h-64" />{searchStatus && <p role="status" className="mt-3 text-xs font-medium text-slate-600">{searchStatus}</p>}{coordinates && <p className="mt-3 text-xs font-bold text-slate-500">Pin: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>}</div>;
};

export const EventLocationsMap = ({ events, selectedId, onSelect }: { events: Array<{ id: string; title: string; coordinates?: EventCoordinates }>; selectedId?: string; onSelect: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useBaseMap(containerRef, undefined, true);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [locating, setLocating] = useState(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current?.remove();
    const markers = L.layerGroup().addTo(map); markersRef.current = markers;
    const mappable = events.filter((event): event is typeof event & { coordinates: EventCoordinates } => Boolean(event.coordinates));
    const bounds: L.LatLngExpression[] = [];
    mappable.forEach((event) => { const marker = L.marker([event.coordinates.lat, event.coordinates.lng], { icon: markerIcon(event.id === selectedId) }).addTo(markers).bindTooltip(event.title, { direction: 'top' }); marker.on('click', () => onSelect(event.id)); bounds.push([event.coordinates.lat, event.coordinates.lng]); });
    if (bounds.length === 1) map.setView(bounds[0] as L.LatLngExpression, 12);
    if (bounds.length > 1) map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [30, 30], maxZoom: 12 });
  }, [events, mapRef, onSelect, selectedId]);
  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('Seu navegador não oferece suporte à localização.'); return; }
    setLocating(true); setLocationStatus('Pedindo permissão para acessar sua localização…');
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { lat: Number(position.coords.latitude.toFixed(6)), lng: Number(position.coords.longitude.toFixed(6)) }; const map = mapRef.current;
      if (map) { if (!userMarkerRef.current) userMarkerRef.current = L.marker([next.lat, next.lng], { icon: markerIcon(false) }).addTo(map).bindTooltip('Você está aqui', { direction: 'top' }); else userMarkerRef.current.setLatLng([next.lat, next.lng]); map.setView([next.lat, next.lng], 13); }
      setLocationStatus('Sua localização foi marcada em azul.'); setLocating(false);
    }, (error) => { setLocationStatus(locationError(error)); setLocating(false); }, { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 });
  };
  return <div className="rounded-3xl border-3 border-[#1e293b] bg-white p-3 shadow-hard-black"><div className="mb-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-medium text-slate-500">Clique em um pin para filtrar a lista.</p><button type="button" disabled={locating} onClick={useMyLocation} className="button-secondary w-full !min-h-9 !px-3 !py-2 text-xs disabled:opacity-60 sm:w-auto">{locating ? 'Localizando…' : 'Usar minha localização'}</button></div><div ref={containerRef} className="relative isolate z-0 h-[320px] overflow-hidden rounded-2xl bg-[#EBF3FE] sm:h-[380px]" />{locationStatus && <p role="status" className="px-2 pt-3 text-xs font-medium text-slate-500">{locationStatus}</p>}</div>;
};
