"use client";
import { useEffect, useState } from "react";

/**
 * Barra vertical de ícones à esquerda, um por seção (`[data-rail="Rótulo"]` + id).
 * O ícone da seção atual acende, os já passados ficam azuis e o nome aparece ao
 * passar o mouse (ou no foco do teclado). Clicar leva à seção (o Lenis cuida da
 * âncora). Só em telas largas, onde sobra margem ao lado do conteúdo.
 */
type Item = { id: string; label: string };

/** Ícone (Font Awesome 6, solid) de cada seção, pelo id. */
const ICONS: Record<string, string> = {
  inicio: "fa-house",
  "por-que": "fa-award",
  planos: "fa-wifi",
  simulador: "fa-sliders",
  numeros: "fa-chart-simple",
  "como-funciona": "fa-route",
  atendimento: "fa-headset",
  app: "fa-mobile-screen",
  status: "fa-wave-square",
  faq: "fa-circle-question",
};

export default function ProgressRail() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rail][id]"));
    setItems(els.map((el) => ({ id: el.id, label: el.dataset.rail ?? "" })));
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let cur = 0;
      els.forEach((el, i) => { if (el.getBoundingClientRect().top <= line) cur = i; });
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Seções da página" className="rail-dock fixed left-5 top-1/2 z-40 -translate-y-1/2 hidden min-[1400px]:flex">
      {items.map((it, i) => (
        <a key={it.id} href={`#${it.id}`} className="rail-btn" data-active={i === active} data-past={i < active}
          aria-label={it.label} aria-current={i === active ? "true" : undefined}>
          <i aria-hidden="true" className={`fa-solid ${ICONS[it.id] ?? "fa-circle"}`} />
          <span className="rail-tip" aria-hidden="true">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
