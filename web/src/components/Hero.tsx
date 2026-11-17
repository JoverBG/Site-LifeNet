import type { CSSProperties } from "react";
import RotatingWord from "./RotatingWord";
import FiberNetwork from "./FiberNetwork";

/**
 * Abertura no formato do tirvu.com.br: tudo entra em cascata (`data-reveal` +
 * `data-delay`), e à direita um cartão de vidro que inclina em 3D seguindo o
 * mouse (`data-tilt`), com cartões menores flutuando em camadas de paralaxe e
 * órbitas que se desenham atrás.
 *
 * Só usa o que o site já promete: até 1 Giga, Wi-Fi dual-band, fibra até o
 * roteador, instalação grátis, sem fidelidade e suporte 24h.
 */
const trust = ["Instalação grátis", "Sem fidelidade", "Wi-Fi dual-band", "Assistente virtual 24h"];

/** Alturas fixas das barras do "download" (cada uma anima com atraso próprio). */
const bars = [38, 62, 48, 80, 56, 92, 70, 84, 60, 96, 74, 88, 66, 100];

const layer = (k: number) => ({ transform: `translate3d(calc(var(--px) * ${k}), calc(var(--py) * ${k}), 0)` }) as CSSProperties;

export default function Hero({ whatsappLink }: { whatsappLink: string }) {
  return (
    <section id="inicio" data-rail="Início"
      className="relative max-lg:overflow-x-clip grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-6 items-center lg:min-h-[calc(100svh-10rem)] pb-4">
      <div className="pointer-events-none absolute -inset-x-4 md:-inset-x-8 -top-24 bottom-0 -z-10 hidden md:block" data-parallax="-0.08">
        <FiberNetwork />
      </div>

      <div className="relative z-10" data-parallax="0.06">
        <p data-reveal className="hero-pill">
          <span className="live-dot" aria-hidden="true" /> Internet fibra óptica · Pontal do Araguaia - MT
        </p>

        <h1 className="text-[2.9rem] leading-[1.02] sm:text-6xl md:text-7xl xl:text-[5.5rem] font-extrabold tracking-tight mt-7 mb-7 text-white">
          <span data-reveal data-delay="90" className="block">Conexão que</span>
          <span data-reveal data-delay="180" className="block">
            <RotatingWord words={["transforma", "acelera", "não cai", "conecta"]} />
          </span>
        </h1>

        <p data-reveal data-delay="280" className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
          Ultravelocidade, estabilidade e atendimento que você merece. Conecte-se com o futuro com a{" "}
          <strong className="text-white">LifeNet</strong>.
        </p>

        <div data-reveal data-delay="380" className="flex flex-wrap items-center gap-4 mt-10">
          <a href="#planos" data-magnetic data-cursor="Planos" className="btn-arrow btn-arrow--primary">
            <span>Ver planos</span>
            <span className="btn-arrow__icon" aria-hidden="true"><i className="fa-solid fa-arrow-right" /></span>
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener" data-magnetic className="btn-arrow btn-arrow--ghost">
            <i aria-hidden="true" className="fa-brands fa-whatsapp text-[#25D366] text-xl" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

        <ul data-reveal data-delay="480" className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-7 gap-y-3 mt-11">
          {trust.map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-sm font-semibold text-gray-300">
              <span className="check-dot" aria-hidden="true"><i className="fa-solid fa-check" /></span>{t}
            </li>
          ))}
        </ul>

        <a href="#por-que" className="hidden lg:inline-flex items-center gap-4 mt-14 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-500 hover:text-white transition"
          data-reveal data-delay="600">
          <span className="scroll-hint-line" aria-hidden="true" /> Role para explorar
        </a>
      </div>

      {/* ------- Visual: cartão 3D + camadas ------- */}
      <div data-tilt data-parallax="0.16" className="hero-visual relative mx-auto w-full max-w-[560px] h-[470px] sm:h-[520px]" aria-hidden="true">
        <svg data-inview data-draw className="hero-orbits absolute inset-[-8%] w-[116%] h-[116%]" viewBox="0 0 600 600" style={layer(-0.4)}>
          <ellipse className="draw-path" pathLength={1} cx="300" cy="300" rx="285" ry="118" transform="rotate(-16 300 300)" />
          <ellipse className="draw-path draw-path--2" pathLength={1} cx="300" cy="300" rx="250" ry="92" transform="rotate(22 300 300)"
            style={{ "--d": "350ms" } as CSSProperties} />
        </svg>
        <div className="hero-glow" style={layer(-0.25)} />

        {/* Cartão principal */}
        <div className="absolute inset-x-6 sm:inset-x-12 top-12 sm:top-14" style={layer(0.15)}>
          <div data-reveal="scale" data-delay="200">
            <div data-inview data-draw className="tilt-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/arte/logo-icone.webp" alt="" className="h-9 w-9 object-contain" />
                  <div className="leading-tight">
                    <p className="text-sm font-black text-white">Sua conexão</p>
                    <p className="text-[11px] text-gray-400">Fibra óptica LifeNet</p>
                  </div>
                </div>
                <span className="status-pill"><span className="live-dot live-dot--sm" /> online</span>
              </div>

              <div className="relative mt-7 grid place-items-center">
                <svg viewBox="0 0 220 120" className="w-full max-w-[300px]">
                  <defs>
                    <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="#007BFF" />
                      <stop offset=".6" stopColor="#38bdf8" />
                      <stop offset="1" stopColor="#FF8C00" />
                    </linearGradient>
                  </defs>
                  <path d="M20 110 A90 90 0 0 1 200 110" className="gauge-base" />
                  <path d="M20 110 A90 90 0 0 1 200 110" className="draw-path gauge-fill" pathLength={1}
                    style={{ "--d": "500ms", "--draw-duration": "1.8s" } as CSSProperties} />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <p className="text-5xl sm:text-6xl font-black tracking-tighter text-white tabular-nums leading-none">
                    <span data-count="1000" data-from="0">1.000</span>
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[#38bdf8]">Mbps · até 1 Giga</p>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  <span>Download</span><span className="text-[#22c55e]">estável</span>
                </div>
                <div className="eq mt-3">
                  {bars.map((h, i) => (
                    <span key={i} style={{ "--h": `${h}%`, "--i": i } as CSSProperties} />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip"><i className="fa-solid fa-wifi" /> 2.4 GHz</span>
                <span className="chip"><i className="fa-solid fa-wifi" /> 5 GHz</span>
                <span className="chip"><i className="fa-solid fa-route" /> Fibra até o roteador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roteador 3D (gerado) na frente, saindo do canto de baixo do cartão */}
        <div className="hero-router-wrap absolute hidden sm:block" style={layer(0.55)}>
          <div data-reveal="left" data-delay="720">
            <img src="/arte/roteador.webp" alt="" width={640} height={640} fetchPriority="low" className="hero-router bob bob--2" />
          </div>
        </div>

        {/* Flutuantes (paralaxe mais forte = parecem mais perto) */}
        <div className="absolute left-0 top-0 sm:-left-4" style={layer(0.6)}>
          <div data-reveal="left" data-delay="550">
            <div className="float-card bob">
              <span className="float-card__icon bg-[#FF8C00]/15"><img src="/arte/icone-instalacao.webp" alt="" width={240} height={240} className="float-card__img" /></span>
              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Instalação</p>
                <p className="text-lg font-black text-white">R$ 0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-4 sm:-right-2" style={layer(0.9)}>
          <div data-reveal="scale" data-delay="800">
            <div className="float-pill bob bob--2">
              <i className="fa-solid fa-unlock-keyhole text-[#38bdf8]" /> Sem fidelidade
            </div>
          </div>
        </div>

        {/* Bruna: cartão baixo e largo, pendurado abaixo do cartão principal (não cobre o conteúdo dele) */}
        <div className="hero-bruna absolute" style={layer(0.75)}>
          <div data-reveal="right" data-delay="680">
            <div className="float-card bob bob--3 !gap-3 !py-3 !pl-3 !pr-4">
              <span className="relative shrink-0">
                <img src="/arte/bruna-rosto.webp" alt="" width={200} height={200} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#25D366]/70 shadow-[0_0_18px_rgba(37,211,102,0.45)]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-[#0b1424]" />
              </span>
              <div className="leading-tight">
                <p className="text-[#FF8C00] text-[9px] font-bold tracking-[0.2em] uppercase">Bruna · assistente virtual</p>
                <p className="text-lg font-black text-white mt-0.5">24h no WhatsApp</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Boleto, desbloqueio e avisos de rede</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
