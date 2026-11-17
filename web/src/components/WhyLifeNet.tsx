import type { CSSProperties } from "react";
import SectionHead from "./SectionHead";
import { HORARIO_TEXTO } from "@/lib/atendimento";

/**
 * "Por que a LifeNet": grade de cartões, cada um com uma mini-animação que
 * conta o benefício (a seção "Por que a Tirvu" do tirvu.com.br). As animações
 * só começam quando o cartão entra na tela (`data-inview` → `.is-in`).
 */
const speedBars = [30, 46, 40, 62, 58, 78, 72, 100];

export default function WhyLifeNet() {
  return (
    <section id="por-que" data-rail="Por que a LifeNet" className="pt-10">
      <SectionHead n="01" eyebrow="Por que a LifeNet" title="Internet feita pra não te deixar na mão."
        mark="mão." sub="Fibra óptica de verdade, do poste até o seu roteador, com atendimento humano quando você precisar." />

      <div className="bento mt-14">
        {/* 1. Ultravelocidade */}
        <article data-reveal data-inview className="bento-card bento-card--wide spotlight md:col-span-2" style={{ "--glow": "0 123 255" } as CSSProperties}>
          <div className="bento-viz">
            <div className="viz-bars">
              {speedBars.map((h, i) => (
                <span key={i} style={{ "--h": `${h}%`, "--d": `${i * 80}ms` } as CSSProperties} />
              ))}
            </div>
            <span className="viz-tag">até <strong>1 Giga</strong></span>
          </div>
          <h3 className="bento-title"><i aria-hidden="true" className="fa-solid fa-bolt text-[#007BFF]" /> Ultravelocidade</h3>
          <p className="bento-text">Planos de 300 Mega a 1 Giga pra baixar, jogar e assistir com a casa toda conectada.</p>
        </article>

        {/* 2. Estabilidade */}
        <article data-reveal data-delay="90" data-inview data-draw className="bento-card spotlight" style={{ "--glow": "34 197 94" } as CSSProperties}>
          <div className="bento-viz">
            <svg viewBox="0 0 240 90" className="viz-line" aria-hidden="true">
              <path className="viz-line__grid" d="M0 30 H240 M0 60 H240" />
              <path className="draw-path" pathLength={1} d="M0 52 C 20 50, 30 40, 50 42 S 80 36, 100 38 S 140 34, 160 35 S 200 33, 240 34"
                style={{ "--draw-duration": "1.8s" } as CSSProperties} />
            </svg>
            <span className="viz-tag viz-tag--green"><span className="live-dot live-dot--sm" /> sem quedas</span>
          </div>
          <h3 className="bento-title"><i aria-hidden="true" className="fa-solid fa-shield-halved text-[#22c55e]" /> Estabilidade</h3>
          <p className="bento-text">Fibra óptica não sofre com chuva nem com interferência. A conexão fica firme o dia todo.</p>
        </article>

        {/* 3. Bruna 24h + equipe no horário */}
        <article data-reveal data-delay="180" data-inview className="bento-card spotlight" style={{ "--glow": "37 211 102" } as CSSProperties}>
          <div className="bento-viz viz-chat">
            <span className="bubble bubble--in" style={{ "--d": "200ms" } as CSSProperties}>Quero a 2ª via 🧾</span>
            <span className="bubble bubble--out" style={{ "--d": "900ms" } as CSSProperties}>Oi, sou a Bruna! Enviei 👍</span>
            <span className="bubble bubble--out bubble--typing" style={{ "--d": "1500ms" } as CSSProperties}><i /><i /><i /></span>
          </div>
          <h3 className="bento-title"><img src="/arte/bruna-rosto.webp" alt="" width={200} height={200} loading="lazy" className="w-7 h-7 rounded-full object-cover ring-2 ring-[#25D366]/60" /> Bruna 24h</h3>
          <p className="bento-text">Nossa assistente virtual resolve boleto, desbloqueio de confiança e avisos de rede a qualquer hora. A equipe atende {HORARIO_TEXTO.frase}.</p>
        </article>

        {/* 4. Wi-Fi */}
        <article data-reveal data-delay="90" data-inview className="bento-card spotlight" style={{ "--glow": "56 189 248" } as CSSProperties}>
          <div className="bento-viz viz-wifi">
            <span className="wave" style={{ "--d": "0ms" } as CSSProperties} />
            <span className="wave" style={{ "--d": "600ms" } as CSSProperties} />
            <span className="wave" style={{ "--d": "1200ms" } as CSSProperties} />
            <span className="viz-wifi__core"><img src="/arte/icone-wifi.webp" alt="" width={240} height={240} loading="lazy" decoding="async" /></span>
            <span className="viz-tag viz-tag--left">2.4 GHz</span>
            <span className="viz-tag">5 GHz</span>
          </div>
          <h3 className="bento-title"><i aria-hidden="true" className="fa-solid fa-wifi text-[#38bdf8]" /> Wi-Fi dual-band</h3>
          <p className="bento-text">Roteador em comodato com duas frequências: alcance pela casa toda e velocidade onde você mais usa.</p>
        </article>

        {/* 5. Sem fidelidade / pré-paga */}
        <article data-reveal data-delay="180" data-inview className="bento-card spotlight" style={{ "--glow": "255 140 0" } as CSSProperties}>
          <div className="bento-viz viz-lock">
            <span className="viz-lock__icon"><img src="/arte/icone-sem-fidelidade.webp" alt="" width={240} height={240} loading="lazy" decoding="async" /></span>
            <div className="viz-lock__chips">
              <span className="chip">Sem fidelidade</span>
              <span className="chip">Pré-paga</span>
            </div>
          </div>
          <h3 className="bento-title"><i aria-hidden="true" className="fa-solid fa-unlock-keyhole text-[#FF8C00]" /> Liberdade</h3>
          <p className="bento-text">Sem contrato de fidelidade e com mensalidade pré-paga: controle total dos gastos, sem surpresa no fim do mês.</p>
        </article>

        {/* 6. Instalação grátis */}
        <article data-reveal data-delay="270" data-inview className="bento-card bento-card--wide spotlight md:col-span-2" style={{ "--glow": "255 140 0" } as CSSProperties}>
          <div className="bento-viz viz-install">
            <img src="/arte/roteador.webp" alt="" width={640} height={640} loading="lazy" decoding="async" className="viz-install__router" />
            <span className="viz-install__price">
              <span className="viz-install__label">taxa de instalação</span>
              <strong>R$ 0</strong>
            </span>
          </div>
          <h3 className="bento-title"><i aria-hidden="true" className="fa-solid fa-screwdriver-wrench text-[#FF8C00]" /> Instalação grátis</h3>
          <p className="bento-text">Toda a infraestrutura por nossa conta: a equipe leva a fibra até você e deixa tudo funcionando.</p>
        </article>
      </div>
    </section>
  );
}
