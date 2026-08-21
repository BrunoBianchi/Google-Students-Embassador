import { ArrowLeft, Home, Map, SearchX } from "lucide-react";
import { useEffect } from "react";
import { updateSeo } from "../../../seo";
import Logo from "./Logo";

export default function NotFoundPage() {
  useEffect(() => {
    updateSeo({
      title: "Página não encontrada | Campus Ambassador Hub",
      description: "A página solicitada não existe ou foi movida.",
      canonical: window.location.href,
      noIndex: true,
    });
  }, []);

  return <main className="grid min-h-screen place-items-center bg-[#f8faff] px-4 py-10 text-[#1e293b]">
    <section className="w-full max-w-xl rounded-3xl border-3 border-[#1e293b] bg-white p-6 text-center shadow-hard-black sm:p-10">
      <a href="/" className="mx-auto inline-flex" aria-label="Página inicial"><Logo size="md" /></a>
      <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-3xl border-2 border-[#EA4335] bg-[#FCE8E6] text-[#C5221F]"><SearchX size={38} /></div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#EA4335]">Erro 404</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">Essa página não existe.</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">Confira o endereço informado ou volte para uma das áreas disponíveis do Campus Ambassador Hub.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <a href="/" className="button-primary justify-center"><Home size={17} /> Ir para o início</a>
        <a href="/map" className="button-secondary justify-center"><Map size={17} /> Abrir o mapa</a>
      </div>
      <button type="button" onClick={() => window.history.back()} className="mt-5 inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-[#1e293b]"><ArrowLeft size={15} /> Voltar à página anterior</button>
    </section>
  </main>;
}

