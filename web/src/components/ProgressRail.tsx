"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Trilho fino à esquerda com um ponto por seção (`[data-rail="Rótulo"]` + id):
 * a linha enche conforme a rolagem e o ponto da seção atual acende. Clicar leva
 * à seção (o Lenis cuida da âncora). Só em telas largas, onde sobra margem ao
 * lado do conteúdo; no celular não aparece.
 */
type Item = { id: string; label: string };

export default function ProgressRail() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rail][id]"));
    setItems(els.map((el) => ({ id: el.id, label: el.dataset.rail ?? "" })));
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
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
    <nav aria-label="Seções da página" className="progress-rail fixed left-6 top-1/2 z-40 -translate-y-1/2 hidden min-[1400px]:block">
      <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10" aria-hidden="true" />
      <span ref={fill} className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-[#007BFF] to-[#FF8C00]"
        style={{ transform: "scaleY(0)" }} aria-hidden="true" />
      <ul className="relative flex flex-col gap-7 py-2">
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="rail-dot group" data-active={i === active} data-past={i < active}
              aria-current={i === active ? "true" : undefined}>
              <span className="rail-label">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
