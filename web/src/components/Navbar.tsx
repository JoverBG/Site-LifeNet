"use client";
import { useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/site-api";
import { assetUrl } from "@/lib/site-api";

const links = [
  { href: "#", label: "Início", active: true },
  { href: "#planos", label: "Planos" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "", label: "Central do Assinante", external: true },
  { href: "#contato", label: "Contato" },
];

export default function Navbar({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  // Efeito do tirvu.com.br: no topo é a barra de sempre; ao rolar vira uma
  // "pílula" flutuante menor, que some ao descer e volta ao subir.
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const portal = settings.customer_portal_link;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 600);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pill = scrolled;
  const navCls = pill
    ? "top-3 mx-3 md:mx-auto md:max-w-6xl rounded-full border border-white/10 bg-[#0a1122]/80 backdrop-blur-xl px-5 md:px-8 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,123,255,0.08)]"
    : "top-0 border-b border-white/10 bg-[#050b14]/90 backdrop-blur-md px-6 md:px-12 py-4";

  return (
    <>
    {/* Reserva a altura da barra do topo: a nav é fixed, então encolher na
        rolagem não puxa o conteúdo pra cima */}
    <div className="h-28 md:h-36" aria-hidden="true" />
    <nav className={`flex items-center justify-between fixed inset-x-0 z-50 transition-[top,margin,padding,max-width,border-radius,background-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${navCls} ${hidden && !open ? "-translate-y-[130%]" : ""}`}>
      <div className="flex items-center gap-2">
        <a href="#" aria-label="LifeNet - Início">
          <img src={assetUrl(settings.logo_top)} alt="LifeNet" className={`${pill ? "h-12 md:h-14" : "h-20 md:h-28"} w-auto object-contain transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`} />
        </a>
      </div>

      <div className="hidden lg:flex gap-6 xl:gap-8 text-xs font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
        <a href="#" className="text-[#007BFF] border-b-2 border-[#007BFF] pb-1">Início</a>
        <a href="#planos" className="hover:text-white transition">Planos</a>
        <a href="#cobertura" className="hover:text-white transition">Cobertura</a>
        <a href={portal} target="_blank" rel="noopener" className="hover:text-[#FF8C00] transition">Central do Assinante</a>
        <a href="#contato" className="hover:text-white transition">Contato</a>
      </div>

      <div className="flex items-center gap-4">
        <a href={settings.instagram_link} target="_blank" rel="noopener"
          data-magnetic className={`items-center gap-3 bg-[#1a1a1a] border border-white/10 ${pill ? "px-5 py-2.5" : "px-6 py-3"} rounded-full text-sm md:text-base font-bold hover:bg-gray-800 hidden sm:flex`}>
          <i aria-hidden="true" className="fa-brands fa-instagram text-pink-500 text-xl" /> Instagram
        </a>
        <a href={settings.whatsapp_link} target="_blank" rel="noopener"
          data-magnetic className={`flex items-center gap-3 bg-[#25D366] ${pill ? "px-5 py-2.5" : "px-6 py-3"} rounded-full text-sm md:text-base font-bold hover:bg-green-600 text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]`}>
          <i aria-hidden="true" className="fa-brands fa-whatsapp text-xl" /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Menu"
          className="lg:hidden text-white ml-3 text-3xl focus:outline-none hover:text-[#007BFF] transition">
          <i aria-hidden="true" className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      <div id="mobile-menu"
        className={`${open ? "flex" : "hidden"} absolute top-full left-0 w-full ${pill ? "mt-3 rounded-3xl border" : ""} bg-[#050b14]/95 backdrop-blur-xl border-b border-white/10 flex-col items-center py-8 gap-8 z-40 lg:hidden shadow-2xl`}>
        {links.map((l) => {
          const href = l.external ? portal : l.href;
          const color = l.active ? "text-[#007BFF]" : l.external ? "text-[#FF8C00]" : "text-white hover:text-[#007BFF]";
          return (
            <a key={l.label} href={href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener" : undefined}
              onClick={() => setOpen(false)}
              className={`${color} font-black text-lg tracking-widest uppercase transition`}>
              {l.label}
            </a>
          );
        })}
      </div>
    </nav>
    </>
  );
}
