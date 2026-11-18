import SplitWords from "./SplitWords";

/**
 * Cabeçalho padrão das seções, no formato do tirvu.com.br: rótulo numerado
 * "(02) Planos", título que entra palavra por palavra (com uma palavra
 * sublinhada à mão) e um parágrafo que sobe logo depois.
 */
export default function SectionHead({ n, eyebrow, title, mark, sub, align = "center", color = "#007BFF", className = "" }: {
  n?: string; eyebrow: string; title: string; mark?: string; sub?: string;
  align?: "center" | "left"; color?: string; className?: string;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl ${className}`}>
      <p data-reveal className={`section-eyebrow ${center ? "justify-center" : ""}`} style={{ color }}>
        {n && <span className="section-eyebrow__n">({n})</span>}
        {eyebrow}
      </p>
      <h2 data-inview data-split data-draw className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
        <SplitWords text={title} mark={mark} />
      </h2>
      {sub && (
        <p data-reveal data-delay="250" className={`text-gray-400 text-base md:text-lg leading-relaxed mt-5 ${center ? "mx-auto" : ""} max-w-2xl`}>
          {sub}
        </p>
      )}
    </div>
  );
}
