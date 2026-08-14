type SeoInput = { title: string; description: string; canonical?: string; noIndex?: boolean; image?: string; type?: 'website' | 'article' | 'profile'; jsonLd?: Record<string, unknown> };

const meta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) { node = document.createElement('meta'); node.setAttribute(attribute, key); document.head.appendChild(node); }
  node.content = value;
};

export const updateSeo = ({ title, description, canonical = window.location.href, noIndex = false, image = `${window.location.origin}/logo.png`, type = 'website', jsonLd }: SeoInput) => {
  document.title = title;
  meta('meta[name="description"]', 'name', 'description', description);
  meta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
  meta('meta[property="og:title"]', 'property', 'og:title', title);
  meta('meta[property="og:type"]', 'property', 'og:type', type);
  meta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Google Student Ambassador Hub');
  meta('meta[property="og:locale"]', 'property', 'og:locale', 'pt_BR');
  meta('meta[property="og:description"]', 'property', 'og:description', description);
  meta('meta[property="og:url"]', 'property', 'og:url', canonical);
  meta('meta[property="og:image"]', 'property', 'og:image', image);
  meta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  meta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  meta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  meta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = canonical;
  document.getElementById('gsa-json-ld')?.remove();
  if (jsonLd) { const script = document.createElement('script'); script.id = 'gsa-json-ld'; script.type = 'application/ld+json'; script.text = JSON.stringify(jsonLd); document.head.appendChild(script); }
};
