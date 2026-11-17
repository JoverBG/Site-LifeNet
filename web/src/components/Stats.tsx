import type { CSSProperties } from "react";
import SectionHead from "./SectionHead";
import FiberLine from "./FiberLine";

/**
 * "A LifeNet em números": contadores que sobem quando aparecem (os `data-stat`
 * do tirvu.com.br). O HTML do servidor já vem com o valor final, então o Google
 * e quem está sem JS veem o número certo; o Effects zera e anima na entrada.
 * `data-from` faz contar de um valor até outro (o R$ 0 vem descendo).
 *
 * Só números que o site já promete: 1 Giga, suporte 24h, fibra, instalação grátis.
 */
const stats = [
  { to: 1000, prefix: "", suffix: " Mega", label: "de velocidade nos planos de até 1 Giga", color: "#007BFF", glow: "0 123 255" },
  { to: 24, prefix: "", suffix: "h", label: "com a Bruna, nossa assistente virtual no WhatsApp", color: "#FF8C00", glow: "255 140 0" },
  { to: 100, prefix: "", suffix: "%", label: "fibra óptica, do poste até o seu roteador", color: "#38bdf8", glow: "56 189 248" },
  { to: 0, from: 350, prefix: "R$ ", suffix: "", label: "de taxa de instalação, e sem fidelidade", color: "#22c55e", glow: "34 197 94" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function Stats() {
  return (
    <section id="numeros" data-rail="Números" className="relative pt-6">
      <SectionHead n="04" eyebrow="LifeNet em números" title="Feita pra quem não pode ficar offline." mark="offline" className="mb-12" />

      {/* A fibra passa entre o título e os cartões: atrás deles o fundo opaco a escondia */}
      <div data-inview data-draw className="pointer-events-none relative -mt-6 mb-2 h-20 md:h-24 -mx-4 md:-mx-8">
        <FiberLine className="w-full h-full" />
      </div>

      <div className="relative">
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={s.label} data-inview style={{ "--glow": s.glow, "--d": `${i * 90}ms` } as CSSProperties}
              className="stat-card spotlight relative bg-card rounded-[2rem] p-8 border border-white/5 overflow-hidden">
              <span className="stat-dot" style={{ background: s.color, boxShadow: `0 0 14px ${s.color}` }} aria-hidden="true" />
              <p className="text-5xl xl:text-6xl font-black tracking-tighter mt-10 tabular-nums whitespace-nowrap" style={{ color: s.color }}>
                {s.prefix}
                <span data-count={s.to} data-from={s.from ?? 0}>{fmt(s.to)}</span>
                <span className="text-xl xl:text-2xl tracking-normal">{s.suffix}</span>
              </p>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
