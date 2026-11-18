/** Upload do teste de velocidade: recebe o envio e descarta (nada é guardado). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const reader = req.body?.getReader();
  if (reader) {
    for (;;) {
      const { done } = await reader.read();
      if (done) break;
    }
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
