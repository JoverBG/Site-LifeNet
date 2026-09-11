"use client";
import { useState } from "react";
import { phpUrl, waLink } from "@/lib/site-api";

/** Busca de cobertura: registra a tentativa e abre o WhatsApp com a mensagem pronta. */
export default function Coverage({ whatsappDigits }: { whatsappDigits: string }) {
  const [q, setQ] = useState("");

  const buscar = () => {
    const endereco = q.trim();
    if (!endereco) { alert("Por favor, digite sua cidade ou bairro."); return; }
    fetch(phpUrl("api/coverage_log.php"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: endereco, found: 1 }),
    }).catch(() => {});
    window.open(waLink(whatsappDigits, `Olá! Gostaria de saber se tem disponibilidade de internet para: ${endereco}`), "_blank");
    setQ("");
  };

  return (
    <div id="cobertura" className="bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group h-full">
      <div>
        <h3 className="font-bold text-xl mb-1 text-white">Nossa cobertura</h3>
        <p className="text-[12px] text-gray-400 mb-6 font-medium">Confira se sua região está atendida</p>
      </div>
      <div className="flex-grow flex items-center justify-center mb-6 transition duration-500 drop-shadow-[0_0_30px_rgba(0,123,255,0.4)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/mapa.png" alt="Mapa de Cobertura" className="w-full max-h-36 object-contain hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="relative">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
          type="text" placeholder="Digite sua cidade ou bairro" aria-label="Cidade ou bairro"
          className="w-full bg-transparent border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-white/30 transition text-white placeholder-gray-500" />
        <button type="button" onClick={buscar} aria-label="Buscar cobertura"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#007BFF] transition focus:outline-none">
          <i className="fa-solid fa-magnifying-glass text-lg" />
        </button>
      </div>
    </div>
  );
}
