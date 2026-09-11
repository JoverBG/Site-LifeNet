"use client";
import { useEffect, useRef } from "react";

/** Fundo de partículas azul/laranja — mesmo algoritmo do index.php. */
export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type P = { x: number; y: number; size: number; sx: number; sy: number; color: string };
    const particles: P[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      sx: Math.random() * 0.4 - 0.2,
      sy: Math.random() * 0.4 - 0.2,
      color: Math.random() > 0.5 ? "#007BFF" : "#FF8C00",
    }));

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.sx; p.y += p.sy;
        if (p.x > canvas.width) p.x = 0; if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0; if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas id="particles-canvas" ref={ref} aria-hidden="true" />;
}
