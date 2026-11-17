"use client";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { phpUrl } from "@/lib/site-api";
import SectionHead from "./SectionHead";

type Status = "online" | "slow" | "offline";
type Svc = { name: string; slug: string; icon: string; color: string; status: Status };
type Data = { pages: Svc[][]; total: number; checked_at: string };

const label: Record<Status, string> = { online: "Normal", slow: "Lentidão", offline: "Falha" };
const rank: Record<Status, number> = { offline: 0, slow: 1, online: 2 };
/** Quantos serviços do topo da lista do admin aparecem sempre. */
const MAIN = 8;

/**
 * Linha de "batimento" decorativa: mostra que o serviço está sendo monitorado.
 * Online = batida regular; lentidão = batida arrastada; falha = linha reta.
 */
const beat: Record<Status, string> = {
  online: "M0 12 H34 L38 4 L43 20 L48 8 L52 12 H100 L104 4 L109 20 L114 8 L118 12 H160",
  slow: "M0 12 H40 L46 7 L54 17 L62 9 L68 12 H120 L126 7 L134 17 L142 9 L148 12 H160",
  offline: "M0 12 H160",
};

function Tile({ svc, i }: { svc: Svc; i: number }) {
  return (
    <a href={`https://downdetector.com.br/fora-do-ar/${svc.slug}/`} target="_blank" rel="noopener"
      className={`svc-tile is-${svc.status}`} style={{ "--brand": svc.color, "--i": i } as CSSProperties}
      aria-label={`${svc.name}: ${label[svc.status]}. Abrir no Downdetector`}>
      <span className="svc-tile__icon"><i aria-hidden="true" className={svc.icon} /></span>
      <span className="svc-tile__name">{svc.name}</span>
      <span className="svc-tile__status"><span className="svc-tile__dot" aria-hidden="true" />{label[svc.status]}</span>
      <svg className="svc-tile__beat" viewBox="0 0 160 24" preserveAspectRatio="none" aria-hidden="true">
        <path d={beat[svc.status]} pathLength={1} />
      </svg>
      {svc.status !== "online" && <span className="svc-tile__dd">Ver relatos no Downdetector <i aria-hidden="true" className="fa-solid fa-arrow-up-right-from-square" /></span>}
      <span className="svc-tile__go" aria-hidden="true"><i className="fa-solid fa-arrow-up-right-from-square" /></span>
    </a>
  );
}

