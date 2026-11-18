/**
 * Motor do teste de velocidade (roda no navegador, contra as rotas /speedtest/* do próprio site).
 *
 * Por que não baixar um arquivo só: em fibra rápida um arquivo de poucos MB termina antes
 * da conexão "embalar" e o resultado sai bem abaixo do real. Aqui o download e o upload
 * usam várias conexões ao mesmo tempo por alguns segundos, e o começo (enquanto a
 * conexão acelera) é descartado da conta.
 */

const BASE = "/speedtest";
const bust = () => `r=${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type PingResult = { ping: number; jitter: number };

/** Ping = menor tempo de ida e volta; oscilação (jitter) = média da variação entre medições seguidas. */
export async function measurePing(signal: AbortSignal, rounds = 12): Promise<PingResult> {
  const times: number[] = [];
  // Primeira chamada abre a conexão (TLS); não entra na conta
  await fetch(`${BASE}/ping?${bust()}`, { cache: "no-store", signal });
  for (let i = 0; i < rounds; i++) {
    const url = `${BASE}/ping?${bust()}`;
    const t = performance.now();
    await fetch(url, { cache: "no-store", signal });
    let ms = performance.now() - t;
    // Resource Timing tira o tempo do próprio JS da conta, quando o navegador informa
    const entry = performance.getEntriesByName(new URL(url, location.href).href).pop() as PerformanceResourceTiming | undefined;
    if (entry && entry.requestStart > 0 && entry.responseStart > entry.requestStart) ms = entry.responseStart - entry.requestStart;
    times.push(ms);
    await sleep(40);
  }
  performance.clearResourceTimings?.();
  const ping = Math.min(...times);
  let jit = 0;
  for (let i = 1; i < times.length; i++) jit += Math.abs(times[i] - times[i - 1]);
  return { ping, jitter: times.length > 1 ? jit / (times.length - 1) : 0 };
}

type Opts = { streams: number; duration: number; grace: number; onRate: (mbps: number) => void };

/** Mede a taxa enquanto `work` soma bytes; descarta o período de aceleração (grace). */
async function sample(signal: AbortSignal, o: Opts, start: (count: (n: number) => void, stopped: () => boolean) => Promise<void>[], onStop: () => void) {
  let bytes = 0, done = false;
  const t0 = performance.now();
  let gB = 0, gT = 0, graced = false, rate = 0;
  const workers = start((n) => { bytes += n; }, () => done || signal.aborted);
  while (!signal.aborted) {
    await sleep(200);
    const now = performance.now() - t0;
    if (!graced && now >= o.grace) { graced = true; gB = bytes; gT = now; }
    const b = graced ? bytes - gB : bytes;
    const s = (graced ? now - gT : now) / 1000;
    if (s > 0) rate = (b * 8) / s / 1e6;
    o.onRate(rate);
    if (now >= o.duration) break;
  }
  done = true;
  onStop(); // corta as transferências em andamento na hora (não espera o arquivo acabar)
  await Promise.allSettled(workers);
  if (signal.aborted) throw new DOMException("Cancelado", "AbortError");
  return rate;
}

export async function measureDownload(signal: AbortSignal, onRate: (mbps: number) => void, o: Partial<Opts> = {}) {
  const opts: Opts = { streams: 6, duration: 8000, grace: 1500, onRate, ...o };
  const ctrl = new AbortController();
  const abort = () => ctrl.abort();
  signal.addEventListener("abort", abort);
  try {
    return await sample(signal, opts, (count, stopped) =>
      Array.from({ length: opts.streams }, async (_, i) => {
        await sleep(i * 120);
        while (!stopped()) {
          try {
            const res = await fetch(`${BASE}/down?mb=25&${bust()}`, { cache: "no-store", signal: ctrl.signal });
            const reader = res.body?.getReader();
            if (!reader) return;
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              count(value.byteLength);
              if (stopped()) { reader.cancel().catch(() => {}); break; }
            }
          } catch { return; }
        }
      }),
    abort);
  } finally {
    signal.removeEventListener("abort", abort);
  }
}

/** Bloco aleatório pro upload (getRandomValues só aceita 64 KB por vez). */
function randomBlob(size: number) {
  const buf = new Uint8Array(size);
  for (let i = 0; i < size; i += 65536) crypto.getRandomValues(buf.subarray(i, Math.min(size, i + 65536)));
  return new Blob([buf], { type: "application/octet-stream" });
}

export async function measureUpload(signal: AbortSignal, onRate: (mbps: number) => void, o: Partial<Opts> = {}) {
  const opts: Opts = { streams: 4, duration: 8000, grace: 1500, onRate, ...o };
  const payload = randomBlob(4 * (1 << 20));
  const live = new Set<XMLHttpRequest>();
  const abortAll = () => live.forEach((x) => x.abort());
  signal.addEventListener("abort", abortAll);
  try {
    return await sample(signal, opts, (count, stopped) =>
      Array.from({ length: opts.streams }, async (_, i) => {
        await sleep(i * 120);
        while (!stopped()) {
          // XHR porque o fetch não informa o progresso do envio
          const ok = await new Promise<boolean>((resolve) => {
            const x = new XMLHttpRequest();
            let last = 0;
            x.upload.onprogress = (e) => { count(e.loaded - last); last = e.loaded; if (stopped()) x.abort(); };
            x.onload = () => { live.delete(x); resolve(true); };
            x.onerror = x.onabort = x.ontimeout = () => { live.delete(x); resolve(false); };
            x.open("POST", `${BASE}/up?${bust()}`);
            live.add(x);
            x.send(payload);
          });
          if (!ok) return;
        }
      }),
    abortAll);
  } finally {
    signal.removeEventListener("abort", abortAll);
  }
}
