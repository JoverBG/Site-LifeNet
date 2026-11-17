import type { CSSProperties } from "react";

/**
 * Fundo do topo: uma malha de fibra (nós ligados por cabos curvos) com pulsos
 * de luz correndo pelos cabos e nós que piscam. SVG puro + CSS, sem imagem.
 * Fica atrás do conteúdo, bem apagada; no celular não aparece.
 */
const nodes: [number, number][] = [
  [70, 120], [260, 60], [420, 210], [610, 90], [800, 180], [1010, 70], [1150, 230],
  [140, 400], [360, 470], [560, 360], [760, 520], [960, 410], [1120, 560], [250, 640], [680, 660],
];

const links: [number, number, number][] = [
  // [de, para, curvatura]
  [0, 1, -40], [1, 3, 30], [3, 5, -30], [5, 6, 40], [1, 2, 20], [2, 4, -20], [4, 6, 30],
  [0, 7, 30], [7, 8, -30], [2, 9, 40], [9, 4, -30], [9, 10, 30], [10, 11, -20], [11, 6, 30],
  [11, 12, -30], [8, 13, 20], [8, 14, -40], [14, 10, 20],
];

function curve([a, b, k]: [number, number, number]) {
  const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  // ponto de controle deslocado na perpendicular
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * k * 2, cy = my + (dx / len) * k * 2;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

export default function FiberNetwork() {
  return (
    <svg className="fiber-net" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="fn-fade" cx="50%" cy="40%" r="65%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="fn-mask"><rect width="1200" height="700" fill="url(#fn-fade)" /></mask>
      </defs>
      <g mask="url(#fn-mask)">
        {links.map((l, i) => (
          <path key={`b${i}`} d={curve(l)} className="fiber-net__cable" />
        ))}
        {links.map((l, i) => i % 2 === 0 && (
          <path key={`p${i}`} d={curve(l)} pathLength={100}
            className={`fiber-net__pulse ${i % 4 === 0 ? "fiber-net__pulse--orange" : ""}`}
            style={{ "--dur": `${3.2 + (i % 5) * 0.7}s`, "--delay": `${(i * 0.45) % 4}s` } as CSSProperties} />
        ))}
        {nodes.map(([x, y], i) => (
          <g key={`n${i}`}>
            <circle cx={x} cy={y} r="9" className="fiber-net__halo" style={{ "--delay": `${(i * 0.37) % 3}s` } as CSSProperties} />
            <circle cx={x} cy={y} r="2.6" className="fiber-net__node" />
          </g>
        ))}
      </g>
    </svg>
  );
}
