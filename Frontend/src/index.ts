import { serve, file } from "bun";
import index from "./index.html";
import { join } from "path";

const publicDir = join(import.meta.dir, "..", "public");
const distDir = join(import.meta.dir, "..", "dist");
const defaultSeoApi = "http://localhost:3001/api/2026/google/seo/index";
const isProduction = Bun.env.NODE_ENV === "production";
const serverHost = Bun.env.HOST ?? (isProduction ? "127.0.0.1" : "0.0.0.0");
const canonicalHost = (Bun.env.CANONICAL_HOST ?? "campus.studentembassador.com").toLowerCase();
const apiOrigin = Bun.env.API_ORIGIN ?? "http://127.0.0.1:3001";
const staticDir = isProduction ? distDir : publicDir;
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
const absoluteUrl = (origin: string, path: string) => `${origin}${path}`;
const robots = (origin: string) => `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(origin, "/sitemap.xml")}\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n`;
const llms = (origin: string) => `# Campus Ambassador Hub\n\n> Plataforma independente para estudantes e embaixadores organizarem eventos, fóruns, grupos e iniciativas em universidades brasileiras.\n\n## Conteúdo público\n- [Início](${absoluteUrl(origin, "/")}): visão geral do Hub.\n- [Campuses Universitários](${absoluteUrl(origin, "/campuses")}): diretório de espaços universitários independentes.\n- [Estudantes & IA](${absoluteUrl(origin, "/students")}): Guia acadêmico de Inteligência Artificial e Gemini, funcionamento de LLMs (Transformers, Embeddings, Tokens, Atenção), comparador de prompts e guia anti-alucinação.\n- [Embaixadores](${absoluteUrl(origin, "/ambassadors")}): diretório público de embaixadores.\n- [Eventos](${absoluteUrl(origin, "/events")}): agenda pública de eventos.\n- [Fóruns](${absoluteUrl(origin, "/forums")}): diretório de discussões públicas.\n- [Sitemap](${absoluteUrl(origin, "/sitemap.xml")}): URLs públicas atualizadas.\n\n## Uso de conteúdo e GEO\nUse estas páginas para descoberta, referência e citação acadêmica. Respeite a privacidade: perfis sem opt-in público, painéis e fóruns privados não são indexáveis.\n`;
type SitemapEntry = { path: string; changefreq: string; priority: string; lastmod?: string };

