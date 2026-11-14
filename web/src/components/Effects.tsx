"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Efeitos de interação globais (inspirados no tirvu.com.br), todos por delegação
 * no document — os componentes só marcam o HTML:
 *
 * - Rolagem suave (Lenis), sincronizada com o ScrollTrigger do GSAP.
 * - Cursor próprio (ponto + anel) só em mouse/trackpad; cresce sobre links e
 *   mostra um rótulo em quem tiver `data-cursor="Texto"`.
 * - `.spotlight`: brilho radial que segue o mouse (cor em `--glow`, "r g b").
 * - `[data-magnetic]`: o botão "puxa" levemente na direção do cursor.
 *
 * Nada disso roda com `prefers-reduced-motion: reduce`, e o cursor/ímã não rodam
 * em telas de toque.
 */
export default function Effects() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    // --- Rolagem suave -------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -90 }, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => { gsap.ticker.remove(tick); lenis.destroy(); });

    // --- Spotlight nos cards -------------------------------------------------
    const onSpot = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".spotlight");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onSpot, { passive: true });
    cleanups.push(() => document.removeEventListener("pointermove", onSpot));

    if (!fine) return () => cleanups.forEach((c) => c());

    // --- Botões magnéticos ---------------------------------------------------
    let magnet: HTMLElement | null = null;
    const onMagnet = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== el) { magnet.style.transform = ""; }
      magnet = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onLeaveDoc = () => { if (magnet) magnet.style.transform = ""; magnet = null; };
    document.addEventListener("pointermove", onMagnet, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    cleanups.push(() => {
      document.removeEventListener("pointermove", onMagnet);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
    });

    // --- Cursor --------------------------------------------------------------
    const d = dot.current, rg = ring.current, lb = label.current;
    if (d && rg && lb) {
      document.documentElement.classList.add("has-cursor");
      const pos = { x: innerWidth / 2, y: innerHeight / 2 };
      const ringPos = { ...pos };
      let shown = false;
      let raf = 0;
      const loop = () => {
        ringPos.x += (pos.x - ringPos.x) * 0.18;
        ringPos.y += (pos.y - ringPos.y) * 0.18;
        d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        rg.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pos.x = e.clientX; pos.y = e.clientY;
        if (!shown) { shown = true; ringPos.x = pos.x; ringPos.y = pos.y; d.style.opacity = "1"; rg.style.opacity = "1"; }
        const t = e.target as Element | null;
        const labelled = t?.closest<HTMLElement>("[data-cursor]");
        const hover = t?.closest("a, button, [role=button], input, select, textarea, label");
        if (labelled) { rg.dataset.label = ""; lb.textContent = labelled.dataset.cursor ?? ""; }
        else { delete rg.dataset.label; }
        if (hover) rg.dataset.hover = ""; else delete rg.dataset.hover;
      };
      const onDown = () => { rg.dataset.down = ""; };
      const onUp = () => { delete rg.dataset.down; };
      const onOut = () => { shown = false; d.style.opacity = "0"; rg.style.opacity = "0"; };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerdown", onDown);
      document.addEventListener("pointerup", onUp);
      document.documentElement.addEventListener("pointerleave", onOut);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        document.documentElement.classList.remove("has-cursor");
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerdown", onDown);
        document.removeEventListener("pointerup", onUp);
        document.documentElement.removeEventListener("pointerleave", onOut);
      });
    }

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="cursor-dot absolute left-0 top-0 opacity-0" />
      <div ref={ring} className="cursor-ring absolute left-0 top-0 opacity-0">
        <span ref={label} className="cursor-label" />
      </div>
    </div>
  );
}
