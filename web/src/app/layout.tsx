import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
// CSS do Swiper ANTES do Tailwind: assim as classes utilitárias (h-[260px], flex...)
// vencem o .swiper-slide, como acontece no PHP com o Tailwind CDN injetado por último.
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"], // mesmos pesos do site PHP (font-black cai no 800)
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://lifenett.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LifeNet | Internet Fibra Óptica em Pontal do Araguaia - MT",
  description:
    "Internet fibra óptica de verdade em Pontal do Araguaia e região. Planos de até 1 Giga, instalação grátis, sem fidelidade, Wi-Fi dual-band e suporte 24h pelo WhatsApp.",
  keywords: ["internet", "fibra óptica", "provedor", "Pontal do Araguaia", "Barra do Garças", "LifeNet", "wifi"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "LifeNet",
    title: "LifeNet | Conexão que transforma",
    description: "Internet fibra óptica em Pontal do Araguaia - MT. Planos de até 1 Giga com instalação grátis e suporte 24h.",
    images: [{ url: "/img/logo.png", alt: "LifeNet" }],
  },
  twitter: { card: "summary_large_image", title: "LifeNet | Conexão que transforma", images: ["/img/logo.png"] },
  icons: { icon: "/img/logo.png", apple: "/img/logo.png" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#050b14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Marca que há JS antes da primeira pintura: só então o .gs-reveal começa invisível */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased overflow-x-hidden bg-[#050b14]">{children}</body>
    </html>
  );
}