const sitemap = async (origin: string) => {
  const staticPaths: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/campuses", changefreq: "weekly", priority: "0.95" },
    { path: "/students", changefreq: "weekly", priority: "0.95" },
    { path: "/estudantes", changefreq: "weekly", priority: "0.95" },
    { path: "/ambassadors", changefreq: "weekly", priority: "0.8" },
    { path: "/events", changefreq: "weekly", priority: "0.8" },
    { path: "/map", changefreq: "weekly", priority: "0.8" },
    { path: "/forums", changefreq: "weekly", priority: "0.8" },
  ];

  try {
    const response = await fetch(Bun.env.SEO_API_URL ?? defaultSeoApi, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error("SEO index unavailable");
    const index = await response.json() as { events: Array<{ id: string; createdAt?: string; startsAt?: string }>; forums: Array<{ id: string; createdAt?: string }>; profiles: Array<{ id: string }> };
    const entries: SitemapEntry[] = [
      ...staticPaths,
      ...index.events.map((event) => ({ path: `/events/${event.id}`, lastmod: event.startsAt ?? event.createdAt, changefreq: "weekly", priority: "0.9" })),
      ...index.forums.map((forum) => ({ path: `/forums/${forum.id}`, lastmod: forum.createdAt, changefreq: "weekly", priority: "0.6" })),
      ...index.profiles.map((profile) => ({ path: `/u/${profile.id}`, changefreq: "monthly", priority: "0.5" })),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${escapeXml(absoluteUrl(origin, entry.path))}</loc>${entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join("")}</urlset>`;
  } catch {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticPaths.map((entry) => `<url><loc>${escapeXml(absoluteUrl(origin, entry.path))}</loc>${entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join("")}</urlset>`;
  }
};
type SocialCard = {
  title: string;
  description: string;
  image: string;
  type: "website" | "article" | "profile";
  noIndex?: boolean;
  jsonLd: Record<string, unknown>;
};
type SocialResource = "event" | "forum" | "profile";
const escapeHtml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[character]!);
const normalizeText = (value: unknown, fallback: string) => typeof value === "string" && value.trim()
  ? value.replace(/\s+/g, " ").trim().slice(0, 280)
  : fallback;
const publicImageUrl = (value: unknown, origin: string) => {
  if (typeof value !== "string" || !value.trim()) return `${origin}/logo.png`;
  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" || url.origin === origin ? url.toString() : `${origin}/logo.png`;
  } catch { return `${origin}/logo.png`; }
};
const defaultSocialCard = (origin: string): SocialCard => ({
  title: "Campus Ambassador Hub",
  description: "Eventos, fóruns, grupos e conexões para comunidades universitárias independentes.",
  image: `${origin}/logo.png`,
  type: "website",
  jsonLd: { "@context": "https://schema.org", "@type": "WebSite", name: "Campus Ambassador Hub", url: origin },
});
const socialCardFor = async (request: Request): Promise<SocialCard> => {
  const url = new URL(request.url);
  const origin = url.origin;

  if (url.pathname === "/students" || url.pathname === "/estudantes") {
    return {
      title: "Guia do Estudante: Inteligência Artificial & Gemini | Campus Hub",
      description: "Aprenda como LLMs, Transformers e Embeddings funcionam, compare prompts acadêmicos, elimine alucinações e use comandos prontos para estudos universitários.",
      image: `${origin}/logo.png`,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Guia do Estudante: IA Generativa & Estudos Universitários",
        description: "Aprenda arquitetura de LLMs, Transformers, Embeddings, Engenharia de Prompts e rigor acadêmico anti-alucinação.",
        provider: { "@type": "Organization", name: "Campus Ambassador Hub", url: origin },
      },
    };
  }

  const match = url.pathname.match(/^\/(events|forums|u)\/([^/]+)\/?$/);
  if (!match || !match[1] || !match[2]) return defaultSocialCard(origin);

  const resource = ({ events: "event", forums: "forum", u: "profile" } as const)[match[1] as "events" | "forums" | "u"];
  const fallback = defaultSocialCard(origin);
  try {
    const response = await fetch(`${apiOrigin}/api/2026/google/seo/card/${resource}/${encodeURIComponent(match[2])}`, { signal: AbortSignal.timeout(4_000) });
    if (!response.ok) return { ...fallback, title: "Conteúdo indisponível | Campus Ambassador Hub", noIndex: true };
    const data = await response.json() as Record<string, unknown>;
    const title = normalizeText(data.title, fallback.title);
    const description = normalizeText(data.description, fallback.description);
    const image = publicImageUrl(data.image, origin);
    const canonical = url.toString();

    if (resource === "event") {
      return {
        title: `${title} | Evento no Campus Ambassador Hub`, description, image, type: "article",
        jsonLd: { "@context": "https://schema.org", "@type": "Event", name: title, description, image, url: canonical, startDate: data.startsAt, endDate: data.endsAt ?? undefined, location: { "@type": "Place", name: data.location || "Local a confirmar" } },
      };
    }
    if (resource === "profile") {
      return {
        title: `${title} | Perfil no Campus Ambassador Hub`, description, image, type: "profile",
        jsonLd: { "@context": "https://schema.org", "@type": "Person", name: title, description, image, url: canonical, affiliation: data.universityName ? { "@type": "CollegeOrUniversity", name: data.universityName } : undefined },
      };
    }
    return {
      title: `${title} | Fórum no Campus Ambassador Hub`, description, image, type: "article",
      jsonLd: { "@context": "https://schema.org", "@type": "DiscussionForumPosting", headline: title, description, image, url: canonical, author: data.organizerName ? { "@type": "Person", name: data.organizerName } : undefined, interactionStatistic: typeof data.memberCount === "number" ? { "@type": "InteractionCounter", interactionType: "https://schema.org/JoinAction", userInteractionCount: data.memberCount } : undefined },
    };
  } catch {
    return { ...fallback, title: "Conteúdo indisponível | Campus Ambassador Hub", noIndex: true };
  }
};
const removeMeta = (html: string, key: string) => html.replace(new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${key}["'])[^>]*>\\s*`, "gi"), "");
const injectSocialCard = (html: string, card: SocialCard, canonical: string) => {
  const title = escapeHtml(card.title);
  const description = escapeHtml(card.description);
  const image = escapeHtml(card.image);
  const url = escapeHtml(canonical);
  const jsonLd = JSON.stringify(card.jsonLd).replace(/</g, "\\u003c");
  const keys = ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "og:type", "og:title", "og:description", "og:url", "og:image", "og:site_name", "og:locale"];
  const withoutOldMeta = keys.reduce(removeMeta, html)
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>\s*/gi, "")
    .replace(/<script\b[^>]*data-gsa-social-json-ld[^>]*>[\s\S]*?<\/script>\s*/gi, "")
    .replace(/<script\b[^>]*data-campus-social-json-ld[^>]*>[\s\S]*?<\/script>\s*/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const tags = `<meta name="description" content="${description}">\n<meta name="robots" content="${card.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"}">\n<link rel="canonical" href="${url}">\n<meta property="og:type" content="${card.type}">\n<meta property="og:site_name" content="Campus Ambassador Hub">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${image}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${description}">\n<meta name="twitter:image" content="${image}">\n<script type="application/ld+json" data-campus-social-json-ld>${jsonLd}</script>`;
  return withoutOldMeta.replace("</head>", `${tags}\n</head>`);
};
let productionHtml: Promise<string> | undefined;
const renderProductionPage = async (request: Request) => {
  const card = await socialCardFor(request);
  const html = await (productionHtml ??= file(join(distDir, "index.html")).text());
  return new Response(injectSocialCard(html, card, new URL(request.url).toString()), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
  });
};
const allowedProductionHosts = new Set([
  "studentembassador.com",
  "www.studentembassador.com",
  "campus.studentembassador.com",
  "events.studentembassador.com",
  "connect.studentembassador.com",
  "studentambassador.com",
  "www.studentambassador.com",
  "campus.studentambassador.com",
  "events.studentambassador.com",
  "connect.studentambassador.com",
]);

