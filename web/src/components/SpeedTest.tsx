"use client";
import { useRef, useState } from "react";
import { phpUrl } from "@/lib/site-api";

/** Mede baixando /img/mapa.png (2,6 MB) e anima o ponteiro — igual ao PHP. */
export default function SpeedTest({ speedtestUrl }: { speedtestUrl: string }) {
  const [val, setVal] = useState("0.00");
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const busy = useRef(false);

  // Igual ao PHP: o clique roda o teste local E abre o speedtest.net em nova aba (href do admin)
  const run = () => {
    if (busy.current) return;
    busy.current = true;
    setState("running"); setVal("---");

    const start = performance.now();
    fetch(phpUrl(`img/mapa.png?cache=${start}`))
      .then((r) => r.blob())
      .then((blob) => {
        const duration = (performance.now() - start) / 1000;
        const target = Math.min(950, (blob.size * 8) / duration / (1024 * 1024));
        const animStart = performance.now();
        const animate = (t: number) => {
          let frac = (t - animStart) / 2000; if (frac > 1) frac = 1;
          const cur = (1 - Math.pow(1 - frac, 3)) * target;
          setVal(cur.toFixed(2));
          if (frac < 1) requestAnimationFrame(animate);
          else {
            setState("done"); busy.current = false;
            const fd = new FormData();
            fd.append("speed", target.toFixed(2) + " Mbps");
            fetch(phpUrl("api/speedtest_log.php"), { method: "POST", body: fd }).catch(() => {});
          }
        };
        requestAnimationFrame(animate);
      })
      .catch(() => {
        alert("Erro ao realizar teste de velocidade. Verifique sua conexão.");
        setState("idle"); busy.current = false;
      });
  };

  // Ponteiro: -120° (0 Mbps) a +120° (1000 Mbps); o arco acende na mesma proporção
  const num = Number(val);
  const frac = Number.isFinite(num) ? Math.min(1, num / 1000) : 0;
  const angle = -120 + frac * 240;
  const ticks = Array.from({ length: 11 }, (_, i) => -120 + i * 24);

  return (
    <div className="svc-card spotlight relative h-full" style={{ "--glow": "0 123 255" } as React.CSSProperties}>
      <div className="svc-card__head">
        <span className="svc-card__icon bg-[#007BFF]/15 text-[#38bdf8]"><i aria-hidden="true" className="fa-solid fa-gauge-high" /></span>
        <div>
          <h3 className="svc-card__title">Teste sua velocidade</h3>
          <p className="svc-card__sub">Medição rápida no navegador</p>
        </div>
      </div>

      <div className={`speedo ${state === "running" ? "is-running" : ""}`}>
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <defs>
            <linearGradient id="speedo-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#007BFF" />
              <stop offset=".55" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#FF8C00" />
            </linearGradient>
          </defs>
          <path className="speedo__base" d="M36.4 142.5 A85 85 0 1 1 183.6 142.5" pathLength={100} />
          <path className="speedo__fill" d="M36.4 142.5 A85 85 0 1 1 183.6 142.5" pathLength={100}
            style={{ strokeDashoffset: 100 - frac * 100 }} />
          {ticks.map((t, i) => (
            <line key={t} className={`speedo__tick ${i % 5 === 0 ? "speedo__tick--big" : ""}`} x1="110" y1="30" x2="110" y2={i % 5 === 0 ? 40 : 36}
              transform={`rotate(${t} 110 100)`} />
          ))}
          {/* Marcador na ponta do arco aceso */}
          <circle className="speedo__knob" r="7"
            cx={110 + 85 * Math.sin((angle * Math.PI) / 180)} cy={100 - 85 * Math.cos((angle * Math.PI) / 180)} />
        </svg>
        <div className="speedo__value">
          <span className="tabular-nums">{val}</span>
          <small>Mbps</small>
        </div>
      </div>

      <a href={speedtestUrl} target="_blank" rel="noopener" onClick={run} aria-disabled={state === "running"}
        className="svc-btn bg-[#007BFF] hover:bg-blue-600 shadow-[0_0_24px_rgba(0,123,255,0.45)]">
        {state === "running" ? (<><i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin" /> Medindo...</>)
          : state === "done" ? (<><i aria-hidden="true" className="fa-solid fa-rotate-right" /> Refazer teste</>)
          : (<><i aria-hidden="true" className="fa-solid fa-play text-[11px]" /> Iniciar teste</>)}
      </a>
    </div>
  );
}
