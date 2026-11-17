import type { Plan } from "@/lib/site-api";
import type { CSSProperties } from "react";
import SectionHead from "./SectionHead";

/** Mesma lógica de cores do index.php: popular > mais vendido > selo custom > padrão azul. */
function styleFor(p: Plan) {
  // Só #rrggbb: os sufixos 33/b3 (alpha) e o style dependem disso; evita CSS extra vindo do admin
  const c = /^#[0-9a-f]{6}$/i.test(p.custom_badge_color) ? p.custom_badge_color : "#007BFF";
  const custom = !!p.custom_badge;
  if (p.popular) {
    return {
      card: { borderColor: "#FF8C00", boxShadow: "0 0 20px rgba(255,140,0,0.3)" },
      badge: { background: "linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%)" },
      badgeText: ["Melhor Custo", "Benefício"],
      speed: { color: "#FF8C00", textShadow: "0 0 15px rgba(255, 140, 0, 0.7)" },
      unit: { color: "#FF8C00" },
      perMonth: "text-white", perMonthStyle: {},
      price: { color: "#fff" },
      icon: { color: "#FF8C00", textShadow: "0 0 15px rgba(255, 140, 0, 0.7)" },
      btn: { background: "linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%)", boxShadow: "0 0 30px rgba(255,140,0,0.6)" },
    };
  }
  if (p.best_seller) {
    return {
      card: { borderColor: "#22c55e", boxShadow: "0 0 20px rgba(34,197,94,0.3)" },
      badge: { backgroundColor: "#22c55e" },
      badgeText: ["Mais", "Vendido"],
      speed: { color: "#22c55e", textShadow: "0 0 15px rgba(34, 197, 94, 0.7)" },
      unit: { color: "#22c55e" },
      perMonth: "text-green-500", perMonthStyle: {},
      price: { color: "#fff" },
      icon: { color: "#22c55e" },
      btn: { backgroundColor: "#22c55e", boxShadow: "0 0 20px rgba(34,197,94,0.5)" },
    };
  }
  if (custom) {
    return {
      card: { borderColor: c, boxShadow: `0 0 20px ${c}33` },
      badge: { backgroundColor: c },
      badgeText: [p.custom_badge],
      speed: { color: c, textShadow: `0 0 15px ${c}b3` },
      unit: { color: c },
      perMonth: "", perMonthStyle: { color: c },
      price: { color: c },
      icon: { color: c },
      btn: { backgroundColor: c, boxShadow: `0 0 20px ${c}b3` },
    };
  }
  return {
    card: { borderColor: "#007BFF", boxShadow: "0 0 20px rgba(0,123,255,0.3)" },
    badge: { backgroundColor: "#007BFF" },
    badgeText: ["Plano", "Fibra"],
    speed: { color: "#007BFF", textShadow: "0 0 15px rgba(0, 123, 255, 0.7)" },
    unit: { color: "#007BFF" },
    perMonth: "text-[#007BFF]", perMonthStyle: {},
    price: { color: "#007BFF" },
    icon: { color: "#007BFF", textShadow: "0 0 15px rgba(0, 123, 255, 0.7)" },
    btn: { backgroundColor: "#007BFF", boxShadow: "0 0 20px rgba(0,123,255,0.5)" },
  };
}

