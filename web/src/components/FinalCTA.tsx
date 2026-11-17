import type { CSSProperties } from "react";
import SplitWords from "./SplitWords";

/**
 * Faixa final de chamada (a "Saia do caos. Entre no controle." do
 * tirvu.com.br): o bloco cresce ao entrar, uma linha de fibra se desenha por
 * trás e o título entra palavra por palavra.
 */
export default function FinalCTA({ whatsappLink }: { whatsappLink: string }) {
  return (
    <section data-cta-hide className="pt-10">
      <div data-reveal="scale">
        <div data-inview data-draw data-split className="final-cta">
          <img src="/arte/fundo-pontal.webp" alt="" width={1600} height={1329} loading="lazy" decoding="async" className="final-cta__bg" />
          <span className="final-cta__credit">Pontal do Araguaia · Foto: Prefeitura de Pontal do Araguaia</span>
          <svg className="final-cta__lines" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
            <path className="draw-path" pathLength={1} d="M-20 300 C 200 300, 300 120, 520 140 S 860 330, 1220 90"
              style={{ "--draw-duration": "2.2s" } as CSSProperties} />
            <path className="draw-path draw-path--2" pathLength={1} d="M-20 340 C 260 330, 380 200, 600 220 S 920 360, 1220 160"
              style={{ "--d": "300ms", "--draw-duration": "2.4s" } as CSSProperties} />
          </svg>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-[#38bdf8] mb-6">Bora conectar?</p>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.02] tracking-tight">
              <SplitWords text="Conecte-se com o futuro." mark="futuro." />
            </h2>
            <p className="text-gray-300 text-lg mt-6 max-w-xl mx-auto">
              Instalação grátis, sem fidelidade e assistente virtual 24h no WhatsApp. Fale com a gente e confirme a cobertura no seu endereço.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a href={whatsappLink} target="_blank" rel="noopener" data-magnetic data-cursor="Chamar" className="btn-arrow btn-arrow--green btn-arrow--lg">
                <i aria-hidden="true" className="fa-brands fa-whatsapp text-xl" /><span>Assinar pelo WhatsApp</span>
                <span className="btn-arrow__icon" aria-hidden="true"><i className="fa-solid fa-arrow-right" /></span>
              </a>
              <a href="#planos" data-magnetic className="btn-arrow btn-arrow--ghost btn-arrow--lg"><span>Ver planos</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
