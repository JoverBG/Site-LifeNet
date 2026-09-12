// Camada de dados: lê o JSON que o PHP expõe em api/site.php (fase 1).
// O admin continua sendo a fonte da verdade; aqui só se lê.

export type Speed = { value: string; unit: "MEGA" | "GIGA"; label: string };

export type Plan = {
  id: number;
  name: string;
  speed_mbps: number;
  speed: Speed;
  price: string;
  popular: boolean;
  best_seller: boolean;
  custom_badge: string;
  custom_badge_color: string;
  benefits: string[];
  whatsapp_link: string;
};

export type Settings = {
  whatsapp_number: string;
  instagram_link: string;
  logo_top: string;
  logo_footer: string;
  customer_portal_link: string;
  contact_email: string;
  contact_address: string;
  speedtest_url: string;
  logo_top_url: string;
  logo_footer_url: string;
  whatsapp_digits: string;
  whatsapp_link: string;
};

export type Coverage = { id: number; location_name: string; neighborhood: string };
export type CarouselImage = { id: number; image_path: string; url: string; display_order: number };

export type SiteData = {
  settings: Settings;
  plans: Plan[];
  coverage: Coverage[];
  carousel: CarouselImage[];
  generated_at: string;
};

const SITE_API_URL = (process.env.SITE_API_URL ?? "https://lifenett.com.br/api").replace(/\/$/, "");

/** Caminho relativo do webroot PHP (img/x.png, uploads/y.png) → URL na mesma origem. */
export function assetUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return "/" + path.replace(/^\/+/, "");
}

/** Prefixo das chamadas feitas no navegador pro PHP (vazio = mesma origem). */
export function phpUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_PHP_BASE ?? "").replace(/\/$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** Link do WhatsApp com mensagem pronta. */
export function waLink(digits: string, text?: string): string {
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Busca tudo que a home precisa numa chamada só. ISR: o Next guarda a página
 * pronta e revalida a cada 60s; se o PHP falhar numa revalidação, a versão
 * anterior continua no ar (o throw aqui não derruba o site, só o build).
 */
export async function fetchSite(): Promise<SiteData> {
  const res = await fetch(`${SITE_API_URL}/site.php`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`site.php respondeu ${res.status}`);
  const data = (await res.json()) as Partial<SiteData>;
  if (!data?.settings || !Array.isArray(data.plans)) throw new Error("site.php sem settings/plans");
  // Normaliza na borda: o render nunca vê undefined mesmo se o PHP mudar
  return {
    settings: data.settings,
    plans: data.plans.filter((p) => p && p.speed && typeof p.speed.value === "string"),
    coverage: Array.isArray(data.coverage) ? data.coverage : [],
    carousel: Array.isArray(data.carousel) ? data.carousel : [],
    generated_at: data.generated_at ?? new Date().toISOString(),
  };
}
