"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHead from "./SectionHead";

/**
 * "Como funciona": no desktop a seção fica presa e as etapas passam de lado
 * conforme a rolagem, com contador "ETAPA 01 / 04" e barra de progresso (o
 * `data-scroll-jump` dos módulos do tirvu.com.br).
 *
 * Só prende com tela >= 1024px e sem `prefers-reduced-motion`. Fora disso (celular,
 * sem JS, movimento reduzido) é uma grade comum de cartões, então nada fica
 * escondido nem cortado.
 */
const steps = [
  { icon: "fa-gauge-high", title: "Escolha seu plano", text: "Planos de até 1 Giga, todos com Wi-Fi dual-band e sem fidelidade.", color: "#007BFF" },
  { icon: "fa-brands fa-whatsapp", title: "Chame no WhatsApp", text: "Confirmamos a cobertura no seu endereço e já agendamos a visita.", color: "#25D366" },
  { icon: "fa-screwdriver-wrench", title: "Instalação grátis", text: "Nossa equipe leva a fibra até você e instala o roteador em comodato.", color: "#FF8C00" },
  { icon: "fa-wifi", title: "Pronto, é só navegar", text: "Conexão estável, mensalidade pré-paga e a Bruna no WhatsApp 24h quando precisar.", color: "#38bdf8" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function HowItWorks({ whatsappLink }: { whatsappLink: string }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const sec = section.current, st = stage.current, vp = viewport.current, tr = track.current;
      if (!sec || !st || !vp || !tr) return;
      // A classe vai direto no DOM pra trilha já estar em linha quando o GSAP medir;
      // o estado só acompanha (o React escreve a mesma className depois).
      sec.classList.add("is-pinned");
      setPinned(true);
      const dist = () => Math.max(0, tr.scrollWidth - vp.clientWidth);
      const tween = gsap.to(tr, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          // Prende só o palco (contador + cartões): o título rola embora e o
          // cartão inteiro, com o botão, cabe na tela mesmo em notebook
          trigger: st,
          start: "top top+=96",
          end: () => `+=${dist() + window.innerHeight * 0.35}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
          },
        },
      });
      // fontes/imagens acima podem mudar a altura da página depois do primeiro cálculo
      const t = setTimeout(() => ScrollTrigger.refresh(), 400);
      return () => {
        clearTimeout(t); tween.scrollTrigger?.kill(); tween.kill();
        sec.classList.remove("is-pinned"); setPinned(false); gsap.set(tr, { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} id="como-funciona" data-rail="Como funciona" className={`steps ${pinned ? "is-pinned" : ""} relative`}>
      <SectionHead n="05" eyebrow="Como funciona" title="Da escolha do plano à fibra ligada." mark="ligada."
        align="left" color="#FF8C00" className="mb-10" />

      <div ref={stage} className="steps-stage">
        <div className="steps-meta items-center justify-end gap-5 mb-4" aria-hidden={!pinned}>
          <p className="font-mono text-xs tracking-[0.3em] text-gray-400 uppercase">
            Etapa <span className="text-white">{pad(active + 1)}</span> / {pad(steps.length)}
          </p>
          <span className="relative block w-40 h-1 rounded-full bg-white/10 overflow-hidden">
            <span ref={bar} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#007BFF] to-[#FF8C00]" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>

      {/* O gs-reveal fica no container e não nos cartões: o GSAP deixa opacity inline
          no fim e isso anularia o esmaecido das etapas inativas */}
      <div ref={viewport} className="steps-viewport gs-reveal">
        <div ref={track} className="steps-track">
          {steps.map((s, i) => (
            <article key={s.title} data-active={pinned ? i === active : undefined}
              className="step-card spotlight relative bg-card border border-white/5 rounded-[2.5rem] p-10 overflow-hidden"
              style={{ "--glow": hexToTriplet(s.color) } as CSSProperties}>
              <span className="step-num" aria-hidden="true">{pad(i + 1)}</span>
              <div className="step-art-frame mb-7" style={{ background: `${s.color}0f`, borderColor: `${s.color}26`, "--glow-c": s.color } as CSSProperties}>
                <img src={`/arte/etapa-${i + 1}.webp`} alt="" width={560} height={560} loading="lazy" decoding="async"
                  className="step-img" style={{ "--i": i } as CSSProperties} />
              </div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: s.color }}>Etapa {pad(i + 1)}</p>
              <h3 className="text-2xl md:text-3xl font-black mb-3">{s.title}</h3>
              <p className="text-gray-400 leading-relaxed max-w-sm">{s.text}</p>
              {i === 1 && (
                <a href={whatsappLink} target="_blank" rel="noopener" data-magnetic data-cursor="Chamar"
                  className="mt-8 inline-flex items-center gap-2 bg-[#25D366] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl">
                  <i aria-hidden="true" className="fa-brands fa-whatsapp text-lg" /> Consultar cobertura
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

function hexToTriplet(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