const redirectToCanonicalHost = (request: Request) => {
  if (!isProduction) return null;

  const url = new URL(request.url);
  const host = url.host.toLowerCase();
  if (allowedProductionHosts.has(host)) return null;

  url.protocol = "https:";
  url.host = "campus.studentembassador.com";
  return Response.redirect(url, 308);
};

const canonicalRoute = <T extends Request>(handler: (request: T) => Response | Promise<Response>) => async (request: T) => {
  const redirect = redirectToCanonicalHost(request);
  return redirect ?? handler(request);
};
const proxyApi = async (request: Request) => {
  const redirect = redirectToCanonicalHost(request);
  if (redirect) return redirect;

  try {
    const sourceUrl = new URL(request.url);
    const targetUrl = new URL(`${sourceUrl.pathname}${sourceUrl.search}`, apiOrigin);
    return await fetch(new Request(targetUrl, request));
  } catch {
    return Response.json({ error: "ServiÃ§o da API indisponÃ­vel" }, { status: 502 });
  }
};
const publicRoutes = Object.fromEntries(
  Array.from(new Bun.Glob("**/*").scanSync({ cwd: staticDir, onlyFiles: true }))
    .map((assetPath) => [
      `/${assetPath.replaceAll("\\", "/")}`,
      canonicalRoute(() => new Response(file(join(staticDir, assetPath)))),
    ]),
);
const appRoute = isProduction
  ? canonicalRoute(renderProductionPage)
  : index;

const server = serve({
  hostname: serverHost,
  port: Number(Bun.env.PORT) || 3000,
  routes: {
    ...publicRoutes,
    "/robots.txt": canonicalRoute((request) => new Response(robots(new URL(request.url).origin), { headers: { "Content-Type": "text/plain; charset=utf-8" } })),
    "/llms.txt": canonicalRoute((request) => new Response(llms(new URL(request.url).origin), { headers: { "Content-Type": "text/plain; charset=utf-8" } })),
    "/llms-full.txt": canonicalRoute((request) => new Response(llms(new URL(request.url).origin), { headers: { "Content-Type": "text/plain; charset=utf-8" } })),
    "/sitemap.xml": canonicalRoute(async (request) => new Response(await sitemap(new URL(request.url).origin), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } })),
    "/api/*": proxyApi,
    "/uploads/*": proxyApi,
    "/*": appRoute,
  },
  development: process.env.NODE_ENV !== "production" && { hmr: true, console: true },
});

console.log(`Server running at ${server.url}`);
