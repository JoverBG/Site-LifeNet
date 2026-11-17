import type { CSSProperties } from "react";
import SectionHead from "./SectionHead";
import { APP } from "@/lib/atendimento";

/**
 * Bloco do app Minha LifeNet: texto + botões das lojas à esquerda, e um
 * celular desenhado em CSS com o ícone e os atalhos do app à direita.
 * Só lista o que o app já faz (fatura, PIX, desbloqueio de confiança e suporte).
 */
const tiles = [
  { icon: "fa-file-invoice-dollar", label: "Fatura", color: "#38bdf8" },
  { icon: "fa-brands fa-pix", label: "PIX", color: "#22c55e" },
  { icon: "fa-unlock", label: "Desbloqueio", color: "#FF8C00" },
  { icon: "fa-headset", label: "Suporte", color: "#a78bfa" },
];

export default function AppSection() {
  return (
    <section id="app" data-rail="App" className="pt-10">
      <div className="app-block grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <SectionHead n="07" eyebrow="Aplicativo" title="Sua LifeNet na palma da mão." mark="mão."
            sub="Com o app Minha LifeNet você resolve tudo sem precisar chamar ninguém." align="left" color="#FF8C00" />

          <ul data-reveal data-delay="300" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {APP.faz.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                <span className="check-dot" style={{ "--accent": "#FF8C00" } as CSSProperties} aria-hidden="true"><i className="fa-solid fa-check" /></span>{f}
              </li>
            ))}
          </ul>

          <div data-reveal data-delay="420" className="flex flex-wrap gap-3 mt-9">
            <a href={APP.playStore} target="_blank" rel="noopener" data-magnetic className="store-btn store-btn--lg">
              <i aria-hidden="true" className="fa-brands fa-google-play" /><span><small>Disponível no</small>Google Play</span>
            </a>
            <a href={APP.appStore} target="_blank" rel="noopener" data-magnetic className="store-btn store-btn--lg">
              <i aria-hidden="true" className="fa-brands fa-apple" /><span><small>Baixar na</small>App Store</span>
            </a>
          </div>
        </div>

        <div data-reveal="scale" data-delay="200" className="flex justify-center">
          <div className="phone" aria-hidden="true">
            <span className="phone__glow" />
            <div className="phone__screen">
              <div className="phone__notch" />
              <div className="flex items-center gap-3 mt-6">
                <img src="/arte/app-icone.webp" alt="" width={256} height={256} loading="lazy" decoding="async" className="w-12 h-12 rounded-2xl" />
                <div className="leading-tight">
                  <p className="text-[10px] text-gray-400">Olá, cliente 👋</p>
                  <p className="text-sm font-black text-white">{APP.nome}</p>
                </div>
              </div>
              <div className="phone__card">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Sua conexão</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white"><span className="live-dot live-dot--sm" /> Online</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {tiles.map((t, i) => (
                  <div key={t.label} className="phone__tile" style={{ "--c": t.color, "--i": i } as CSSProperties}>
                    <i className={t.icon.startsWith("fa-brands") ? t.icon : `fa-solid ${t.icon}`} />
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
