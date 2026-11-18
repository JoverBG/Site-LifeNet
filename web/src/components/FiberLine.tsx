/**
 * "Fibra" decorativa: a linha se desenha quando entra na tela e depois pacotes
 * de luz ficam correndo por ela (os `dash-flow`/`pf-packet` do tirvu.com.br).
 * Só SVG + CSS. O container precisa de `data-inview data-draw`; sem movimento
 * (prefers-reduced-motion) a linha aparece parada.
 */
const D = "M0 60 C 120 60, 160 18, 300 18 S 480 98, 620 70 S 820 10, 960 40 S 1120 92, 1200 60";

export default function FiberLine({ className = "" }: { className?: string }) {
  return (
    <svg className={`fiber-line ${className}`} viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fiber-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#007BFF" stopOpacity="0" />
          <stop offset=".15" stopColor="#007BFF" />
          <stop offset=".6" stopColor="#38bdf8" />
          <stop offset=".85" stopColor="#FF8C00" />
          <stop offset="1" stopColor="#FF8C00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={D} className="fiber-base" pathLength={1} />
      <path d={D} className="draw-path fiber-core" pathLength={1} stroke="url(#fiber-grad)" />
      <path d={D} className="fiber-packet" pathLength={100} />
      <path d={D} className="fiber-packet fiber-packet--2" pathLength={100} />
      <path d={D} className="fiber-packet fiber-packet--3" pathLength={100} />
    </svg>
  );
}