export default function ServicesStatus() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [round, setRound] = useState(0);

  const check = useCallback((fresh: boolean) => {
    setChecking(true);
    setError(false);
    fetch(phpUrl("api/services_status.php"), fresh ? { cache: "no-store" } : undefined)
      .then((r) => r.json())
      .then((d: Data) => {
        if (!Array.isArray(d?.pages)) throw new Error("payload");
        setData(d);
        setRound((n) => n + 1);
      })
      .catch(() => setError(true))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => { check(false); }, [check]);

  const all = data?.pages.flat() ?? [];
  // Os primeiros da ordem do admin são os "principais" e aparecem sempre;
  // os demais só aparecem quando têm problema. Com problema sobe pro topo.
  const main = all.slice(0, MAIN);
  const rest = all.slice(MAIN);
  const problems = all.filter((s) => s.status !== "online").sort((a, b) => rank[a.status] - rank[b.status]);
  const shown = [...problems, ...main.filter((s) => s.status === "online")];
  const quiet = rest.filter((s) => s.status === "online");
  const ok = all.filter((s) => s.status === "online").length;
  const slow = all.filter((s) => s.status === "slow").length;
  const down = all.filter((s) => s.status === "offline").length;
  const pct = all.length ? Math.round((ok / all.length) * 100) : 0;
  const tone = !data ? "idle" : down ? "bad" : slow ? "warn" : "good";
  const headline = error ? "Não deu pra testar agora"
    : !data ? "Testando os serviços…"
    : tone === "good" ? "Tudo funcionando"
    : tone === "warn" ? "Algum serviço lento"
    : "Algum serviço fora do ar";
  const detail = error ? "Tente de novo em instantes ou confira no Downdetector."
    : !data ? "Medindo a resposta de cada app a partir da nossa rede."
    : tone === "good" ? `Os ${data.total} serviços responderam normalmente pela rede LifeNet.`
    : `${ok} de ${data.total} normais${slow ? ` · ${slow} com lentidão` : ""}${down ? ` · ${down} sem resposta` : ""}. Se o problema for do app, ele aparece no Downdetector.`;

  return (
    <section id="status" data-rail="Status" className="pt-10">
      <SectionHead n="08" eyebrow="Status dos serviços" title="Seus apps favoritos estão no ar?" mark="ar"
        sub="Testamos em tempo real a disponibilidade dos principais serviços a partir da rede LifeNet." className="mb-12" />

      {/* data-reveal fica num wrapper fixo: o efeito põe classe nele, e o className do painel muda com o status */}
      <div data-reveal>
      <div className={`svc-board tone-${tone} ${checking ? "is-checking" : ""}`}>
        <span className="svc-board__grid" aria-hidden="true" />

        {/* Resumo */}
        <aside className="svc-sum">
          <p className="svc-sum__live"><span className="live-dot live-dot--sm" aria-hidden="true" /> Ao vivo da rede LifeNet</p>

          <div className="svc-ring" role="img" aria-label={data ? `${ok} de ${data.total} serviços normais` : "Testando"}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="svc-ring__base" cx="60" cy="60" r="52" />
              <circle className="svc-ring__fill" cx="60" cy="60" r="52" pathLength={100}
                style={{ strokeDasharray: `${data ? pct : 0} 100` }} />
            </svg>
            <span className="svc-ring__radar" aria-hidden="true" />
            <span className="svc-ring__value">
              {data ? <span className="svc-ring__num"><strong>{ok}</strong><small>/{data.total}</small></span> : <i aria-hidden="true" className="fa-solid fa-satellite-dish" />}
              <em>{data ? "no ar" : "testando"}</em>
            </span>
          </div>

          <h3 className="svc-sum__title">{headline}</h3>
          <p className="svc-sum__text">{detail}</p>

          {data && (
            <dl className="svc-sum__stats">
              <div><dt>Normais</dt><dd className="text-green-400">{ok}</dd></div>
              <div><dt>Lentos</dt><dd className="text-yellow-400">{slow}</dd></div>
              <div><dt>Falhas</dt><dd className="text-red-400">{down}</dd></div>
            </dl>
          )}

          <p className="svc-sum__time">
            <i aria-hidden="true" className="fa-regular fa-clock" /> {data ? <>Última verificação às <strong>{data.checked_at}</strong></> : "Aguardando o primeiro teste"}
          </p>

          <div className="svc-sum__actions">
            <button type="button" onClick={() => check(true)} disabled={checking} className="svc-recheck">
              <i aria-hidden="true" className={`fa-solid fa-rotate-right ${checking ? "fa-spin" : ""}`} />
              {checking ? "Testando…" : "Testar de novo"}
            </button>
            <a href="https://downdetector.com.br/" target="_blank" rel="noopener" className="svc-dd">
              Downdetector <i aria-hidden="true" className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          </div>
        </aside>

        {/* Serviços */}
        <div className="svc-tiles-wrap">
          <span className="svc-scan" aria-hidden="true" />
          <div className="svc-tiles" key={round}>
            {data
              ? shown.map((s, i) => <Tile key={s.slug} svc={s} i={i} />)
              : Array.from({ length: MAIN }).map((_, i) => (
                  <div key={i} className="svc-tile svc-tile--skeleton" style={{ "--i": i } as CSSProperties}>
                    <span className="svc-tile__icon" /><span className="h-3 w-16 rounded bg-white/10" /><span className="h-2.5 w-12 rounded bg-white/5" />
                  </div>
                ))}
          </div>

          {data && quiet.length > 0 && (
            <div className="svc-quiet">
              <span className="svc-quiet__icons" aria-hidden="true">
                {quiet.map((s) => <i key={s.slug} className={s.icon} style={{ color: s.color }} title={s.name} />)}
              </span>
              <span>
                <strong>+{quiet.length} serviços monitorados</strong>{" "}
                {quiet.length === rest.length ? "todos normais" : "normais"}
                <span className="sr-only">: {quiet.map((s) => s.name).join(", ")}</span>
              </span>
              <span className="svc-quiet__hint">Só aparecem aqui se tiverem problema</span>
            </div>
          )}

          <p className="svc-source">
            <i aria-hidden="true" className="fa-solid fa-circle-info" /> Teste automático feito pelo servidor da LifeNet: mostra se o app responde.
            Para ver relatos de outros usuários, consulte o{" "}
            <a href="https://downdetector.com.br/" target="_blank" rel="noopener">Downdetector</a>.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
