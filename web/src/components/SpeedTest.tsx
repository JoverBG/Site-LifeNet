"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { phpUrl, waLink, type Plan } from "@/lib/site-api";
import { measureDownload, measurePing, measureUpload } from "@/lib/speedtest";

/**
 * Teste de velocidade de verdade, medido no servidor da LifeNet (rotas /speedtest/*):
 * ping e oscilação, depois download e upload com várias conexões por 8 s cada.
 * No fim compara com o plano do cliente e deixa mandar o resultado pra Bruna.
 */
type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

// Escala do mostrador igual à dos medidores conhecidos: espaço igual entre as marcas,
// assim 30 Mega não fica "colado" no zero e 1 Giga ainda cabe
const MARKS = [0, 10, 50, 100, 250, 500, 1000];
const MARK_LABEL = ["0", "10", "50", "100", "250", "500", "1000"];
function toFrac(v: number) {
  if (!(v > 0)) return 0;
  for (let i = 1; i < MARKS.length; i++) {
    if (v <= MARKS[i]) return (i - 1 + (v - MARKS[i - 1]) / (MARKS[i] - MARKS[i - 1])) / (MARKS.length - 1);
  }
  return 1;
}

const nf = (v: number, d: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtMbps = (v: number) => nf(v, v < 10 ? 2 : v < 100 ? 1 : 0);
const fmtMs = (v: number) => nf(v, v < 10 ? 1 : 0);

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Pronto", ping: "Ping", download: "Download", upload: "Upload", done: "Download", error: "Interrompido",
};

