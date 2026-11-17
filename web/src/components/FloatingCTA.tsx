"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Pílula "Assine agora" ao lado do botão do WhatsApp (o `data-cta-float` do
 * tirvu.com.br). Aparece depois do topo e some sozinha quando algum bloco com
 * `data-cta-hide` está na tela (os planos, o atendimento e o rodapé), pra não
 * cobrir o que a pessoa está lendo nem repetir o botão que já está ali.
 */
export default function FloatingCTA() {
  const [show, setShow] = useState(false);
  const visible = useRef(new Set<Element>());

  useEffect(() => {
    const update = () => setShow(window.scrollY > 700 && visible.current.size === 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.current.add(e.target); else visible.current.delete(e.target);
      }
      update();
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-cta-hide]").forEach((el) => io.observe(el));
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => { io.disconnect(); window.removeEventListener("scroll", update); };
  }, []);

  return (
    <a href="#planos" data-magnetic data-cursor="Planos" aria-hidden={!show} tabIndex={show ? 0 : -1}
      className={`cta-float fixed bottom-7 right-[6.5rem] z-[99] flex items-center gap-3 rounded-full border border-white/10 bg-[#0a1122]/90 backdrop-blur-xl py-2 pl-2 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(0,123,255,0.25)] ${show ? "is-shown" : ""}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#007BFF] to-[#38bdf8] text-white shadow-[0_0_16px_rgba(0,123,255,0.6)]">
        <i aria-hidden="true" className="fa-solid fa-bolt text-sm" />
      </span>
      <span className="leading-tight">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-gray-400">Até 1 Giga</span>
        <span className="block text-sm font-black text-white">Assine agora</span>
      </span>
    </a>
  );
}