/** "#rrggbb" → "r g b" pro --glow do .spotlight */
function rgbTriplet(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function glowFor(p: Plan) {
  if (p.popular) return "#FF8C00";
  if (p.best_seller) return "#22c55e";
  if (p.custom_badge && /^#[0-9a-f]{6}$/i.test(p.custom_badge_color)) return p.custom_badge_color;
  return "#007BFF";
}

/** O que vem em todo plano (as promessas que o site já faz). */
const included = ["Wi-Fi dual-band em comodato", "Instalação grátis", "Sem fidelidade", "Assistente virtual 24h no WhatsApp"];
const uses = [
  { icon: "fa-wifi", label: "Wi-Fi" },
  { icon: "fa-gamepad", label: "Jogos" },
  { icon: "fa-tv", label: "Streaming" },
  { icon: "fa-laptop", label: "Trabalho" },
];

/** "79,99" → 79.99 (o admin manda com vírgula). */
function priceNumber(price: string) {
  return Number(price.replace(/\./g, "").replace(",", "."));
}
const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PlanCard({ plan, index, maxMbps }: { plan: Plan; index: number; maxMbps: number }) {
  const s = styleFor(plan);
  const glow = glowFor(plan);
  const hot = plan.popular;
  const card = { ...s.card, "--glow": rgbTriplet(glow), "--accent": glow } as unknown as CSSProperties;
  const [int, cents] = plan.price.split(",");
  const perDay = priceNumber(plan.price) / 30;
  const pct = maxMbps > 0 ? Math.max(12, Math.round((plan.speed_mbps / maxMbps) * 100)) : 100;
  // O data-reveal fica no invólucro: o cartão tem transform próprio (hover e destaque)
  return (
    <div data-reveal data-delay={String(index * 110)} className={hot ? "lg:-mt-3" : "lg:mt-3"}>
      <article data-inview className={`plan-card plan2 spotlight relative flex flex-col h-full ${hot ? "plan-card--hot" : ""}`} style={card}>
        <span className="plan2__watermark" aria-hidden="true">{plan.speed.value}</span>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="plan2__name">{plan.name}</p>
          <span className="plan2__badge" style={s.badge as CSSProperties}>{s.badgeText.join(" ")}</span>
        </div>

        <div className="plan2__speed" style={s.speed}>
          <span className="plan2__num">{plan.speed.value}</span>
          <span className="plan2__unit" style={s.unit}>{plan.speed.unit}</span>
        </div>
        <div className="plan2__meter" aria-hidden="true"><span style={{ "--w": `${pct}%` } as CSSProperties} /></div>

        <div className="plan2__price">
          <span className="plan2__cur">R$</span>
          <span className="plan2__int">{int}</span>
          <span className="plan2__cents">{cents ? `,${cents}` : ""}<small>/mês</small></span>
        </div>
        {Number.isFinite(perDay) && perDay > 0 && (
          <p className="plan2__day">Menos de <strong>R$ {brl(Math.floor(perDay * 10 + 1) / 10)}</strong> por dia</p>
        )}

        <ul className="plan2__list">
          {included.map((t) => (
            <li key={t}>
              <span className="check-dot" style={{ "--accent": glow } as CSSProperties} aria-hidden="true"><i className="fa-solid fa-check" /></span>{t}
            </li>
          ))}
        </ul>

        <ul className="plan2__uses" aria-label="Ideal para">
          {uses.map((u) => (
            <li key={u.label}><i aria-hidden="true" className={`fa-solid ${u.icon}`} />{u.label}</li>
          ))}
        </ul>

        <a href={plan.whatsapp_link} target="_blank" rel="noopener" data-magnetic data-cursor="Assinar"
          className="plan-btn w-full text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-lg" style={s.btn as CSSProperties}>
          Assinar agora <i aria-hidden="true" className="fa-solid fa-arrow-right text-sm" />
        </a>
      </article>
    </div>
  );
}

const sideBenefits = [
  { img: "icone-prepago", color: "blue", title: "Mensalidade pré-paga", text: "Controle total dos seus gastos, sem surpresas no final do mês." },
  { img: "icone-instalacao", color: "orange", title: "Instalação gratuita", text: "Toda a infraestrutura por nossa conta para sua conexão brilhar." },
  { img: "icone-sem-fidelidade", color: "blue", title: "Sem fidelidade", text: "Fique conosco pela qualidade, não por contrato." },
  { img: "roteador", color: "orange", title: "Roteador em comodato", text: "Equipamento de alta qualidade para sua conexão." },
] as const;

export default function Plans({ plans }: { plans: Plan[] }) {
  return (
    <section id="planos" data-rail="Planos" data-cta-hide className="pt-10">
      <SectionHead n="02" eyebrow="Planos" title="Escolha o plano ideal para você" mark="ideal"
        sub="Todos com fibra até o roteador, Wi-Fi dual-band e sem fidelidade. É só escolher a velocidade." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 items-stretch">
        {plans.length > 0 ? plans.map((p, i) => <PlanCard key={p.id} plan={p} index={i} maxMbps={Math.max(...plans.map((x) => x.speed_mbps || 0))} />) : (
          <div data-reveal className="bg-card border border-white/10 rounded-[2.5rem] p-10 lg:col-span-3 text-center">
            <p className="text-gray-400">Nenhum plano cadastrado no momento. Verifique com nossa equipe.</p>
          </div>
        )}
      </div>

      <div data-reveal className="spotlight relative bg-card border border-white/5 rounded-[2rem] p-8 md:p-10 mt-12">
        <div className="absolute top-0 left-8 -translate-y-1/2 bg-[#050b14] px-5 py-1.5 rounded-full border border-white/10">
          <p className="text-[#007BFF] font-bold text-[11px] tracking-[0.3em] uppercase m-0">Em todos os planos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sideBenefits.map((b) => {
            const blue = b.color === "blue";
            return (
              <div key={b.title} className="flex items-start gap-4 group">
                <div className={`benefit-3d w-16 h-16 rounded-2xl ${blue ? "bg-[#007BFF]/10 border-[#007BFF]/20" : "bg-[#FF8C00]/10 border-[#FF8C00]/20"} flex items-center justify-center flex-shrink-0 border`}>
                  <img src={`/arte/${b.img}.webp`} alt="" width={240} height={240} loading="lazy" decoding="async" className="w-[4.5rem] h-[4.5rem] max-w-none object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
