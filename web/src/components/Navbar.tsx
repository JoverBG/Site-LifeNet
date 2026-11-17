"use client";
import { useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/site-api";
import { logoUrl } from "@/lib/site-api";

/**
 * Cabeçalho no formato do tirvu.com.br:
 * - no topo é a barra larga; ao rolar vira uma pílula flutuante que some ao
 *   descer e volta ao subir;
 * - os links ganham um traço que corre por baixo, e o da seção em que a
 *   pessoa está fica aceso sozinho;
 * - no celular o menu abre em tela cheia, com os itens numerados entrando em
 *   cascata.
 */
const links = [
  { href: "#inicio", label: "Início", hint: "Conexão que transforma" },
  { href: "#planos", label: "Planos", hint: "De 300 Mega a 1 Giga" },
  { href: "#como-funciona", label: "Como funciona", hint: "Do pedido à fibra ligada" },
  { href: "#atendimento", label: "Cobertura", hint: "Veja se chega no seu endereço" },
  { href: "#faq", label: "Dúvidas", hint: "Perguntas frequentes" },
];

export default function Navbar({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [current, setCurrent] = useState("#inicio");
  const lastY = useRef(0);
  const progress = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);
  const portal = settings.customer_portal_link;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 600);
        lastY.current = y;
      }
      // Link aceso: a última seção do menu cujo topo já passou de 35% da tela
      const line = window.innerHeight * 0.35;
      let cur = links[0].href;
      for (const l of links) {
        const el = document.querySelector(l.href);
        if (el && el.getBoundingClientRect().top <= line) cur = l.href;
      }
      setCurrent(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Destaque que desliza até o link da seção atual (mede o link aceso)
  useEffect(() => {
    const measure = () => {
      const a = track.current?.querySelector<HTMLAnchorElement>('a[aria-current="true"]');
      setInd(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
    };
    measure();
    // a pílula muda de tamanho com transição: mede de novo quando ela termina
    const t = setTimeout(measure, 750);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [current, scrolled]);

  // Menu aberto: trava a rolagem da página e fecha com Esc
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { root.classList.remove("menu-open"); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const pill = scrolled;
  const navCls = pill
    ? "nav-pill top-3 mx-3 lg:mx-auto lg:max-w-[min(78rem,calc(100vw-2rem))] rounded-full bg-[#0a1122]/85 backdrop-blur-xl pl-4 pr-2 md:pl-5 py-2"
    : "nav-bar top-0 border-b border-white/10 bg-[#050b14]/80 backdrop-blur-md px-5 md:px-12 py-4";

  return (
    <>
      {/* Reserva a altura da barra do topo: a nav é fixed */}
      <div className="h-24 sm:h-28 md:h-36" aria-hidden="true" />
      <nav aria-label="Principal"
        className={`flex items-center justify-between gap-4 fixed inset-x-0 z-50 transition-[top,margin,padding,max-width,border-radius,background-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${navCls} ${hidden && !open ? "-translate-y-[130%]" : ""}`}>
        <a href="#inicio" aria-label="LifeNet - Início" className="shrink-0">
          {/* No celular o logo do topo fica menor: com h-20 ele empurrava o botão do menu pra fora da tela */}
          <img src={logoUrl(settings.logo_top)} alt="LifeNet"
            className={`${pill ? "h-11 md:h-12" : "h-14 sm:h-20 md:h-28"} w-auto object-contain transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`} />
        </a>

        <ul ref={track} className="nav-track hidden lg:flex items-center">
          <li aria-hidden="true" className="nav-ind" style={ind ? { width: ind.w, transform: `translateX(${ind.x}px)`, opacity: 1 } : { opacity: 0 }} />
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link" aria-current={current === l.href ? "true" : undefined}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 md:gap-3">
          <a href={portal} target="_blank" rel="noopener"
            className="hidden xl:inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-4 py-2.5 text-sm font-bold text-gray-200 hover:border-[#FF8C00]/60 hover:text-white transition">
            <i aria-hidden="true" className="fa-regular fa-user text-[#FF8C00]" /> Área do cliente
          </a>
          <a href={settings.whatsapp_link} target="_blank" rel="noopener" data-magnetic
            className="btn-arrow btn-arrow--green btn-arrow--sm">
            <i aria-hidden="true" className="fa-brands fa-whatsapp text-lg" />
            <span className="hidden xl:inline">Assine pelo WhatsApp</span>
            <span className="hidden sm:inline xl:hidden">WhatsApp</span>
          </a>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"} className={`burger lg:hidden ${open ? "is-open" : ""}`}>
            <span /><span />
          </button>
        </div>
        <span className="nav-progress" aria-hidden="true"><span ref={progress} /></span>
      </nav>

      {/* Menu em tela cheia (fora da <nav>: o backdrop-filter dela prenderia o fixed) */}
      <div id="mobile-menu" data-lenis-prevent className={`mobile-menu lg:hidden ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <ul className="flex flex-col gap-1">
          {links.map((l, i) => (
            <li key={l.href} style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}>
              <a href={l.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}
                className="group flex items-baseline gap-4 py-3 border-b border-white/5">
                <span className="font-mono text-xs text-[#007BFF]">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-3xl font-black text-white group-hover:text-[#38bdf8] transition">{l.label}</span>
                  <span className="block text-xs text-gray-500 mt-1">{l.hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-3" style={{ transitionDelay: open ? "460ms" : "0ms" }}>
          <a href={portal} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 font-bold text-white">
            <i aria-hidden="true" className="fa-regular fa-user text-[#FF8C00]" /> Área do cliente
          </a>
          <a href={settings.instagram_link} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 font-bold text-white">
            <i aria-hidden="true" className="fa-brands fa-instagram text-pink-500 text-lg" /> Instagram
          </a>
        </div>
      </div>
    </>
  );
}
