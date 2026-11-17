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
 * - `[data-inview]`: ganha `.is-in` ao entrar na tela (reveal por palavra,
 *   linhas que se desenham) e dispara os contadores `[data-count]`.
 * - `[data-reveal]` (+ `data-delay` em ms): entrada em cascata dos blocos.
 * - `[data-tilt]`: o cartão do topo inclina em 3D e as camadas fazem paralaxe.
 * - Tira o preloader (`html.preload`) quando a página hidrata.
 *
 * Nada disso roda com `prefers-reduced-motion: reduce`, e o cursor/ímã não rodam
 * em telas de toque.
 */
const fmtNum = (n: number) => Math.round(n).toLocaleString("pt-BR");

/** Conta de data-from até data-count em ~1,8 s, desacelerando no fim (expo-out). */
function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count ?? 0);
  const from = Number(el.dataset.from ?? 0);
  const dur = 1800;
  const start = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / dur);
    const eased = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    el.textContent = fmtNum(from + (to - from) * eased);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function Effects() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // --- Preloader: some assim que a página hidrata (ver Preloader.tsx) ------
    const root = document.documentElement;
    if (root.classList.contains("preload")) {
      const t1 = setTimeout(() => root.classList.add("preload-out"), 900);
      const t2 = setTimeout(() => root.classList.remove("preload", "preload-out"), 1600);
      cleanups.push(() => { clearTimeout(t1); clearTimeout(t2); root.classList.remove("preload", "preload-out"); });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => cleanups.forEach((c) => c());
    const fine = window.matchMedia("(pointer: fine)").matches;

    // --- Entrada na tela: [data-inview] ganha .is-in uma vez -----------------
    // O CSS usa isso pro reveal palavra a palavra ([data-split]), pras linhas que
    // se desenham ([data-draw]) e pros cartões de números; os [data-count] dentro
    // começam a contar no mesmo momento.
    // `[data-reveal]` (sobe/vem do lado/cresce, com `data-delay` em ms) usa o
    // mesmo observador. Com o preloader na tela, espera ele sair pra cascata do
    // topo não acontecer escondida atrás dele.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add("is-in");
        el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        io.unobserve(el);
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll<HTMLElement>("[data-inview]").forEach((el) => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => { c.textContent = fmtNum(Number(c.dataset.from ?? 0)); });
    });
    const observeAll = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.dataset.delay) el.style.setProperty("--d", `${el.dataset.delay}ms`);
        io.observe(el);
      });
      document.querySelectorAll<HTMLElement>("[data-inview]").forEach((el) => io.observe(el));
    };
    if (root.classList.contains("preload")) {
      const t = setTimeout(observeAll, 1000);
      cleanups.push(() => clearTimeout(t));
    } else observeAll();
    cleanups.push(() => io.disconnect());

    // --- Cartão 3D do topo: [data-tilt] inclina e as camadas fazem paralaxe ---
    // Só escreve --rx/--ry/--px/--py; o CSS decide quem usa cada uma.
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        let raf = 0;
        const target = { x: 0, y: 0 };
        const apply = () => {
          raf = 0;
          el.style.setProperty("--rx", `${(-target.y * 9).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${(target.x * 11).toFixed(2)}deg`);
          el.style.setProperty("--px", `${(target.x * 34).toFixed(1)}px`);
          el.style.setProperty("--py", `${(target.y * 28).toFixed(1)}px`);
        };
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          target.x = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
          target.y = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
          if (!raf) raf = requestAnimationFrame(apply);
        };
        const onLeave = () => { target.x = 0; target.y = 0; if (!raf) raf = requestAnimationFrame(apply); };
        // Escuta na seção inteira: o cartão reage desde que o mouse esteja no topo
        const zone = el.closest("section") ?? el;
        zone.addEventListener("pointermove", onMove as EventListener, { passive: true });
        zone.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          zone.removeEventListener("pointermove", onMove as EventListener);
          zone.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    // --- Rolagem suave -------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -90 }, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => { gsap.ticker.remove(tick); lenis.destroy(); });

    // --- Faixa de palavras reage à rolagem: acelera e inclina com a velocidade --
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".marquee-track > div"));
    const tracks = Array.from(document.querySelectorAll<HTMLElement>(".marquee-track"));
    if (rows.length) {
      let target = 0, skew = 0;
      lenis.on("scroll", (l: Lenis) => { target = Math.max(-10, Math.min(10, l.velocity * 0.5)); });
      const onTick = () => {
        skew += (target - skew) * 0.12;
        target *= 0.92;
        if (Math.abs(skew) < 0.01) skew = 0;
        const s = `skewX(${(-skew).toFixed(2)}deg)`;
        rows.forEach((r) => { r.style.transform = s; });
        const rate = 1 + Math.min(4, Math.abs(skew) * 0.45);
        tracks.forEach((tr) => tr.getAnimations().forEach((a) => { a.playbackRate = rate; }));
      };
      gsap.ticker.add(onTick);
      cleanups.push(() => gsap.ticker.remove(onTick));
    }

    // --- Paralaxe do topo: [data-parallax="fator"] anda mais rápido (+) ou mais
    // devagar (-) que a página enquanto a primeira seção sai da tela ----------
    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const k = Number(el.dataset.parallax) || 0;
      const tween = gsap.to(el, {
        y: () => -window.innerHeight * k, ease: "none",
        scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
      cleanups.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });
    });

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
        const hover = t?.closest("a, button, summary, [role=button], input, select, textarea, label");
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
