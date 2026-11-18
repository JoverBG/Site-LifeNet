"use client";
import { useEffect, useState } from "react";

/**
 * Palavra que troca sozinha com desfoque (efeito do título do tirvu.com.br).
 * O servidor só manda a primeira palavra: o <h1> que o Google indexa continua
 * "Conexão que transforma", e quem está sem JS vê o título de sempre.
 */
export default function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  if (!animate) return <span className="rotating-word-static">{words[0]}</span>;

  return (
    // inline-grid com todas as palavras na mesma célula: a mais longa define a
    // largura e o título não "pula" na troca
    <span className="rotating-word">
      {words.map((w, n) => (
        <span key={w} className="rotating-word__item" data-state={n === i ? "in" : "out"} aria-hidden={n !== i}>
          {w}
        </span>
      ))}
    </span>
  );
}
