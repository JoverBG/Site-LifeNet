"use client";
import { useMemo, useState, type CSSProperties } from "react";
import type { Plan } from "@/lib/site-api";
import SectionHead from "./SectionHead";

/**
 * "Qual plano combina com você?": a pessoa marca quantos moram na casa e o
 * que mais usa, e o simulador indica o menor plano cadastrado que cobre a
 * estimativa. Embaixo, o tempo teórico pra baixar um jogo de 50 GB em cada
 * plano (conta simples: 50 GB = 400.000 megabits ÷ velocidade).
 *
 * É uma estimativa de bolso, não uma promessa, e o texto deixa isso claro.
 */
const people = [
  { id: "1-2", label: "1 a 2 pessoas", base: 100 },
  { id: "3-4", label: "3 a 4 pessoas", base: 250 },
  { id: "5+", label: "5 ou mais", base: 400 },
] as const;

const uses = [
  { id: "4k", icon: "fa-tv", label: "Filmes e séries em 4K", add: 100 },
  { id: "games", icon: "fa-gamepad", label: "Jogos online", add: 100 },
  { id: "work", icon: "fa-laptop", label: "Home office e chamadas", add: 80 },
  { id: "smart", icon: "fa-house-signal", label: "Muitos aparelhos conectados", add: 80 },
  { id: "dl", icon: "fa-download", label: "Downloads pesados", add: 200 },
] as const;

const GAME_MEGABITS = 50 * 8 * 1000; // 50 GB

function fmtTime(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${String(min % 60).padStart(2, "0")} min`;
}

function accentFor(p: Plan) {
  if (p.popular) return "#FF8C00";
  if (p.best_seller) return "#22c55e";
  if (p.custom_badge && /^#[0-9a-f]{6}$/i.test(p.custom_badge_color)) return p.custom_badge_color;
  return "#007BFF";
}

export default function PlanFinder({ plans }: { plans: Plan[] }) {
  const [who, setWho] = useState<(typeof people)[number]["id"]>("3-4");
  const [picked, setPicked] = useState<string[]>(["4k", "work"]);

  const sorted = useMemo(() => [...plans].filter((p) => p.speed_mbps > 0).sort((a, b) => a.speed_mbps - b.speed_mbps), [plans]);
  const need = (people.find((p) => p.id === who)?.base ?? 0) + uses.filter((u) => picked.includes(u.id)).reduce((s, u) => s + u.add, 0);
  const best = sorted.find((p) => p.speed_mbps >= need) ?? sorted[sorted.length - 1];
  const whoIndex = people.findIndex((p) => p.id === who);

  if (!best) return null;
  const accent = accentFor(best);
  const slowest = sorted.length ? GAME_MEGABITS / sorted[0].speed_mbps : 1;

  const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <section id="simulador" data-rail="Simulador" data-cta-hide className="pt-10">
      <SectionHead n="03" eyebrow="Simulador" title="Qual plano combina com você?" mark="você?"
        sub="Conte como é a sua casa e a gente indica a velocidade. Leva dez segundos." />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 mt-14">
        {/* Perguntas */}
        <div data-reveal className="finder-panel">
          <p className="finder-q"><span>1</span> Quantas pessoas usam a internet?</p>
          <div role="radiogroup" aria-label="Pessoas na casa" className="seg" style={{ "--i": whoIndex, "--n": people.length } as CSSProperties}>
            <span className="seg__pill" aria-hidden="true" />
            {people.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={who === p.id} onClick={() => setWho(p.id)} className="seg__btn">
                {p.label}
              </button>
            ))}
          </div>

          <p className="finder-q mt-9"><span>2</span> O que vocês mais fazem?</p>
          <div className="flex flex-wrap gap-2.5">
            {uses.map((u) => {
              const on = picked.includes(u.id);
              return (
                <button key={u.id} type="button" aria-pressed={on} onClick={() => toggle(u.id)} className="use-chip">
                  <i aria-hidden="true" className={`fa-solid ${u.icon}`} /> {u.label}
                  <span className="use-chip__tick" aria-hidden="true"><i className="fa-solid fa-check" /></span>
                </button>
              );
            })}
          </div>

          <div className="mt-9 flex items-center gap-4">
            <div className="need-meter" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (need / 1000) * 100)}%` }} />
            </div>
            <p className="shrink-0 font-mono text-xs text-gray-400">
              ~<strong className="text-white tabular-nums">{need}</strong> Mega
            </p>
          </div>
        </div>

        {/* Resultado */}
        <div data-reveal data-delay="120" className="finder-result" style={{ "--accent": accent } as CSSProperties} aria-live="polite">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">Recomendado pra você</p>
          <div key={best.id} className="finder-swap">
            <p className="mt-4 font-black tracking-tighter leading-none" style={{ color: accent }}>
              <span className="text-7xl md:text-8xl">{best.speed.value}</span>
              <span className="text-2xl ml-2 tracking-normal">{best.speed.unit}</span>
            </p>
            <p className="mt-4 text-gray-300">
              <span className="text-3xl font-black text-white">R$ {best.price}</span> <span className="text-sm text-gray-400">/mês</span>
            </p>
          </div>
          <a href={best.whatsapp_link} target="_blank" rel="noopener" data-magnetic data-cursor="Assinar"
            className="plan-btn mt-7 w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-black text-white text-lg"
            style={{ background: accent, boxShadow: `0 14px 40px -12px ${accent}` }}>
            Quero esse plano <i aria-hidden="true" className="fa-solid fa-arrow-right text-sm" />
          </a>

          <div className="mt-9 border-t border-white/5 pt-7">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <i aria-hidden="true" className="fa-solid fa-gamepad text-[#38bdf8]" /> Baixar um jogo de 50 GB
            </p>
            <ul className="mt-4 space-y-3">
              {sorted.map((p) => {
                const t = GAME_MEGABITS / p.speed_mbps;
                const on = p.id === best.id;
                return (
                  <li key={p.id} className={`dl-row ${on ? "is-on" : ""}`} style={{ "--accent": accentFor(p) } as CSSProperties}>
                    <span className="w-20 shrink-0 text-xs font-bold text-gray-300">{p.speed.value} {p.speed.unit === "GIGA" ? "Giga" : "Mega"}</span>
                    <span className="dl-bar"><span style={{ width: `${Math.max(6, (t / slowest) * 100)}%` }} /></span>
                    <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-white">{fmtTime(t)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              Estimativa simples, na velocidade máxima de cada plano. O tempo real depende do Wi-Fi, do aparelho e do servidor do jogo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
