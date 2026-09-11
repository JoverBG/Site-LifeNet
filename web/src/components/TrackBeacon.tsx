"use client";
import { useEffect } from "react";
import { phpUrl } from "@/lib/site-api";

/**
 * Beacon de visitas: o IP real é capturado NO NAVEGADOR (api.ipify.org),
 * porque o nginx só enxerga o CCR edge por causa do hairpin. Igual ao PHP.
 */
export default function TrackBeacon() {
  useEffect(() => {
    try {
      let vid = localStorage.getItem("ln_vid");
      if (!vid) {
        vid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
        localStorage.setItem("ln_vid", vid);
      }
      const send = (body: Record<string, unknown>) => {
        const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
        if (navigator.sendBeacon) navigator.sendBeacon(phpUrl("api/track.php"), blob);
        else fetch(phpUrl("api/track.php"), { method: "POST", body: blob, keepalive: true }).catch(() => {});
      };
      const base: Record<string, unknown> = { path: location.pathname, referrer: document.referrer, vid };
      fetch("https://api.ipify.org?format=json")
        .then((r) => r.json())
        .then((d) => { base.ip = d && d.ip; send(base); })
        .catch(() => send(base));
    } catch { /* tracking nunca quebra a página */ }
  }, []);
  return null;
}
