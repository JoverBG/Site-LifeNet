import { Fragment, type CSSProperties } from "react";

/**
 * Título que entra palavra por palavra, saindo do desfoque com atraso escalonado
 * (o reveal do tirvu.com.br). O texto vai inteiro no HTML do servidor: o Google
 * e quem está sem JS leem o título normal; só o CSS esconde cada palavra até o
 * Effects marcar o container com `.is-in`.
 *
 * `mark` é uma palavra do texto que ganha um sublinhado "à mão" que se desenha
 * logo depois que ela aparece (efeito `data-draw`).
 *
 * O container precisa de `data-inview` (quem observa a entrada na tela é o Effects).
 */
export default function SplitWords({ text, mark, delay = 0, step = 70 }: {
  text: string; mark?: string; delay?: number; step?: number;
}) {
  const words = text.split(" ");
  // pontuação no fim não conta: mark="ligada" e mark="ligada." marcam a mesma palavra
  const clean = (s: string) => s.replace(/[.,!?]$/, "");
  return (
    <>
      {words.map((w, i) => {
        const d = { "--d": `${delay + i * step}ms` } as CSSProperties;
        const marked = mark && clean(w) === clean(mark);
        // O espaço fica FORA do inline-block: dentro dele, o espaço do fim some e as palavras grudam
        return (
          <Fragment key={i}>
            <span className="sw">
              <span className="sw-i" style={d}>
                {marked ? <MarkWord word={w} delayMs={delay + i * step + 450} /> : w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
}

/** Palavra com sublinhado SVG desenhado (pathLength=1 deixa o dasharray independente do tamanho). */
export function MarkWord({ word, delayMs = 0 }: { word: string; delayMs?: number }) {
  return (
    <span className="mark-word">
      {word}
      <svg className="mark-svg" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        <path className="draw-path" pathLength={1} style={{ "--d": `${delayMs}ms` } as CSSProperties}
          d="M3 14 C 45 5, 110 3, 197 9" />
        <path className="draw-path draw-path--2" pathLength={1} style={{ "--d": `${delayMs + 250}ms` } as CSSProperties}
          d="M18 18 C 70 11, 130 10, 186 14" />
      </svg>
    </span>
  );
}
