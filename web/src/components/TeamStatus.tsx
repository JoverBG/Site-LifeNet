"use client";
import { useEffect, useState } from "react";
import { HORARIO_TEXTO, statusEquipe } from "@/lib/atendimento";

/**
 * "Equipe online até 18h" / "Equipe volta amanhã às 8h", no horário de Brasília.
 * A página é estática (ISR), então o cálculo roda no navegador; antes de
 * hidratar mostra só o horário, que é sempre verdade.
 */
export default function TeamStatus({ className = "" }: { className?: string }) {
  const [s, setS] = useState<ReturnType<typeof statusEquipe> | null>(null);
  useEffect(() => {
    const tick = () => setS(statusEquipe());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`team-status ${s ? (s.aberta ? "is-open" : "is-closed") : ""} ${className}`} title={HORARIO_TEXTO.curto}>
      <span className="team-status__dot" aria-hidden="true" />
      {s ? s.texto : HORARIO_TEXTO.curto}
    </span>
  );
}