export default function SpeedTest({ speedtestUrl, whatsappDigits, plans }: { speedtestUrl: string; whatsappDigits: string; plans: Plan[] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [down, setDown] = useState<number | null>(null);
  const [up, setUp] = useState<number | null>(null);
  const [ping, setPing] = useState<{ ping: number; jitter: number } | null>(null);
  const [shown, setShown] = useState(0); // valor do ponteiro (suavizado)
  const [plan, setPlan] = useState<Plan | null>(null);
  const target = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const running = phase === "ping" || phase === "download" || phase === "upload";

  // Ponteiro desliza até o valor medido (as amostras chegam a cada 200 ms)
  useEffect(() => {
    // Suavização por tempo (não por quadro): acompanha igual em tela de 60 Hz, 144 Hz ou lenta
    let raf = 0, last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(500, now - last) : 16;
      last = now;
      const k = 1 - Math.exp(-dt / 110);
      setShown((s) => {
        const d = target.current - s;
        return Math.abs(d) < 0.05 ? target.current : s + d * k;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => () => abort.current?.abort(), []);

  // Aba em segundo plano pausa o requestAnimationFrame: aí o ponteiro pula direto pro valor
  const aim = (v: number) => {
    target.current = v;
    if (typeof document !== "undefined" && document.hidden) setShown(v);
  };

  const run = async () => {
    if (running) return;
    const ctrl = new AbortController();
    abort.current = ctrl;
    setDown(null); setUp(null); setPing(null); aim(0);
    try {
      setPhase("ping");
      setPing(await measurePing(ctrl.signal));

      setPhase("download");
      const d = await measureDownload(ctrl.signal, aim);
      setDown(d);

      aim(0);
      setPhase("upload");
      await new Promise((r) => setTimeout(r, 500));
      const u = await measureUpload(ctrl.signal, aim);
      setUp(u);

      aim(d);
      setPhase("done");
      // Mesmo registro de antes (o admin mostra o histórico de download)
      const fd = new FormData();
      fd.append("speed", d.toFixed(2) + " Mbps");
      fetch(phpUrl("api/speedtest_log.php"), { method: "POST", body: fd }).catch(() => {});
    } catch {
      if (!ctrl.signal.aborted) { aim(0); setPhase("error"); }
    }
  };

  const frac = toFrac(shown);
  const angle = -120 + frac * 240;
  const rad = (a: number) => (a * Math.PI) / 180;
  const ticks = Array.from({ length: 13 }, (_, i) => -120 + i * 20);

  const pct = plan && down != null && plan.speed_mbps > 0 ? Math.round((down / plan.speed_mbps) * 100) : null;
  const verdict = pct == null ? null
    : pct >= 80 ? { tone: "good", text: `Ótimo! Você está recebendo ${pct}% do seu plano.` }
    : pct >= 50 ? { tone: "warn", text: `${pct}% do plano. Se estiver no Wi-Fi, teste perto do roteador ou com cabo.` }
    : { tone: "bad", text: `Só ${pct}% do plano. Mande o resultado pra Bruna que a gente verifica.` };

  const msg = down != null
    ? `Olá, Bruna! Fiz o teste de velocidade no site: download ${fmtMbps(down)} Mbps, upload ${up != null ? fmtMbps(up) : "-"} Mbps, ping ${ping ? fmtMs(ping.ping) : "-"} ms${plan ? `. Meu plano é de ${plan.speed.value} ${plan.speed.unit}` : ""}.`
    : "";

  const stats: { key: string; icon: string; label: string; value: string | null; unit: string; on: boolean }[] = [
    { key: "down", icon: "fa-arrow-down", label: "Download", value: down != null ? fmtMbps(down) : null, unit: "Mbps", on: phase === "download" },
    { key: "up", icon: "fa-arrow-up", label: "Upload", value: up != null ? fmtMbps(up) : null, unit: "Mbps", on: phase === "upload" },
    { key: "ping", icon: "fa-bolt", label: "Ping", value: ping ? fmtMs(ping.ping) : null, unit: "ms", on: phase === "ping" },
    { key: "jit", icon: "fa-wave-square", label: "Oscilação", value: ping ? fmtMs(ping.jitter) : null, unit: "ms", on: phase === "ping" },
  ];

  return (
    <div className={`svc-card st spotlight relative h-full is-${phase}`} style={{ "--glow": "0 123 255" } as CSSProperties}>
      <div className="svc-card__head">
        <span className="svc-card__icon bg-[#007BFF]/15 text-[#38bdf8]"><i aria-hidden="true" className="fa-solid fa-gauge-high" /></span>
        <div>
          <h3 className="svc-card__title">Teste sua velocidade</h3>
          <p className="svc-card__sub">Medido direto no servidor da LifeNet</p>
        </div>
      </div>

      <div className={`speedo ${running ? "is-running" : ""}`} role="img" aria-label={`Velocidade: ${fmtMbps(shown)} Mbps`}>
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <defs>
            <linearGradient id="speedo-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#007BFF" />
              <stop offset=".55" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#FF8C00" />
            </linearGradient>
          </defs>
          <path className="speedo__base" d="M36.4 142.5 A85 85 0 1 1 183.6 142.5" pathLength={100} />
          <path className="speedo__fill" d="M36.4 142.5 A85 85 0 1 1 183.6 142.5" pathLength={100} style={{ strokeDashoffset: 100 - frac * 100 }} />
          {ticks.map((t, i) => (
            <line key={t} className={`speedo__tick ${i % 2 === 0 ? "speedo__tick--big" : ""}`} x1="110" y1="30" x2="110" y2={i % 2 === 0 ? 40 : 35}
              transform={`rotate(${t} 110 100)`} />
          ))}
          {MARK_LABEL.map((l, i) => {
            const a = rad(-120 + i * 40);
            return (
              <text key={l} className={`speedo__label ${shown >= MARKS[i] && shown > 0 ? "is-lit" : ""}`} x={110 + 104 * Math.sin(a)} y={100 - 104 * Math.cos(a) + 3} textAnchor="middle">{l}</text>
            );
          })}
          <circle className="speedo__knob" r="7" cx={110 + 85 * Math.sin(rad(angle))} cy={100 - 85 * Math.cos(rad(angle))} />
        </svg>
        <div className="speedo__value">
          <span className="tabular-nums">{fmtMbps(shown)}</span>
          <small>Mbps</small>
        </div>
        <em className="st-phase">
          {running && <i aria-hidden="true" className="st-phase__dot" />}
          {PHASE_LABEL[phase]}
        </em>
      </div>

      <dl className="st-stats" aria-live="polite">
        {stats.map((s) => (
          <div key={s.key} className={`st-stat ${s.on ? "is-on" : ""} ${s.value ? "has-value" : ""}`}>
            <dt><i aria-hidden="true" className={`fa-solid ${s.icon}`} /> {s.label}</dt>
            <dd>{s.value ?? "—"}<small>{s.value ? ` ${s.unit}` : ""}</small></dd>
          </div>
        ))}
      </dl>

      {phase === "done" && plans.length > 0 ? (
        <div className="st-plan">
          <p className="st-plan__q">Qual é o seu plano?</p>
          <div className="st-plan__chips">
            {plans.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlan(p)} aria-pressed={plan?.id === p.id}
                className={`st-chip ${plan?.id === p.id ? "is-on" : ""}`}>{p.speed.value} {p.speed.unit}</button>
            ))}
          </div>
          {verdict && pct != null && (
            <div className={`st-verdict tone-${verdict.tone}`}>
              <span className="st-verdict__bar"><span style={{ width: `${Math.min(100, pct)}%` }} /></span>
              <p>{verdict.text}</p>
            </div>
          )}
        </div>
      ) : phase === "error" ? (
        <p className="st-note st-note--err"><i aria-hidden="true" className="fa-solid fa-triangle-exclamation" /> Não deu para concluir o teste. Verifique sua conexão e tente de novo.</p>
      ) : (
        <p className="st-note"><i aria-hidden="true" className="fa-solid fa-circle-info" /> Para medir certo: use cabo ou Wi-Fi 5 GHz perto do roteador e pause os downloads.</p>
      )}

      <div className="st-actions">
        <button type="button" onClick={run} disabled={running}
          className="svc-btn bg-[#007BFF] hover:bg-blue-600 shadow-[0_0_24px_rgba(0,123,255,0.45)] disabled:opacity-80 disabled:hover:translate-y-0">
          {running ? (<><i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin" /> Medindo...</>)
            : phase === "done" || phase === "error" ? (<><i aria-hidden="true" className="fa-solid fa-rotate-right" /> Refazer teste</>)
            : (<><i aria-hidden="true" className="fa-solid fa-play text-[11px]" /> Iniciar teste</>)}
        </button>
        <div className="st-links">
          {phase === "done" && (
            <a href={waLink(whatsappDigits, msg)} target="_blank" rel="noopener" className="st-link st-link--wa">
              <i aria-hidden="true" className="fa-brands fa-whatsapp" /> Enviar resultado para a Bruna
            </a>
          )}
          <a href={speedtestUrl} target="_blank" rel="noopener" className="st-link">
            Testar também no Speedtest <i aria-hidden="true" className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
          </a>
        </div>
      </div>
    </div>
  );
}
