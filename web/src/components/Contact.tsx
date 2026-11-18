import TeamStatus from "./TeamStatus";
import { HORARIO_TEXTO } from "@/lib/atendimento";

/**
 * Atendimento: a Bruna (assistente virtual) responde 24h; a equipe tem horário,
 * e o status ao vivo diz se está aberta agora. Canais: WhatsApp, Instagram e
 * e-mail quando o admin tiver.
 */
export default function Contact({ whatsappLink, instagram, email }: { whatsappLink: string; instagram: string; email?: string }) {
  const channels = [
    { href: whatsappLink, icon: "fa-brands fa-whatsapp", color: "#25D366", title: "WhatsApp", sub: "Bruna 24h · equipe no horário", external: true },
    { href: instagram, icon: "fa-brands fa-instagram", color: "#ec4899", title: "Instagram", sub: "Novidades e promoções", external: true },
    ...(email ? [{ href: `mailto:${email}`, icon: "fa-solid fa-envelope", color: "#38bdf8", title: "E-mail", sub: email, external: false }] : []),
  ];
  return (
    <div id="contato" style={{ "--glow": "37 211 102" } as React.CSSProperties} className="svc-card spotlight relative h-full">
      <div className="svc-card__head">
        <span className="relative shrink-0">
          <img src="/arte/bruna-rosto.webp" alt="Bruna, assistente virtual da LifeNet" width={200} height={200} loading="lazy" decoding="async"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#25D366]/70 shadow-[0_0_20px_rgba(37,211,102,0.4)]" />
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#0b1424]" aria-hidden="true" />
        </span>
        <div>
          <h3 className="svc-card__title">Atendimento</h3>
          <p className="svc-card__sub">{HORARIO_TEXTO.curto}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="team-status is-open"><span className="team-status__dot" aria-hidden="true" /> Bruna, assistente virtual: online 24h</p>
        <TeamStatus />
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        {channels.map((c) => (
          <a key={c.title} href={c.href} {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
            className="channel group" style={{ "--c": c.color } as React.CSSProperties}>
            <span className="channel__icon"><i aria-hidden="true" className={c.icon} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-sm text-white">{c.title}</span>
              <span className="block text-[11px] text-gray-400 truncate">{c.sub}</span>
            </span>
            <span className="channel__go" aria-hidden="true"><i className="fa-solid fa-arrow-right text-xs" /></span>
          </a>
        ))}
      </div>
    </div>
  );
}
