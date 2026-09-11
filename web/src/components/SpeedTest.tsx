"use client";
import { useRef, useState } from "react";
import { phpUrl } from "@/lib/site-api";

/** Mede baixando /img/mapa.png (2,6 MB) e anima o ponteiro — igual ao PHP. */
export default function SpeedTest({ speedtestUrl }: { speedtestUrl: string }) {
  const [val, setVal] = useState("0.00");
  const [rotation, setRotation] = useState(45);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const busy = useRef(false);

  const run = (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setState("running"); setRotation(210); setVal("---");

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
          setRotation(30 + (cur / 1000) * 300);
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

  return (
    <div className="bg-card border border-white/5 rounded-[2rem] p-8 text-center flex flex-col justify-between items-center group h-full">
      <div>
        <h3 className="font-bold text-xl mb-1 text-white">Teste sua velocidade</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Real-time performance</p>
      </div>
      <div className="relative w-48 h-28 overflow-hidden mb-4">
        <div className="absolute top-0 left-0 w-48 h-48 border-[18px] border-[#0a1122] border-t-[#FF8C00] border-l-[#007BFF] rounded-full transition-transform duration-1000"
          style={{ transform: `rotate(${rotation}deg)` }} />
        <div className="absolute bottom-2 left-0 w-full text-center">
          <div className="text-4xl font-black text-glow-blue">{val}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase">Mbps</div>
        </div>
      </div>
      <a href={speedtestUrl} onClick={run} aria-disabled={state === "running"}
        className="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] text-sm uppercase tracking-widest flex items-center justify-center gap-2">
        {state === "done" ? (<><i className="fa-solid fa-rotate-right" /> Refazer</>) : (<><i className="fa-solid fa-play text-[10px]" /> Iniciar Teste</>)}
      </a>
    </div>
  );
}
