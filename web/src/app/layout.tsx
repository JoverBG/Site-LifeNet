import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
// CSS do Swiper ANTES do Tailwind: assim as classes utilitárias (h-[260px], flex...)
// vencem o .swiper-slide, como acontece no PHP com o Tailwind CDN injetado por último.
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./globals.css";
import Preloader from "@/components/Preloader";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"], // mesmos pesos do site PHP (font-black cai no 800)
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://lifenett.com.br";

// Roda antes da primeira pintura. sessionStorage pode lançar (aba anônima, cookies
// bloqueados): aí só não tem preloader.
const PRE_PAINT = `(function(){var h=document.documentElement;h.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('ln-pre')){sessionStorage.setItem('ln-pre','1');h.classList.add('preload')}}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LifeNet | Internet Fibra Óptica em Pontal do Araguaia - MT",
  description:
    "Internet fibra óptica de verdade em Pontal do Araguaia e região. Planos de até 1 Giga, instalação grátis, sem fidelidade, Wi-Fi dual-band e assistente virtual 24h no WhatsApp.",
  keywords: ["internet", "fibra óptica", "provedor", "Pontal do Araguaia", "Barra do Garças", "LifeNet", "wifi"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "LifeNet",
    title: "LifeNet | Conexão que transforma",
    description: "Internet fibra óptica em Pontal do Araguaia - MT. Planos de até 1 Giga com instalação grátis e assistente virtual 24h.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "LifeNet - Internet Fibra Óptica" }],
  },
  twitter: { card: "summary_large_image", title: "LifeNet | Conexão que transforma", images: ["/og.png"] },
  icons: { icon: "/arte/icon.png", apple: "/arte/apple-icon.png" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#050b14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Marca que há JS antes da primeira pintura: só então o .gs-reveal começa invisível.
            Na primeira visita da sessão (e com movimento liberado) liga também o preloader. */}
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </head>
      <body className="antialiased overflow-x-hidden bg-[#050b14]">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
