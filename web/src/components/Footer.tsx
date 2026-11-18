import type { Settings } from "@/lib/site-api";
import { logoUrl } from "@/lib/site-api";

/**
 * Rodapé no formato do tirvu.com.br: marca + redes à esquerda, colunas de
 * links com traço correndo por baixo, e o nome LIFENET gigante em contorno
 * que se preenche ao entrar na tela.
 */
export default function Footer({ settings }: { settings: Settings }) {
  const s = settings;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.contact_address)}`;
  return (
    <footer data-cta-hide className="relative mt-28 border-t border-white/10 bg-[#03070e] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-12">
          <div data-reveal>
            <img src={logoUrl(s.logo_footer)} alt="LifeNet" loading="lazy" decoding="async" className="h-14 mb-6" />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Sua melhor escolha em conectividade. Fibra óptica real, alta performance e o atendimento humano que você sempre quis.
            </p>
            <ul className="flex gap-3 mt-7">
              <li><a href={s.instagram_link} target="_blank" rel="noopener" aria-label="Instagram" className="social-btn hover:!border-pink-500/60 hover:!text-pink-400"><i aria-hidden="true" className="fa-brands fa-instagram" /></a></li>
              <li><a href={s.whatsapp_link} target="_blank" rel="noopener" aria-label="WhatsApp" className="social-btn hover:!border-[#25D366]/60 hover:!text-[#25D366]"><i aria-hidden="true" className="fa-brands fa-whatsapp" /></a></li>
              <li><a href={`mailto:${s.contact_email}`} aria-label="E-mail" className="social-btn"><i aria-hidden="true" className="fa-regular fa-envelope" /></a></li>
            </ul>
          </div>

          <div data-reveal data-delay="80">
            <p className="footer-h">Navegação</p>
            <ul className="space-y-1">
              <li><a href="#inicio" className="footer-link">Início</a></li>
              <li><a href="#planos" className="footer-link">Planos</a></li>
              <li><a href="#como-funciona" className="footer-link">Como funciona</a></li>
              <li><a href="#atendimento" className="footer-link">Cobertura</a></li>
              <li><a href="#faq" className="footer-link">Perguntas frequentes</a></li>
            </ul>
          </div>

          <div data-reveal data-delay="160">
            <p className="footer-h">Cliente</p>
            <ul className="space-y-1">
              <li><a href={s.customer_portal_link} target="_blank" rel="noopener" className="footer-link">Central do Assinante</a></li>
              <li><a href={s.customer_portal_link} target="_blank" rel="noopener" className="footer-link">2ª via de boleto</a></li>
              <li><a href="#app" className="footer-link">App Minha LifeNet</a></li>
              <li><a href={s.whatsapp_link} target="_blank" rel="noopener" className="footer-link">Falar com a Bruna (24h)</a></li>
              <li><a href="#status" className="footer-link">Status dos serviços</a></li>
            </ul>
          </div>

          <div data-reveal data-delay="240">
            <p className="footer-h">Fale conosco</p>
            <ul className="space-y-2 text-sm">
              <li><a href={s.whatsapp_link} target="_blank" rel="noopener" className="footer-contact"><i aria-hidden="true" className="fa-brands fa-whatsapp text-[#25D366]" /> {s.whatsapp_number}</a></li>
              <li><a href={`mailto:${s.contact_email}`} className="footer-contact"><i aria-hidden="true" className="fa-regular fa-envelope text-[#007BFF]" /> {s.contact_email}</a></li>
              <li><a href={mapsUrl} target="_blank" rel="noopener" className="footer-contact items-start"><i aria-hidden="true" className="fa-solid fa-location-dot text-[#007BFF] mt-1" /> {s.contact_address}</a></li>
            </ul>
          </div>
        </div>

        {/* Letreiro gerado (vidro com fibra por dentro): entra rápido, com uma varredura suave,
            e depois a luz das letras "respira" (cópia desfocada atrás, só a opacidade anima) */}
        <div data-inview className="footer-word" aria-hidden="true">
          <img src="/arte/letreiro-lifenet-fibra.webp" alt="" width={1600} height={501} loading="lazy" decoding="async" className="footer-word__glow" />
          <img src="/arte/letreiro-lifenet-fibra.webp" alt="" width={1600} height={501} loading="lazy" decoding="async" className="footer-word__img" />
        </div>

        <div className="border-t border-white/5 pt-8 pb-16 md:pb-0 md:pr-24 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <p>©2026 LifeNet. Todos os direitos reservados. CNPJ: 33.476.774/0001-42</p>
          <p className="flex items-center gap-2"><span className="live-dot live-dot--sm" aria-hidden="true" /> Conexão que transforma</p>
        </div>
      </div>
    </footer>
  );
}
