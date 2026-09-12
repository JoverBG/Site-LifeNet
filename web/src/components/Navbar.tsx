"use client";
import { useState } from "react";
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
  const portal = settings.customer_portal_link;

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10 bg-[#050b14]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <a href="#" aria-label="LifeNet - Início">
          <img src={assetUrl(settings.logo_top)} alt="LifeNet" className="h-20 md:h-28 w-auto object-contain" />
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
          className="items-center gap-3 bg-[#1a1a1a] border border-white/10 px-6 py-3 rounded-full text-sm md:text-base font-bold transition hover:bg-gray-800 hidden sm:flex">
          <i aria-hidden="true" className="fa-brands fa-instagram text-pink-500 text-xl" /> Instagram
        </a>
        <a href={settings.whatsapp_link} target="_blank" rel="noopener"
          className="flex items-center gap-3 bg-[#25D366] px-6 py-3 rounded-full text-sm md:text-base font-bold transition hover:bg-green-600 text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]">
          <i aria-hidden="true" className="fa-brands fa-whatsapp text-xl" /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Menu"
          className="lg:hidden text-white ml-3 text-3xl focus:outline-none hover:text-[#007BFF] transition">
          <i aria-hidden="true" className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      <div id="mobile-menu"
        className={`${open ? "flex" : "hidden"} absolute top-full left-0 w-full bg-[#050b14]/95 backdrop-blur-xl border-b border-white/10 flex-col items-center py-8 gap-8 z-40 lg:hidden shadow-2xl`}>
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
  );
}
