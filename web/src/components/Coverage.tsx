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
    window.open(waLink(whatsappDigits, `Olá! Gostaria de saber se tem disponibilidade de internet para: ${endereco}`), "_blank", "noopener,noreferrer");
    setQ("");
  };

  // Pontos "acendendo" ao redor da sede (decorativo: não representa endereços reais)
  const dots: [number, number, number][] = [[62, 48, 0], [168, 40, .6], [196, 96, 1.2], [44, 104, 1.8], [132, 124, .9], [90, 22, 1.5], [150, 80, 2.1], [78, 86, .3]];

  return (
    <div id="cobertura" style={{ "--glow": "255 140 0" } as React.CSSProperties} className="svc-card spotlight relative h-full">
      <div className="svc-card__head">
        <span className="svc-card__icon bg-[#FF8C00]/15 text-[#FF8C00]"><i aria-hidden="true" className="fa-solid fa-map-location-dot" /></span>
        <div>
          <h3 className="svc-card__title">Nossa cobertura</h3>
          <p className="svc-card__sub">Confira se sua rua já tem fibra</p>
        </div>
      </div>

      <div className="radar" aria-hidden="true">
        <svg viewBox="0 0 240 150">
          {[22, 44, 66].map((r) => <circle key={r} className="radar__ring" cx="120" cy="75" r={r} />)}
          <line className="radar__axis" x1="20" y1="75" x2="220" y2="75" />
          <line className="radar__axis" x1="120" y1="5" x2="120" y2="145" />
          {dots.map(([x, y, d]) => (
            <circle key={`${x}-${y}`} className="radar__dot" cx={x} cy={y} r="3" style={{ "--d": `${d}s` } as React.CSSProperties} />
          ))}
        </svg>
        <span className="radar__sweep" />
        <span className="radar__pin"><i className="fa-solid fa-location-dot" /></span>
        <span className="radar__label">Pontal do Araguaia · MT</span>
      </div>

      <div className="cov-search">
        <i aria-hidden="true" className="fa-solid fa-location-crosshairs cov-search__icon" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
          type="text" placeholder="Sua cidade ou bairro" aria-label="Cidade ou bairro" className="cov-search__input" />
        <button type="button" onClick={buscar} className="cov-search__btn" aria-label="Consultar cobertura">
          <span className="max-lg:inline lg:hidden xl:inline">Consultar</span> <i aria-hidden="true" className="fa-solid fa-arrow-right text-[11px]" />
        </button>
      </div>
    </div>
  );
}
