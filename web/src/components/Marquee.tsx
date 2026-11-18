/**
 * Faixa de palavras gigantes rolando sem fim, alternando texto cheio e só o
 * contorno (efeito do tirvu.com.br). Só CSS: a lista é duplicada e a faixa anda
 * -50%, então o laço emenda sem salto. Ocupa a largura toda da tela mesmo
 * dentro do <main> com max-w.
 */
const words = [
  "Fibra óptica",
  "Até 1 Giga",
  "Assistente virtual 24h",
  "Sem fidelidade",
  "Instalação grátis",
  "Wi-Fi Dual-Band",
];

export default function Marquee() {
  const row = words.map((w, i) => (
    <span key={i} className="flex items-center gap-10 md:gap-16 pr-10 md:pr-16">
      <span className={i % 2 ? "marquee-outline" : "marquee-solid"}>{w}</span>
      <span className="marquee-dot" />
    </span>
  ));

  return (
    <section aria-label="Diferenciais LifeNet" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 bg-[#050b14]/60 py-8 md:py-12 backdrop-blur-sm">
      <div className="marquee-track flex w-max whitespace-nowrap text-5xl md:text-8xl font-extrabold tracking-tight">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden="true">{row}</div>
      </div>
      {/* Bordas esmaecidas */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#050b14] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#050b14] to-transparent" />
    </section>
  );
}
