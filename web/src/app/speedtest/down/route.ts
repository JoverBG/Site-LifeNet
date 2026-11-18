import { randomBytes } from "node:crypto";

/**
 * Download do teste de velocidade: manda N MB de dados aleatórios (não comprimem,
 * então nem o Next nem o nginx encolhem o arquivo e falseiam a medição).
 * O mesmo bloco de 1 MB é reenviado várias vezes: não gasta CPU gerando dado novo.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MB = 1 << 20;
const BLOCK = randomBytes(MB);

export function GET(req: Request) {
  const asked = Number(new URL(req.url).searchParams.get("mb"));
  const total = Math.min(100, Math.max(1, Number.isFinite(asked) ? Math.floor(asked) : 25));
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(ctrl) {
      if (sent >= total) { ctrl.close(); return; }
      ctrl.enqueue(BLOCK);
      sent++;
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(total * MB),
      "Cache-Control": "no-store, no-transform",
      // nginx: entrega direto, sem guardar a resposta em arquivo temporário
      "X-Accel-Buffering": "no",
    },
  });
}
