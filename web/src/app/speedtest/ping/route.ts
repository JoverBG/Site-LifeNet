/** Ping do teste de velocidade: resposta vazia, só pra medir o tempo de ida e volta. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
