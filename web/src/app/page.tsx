import { fetchSite } from "@/lib/site-api";
import Particles from "@/components/Particles";
import RevealOnScroll from "@/components/RevealOnScroll";
import TrackBeacon from "@/components/TrackBeacon";
import Navbar from "@/components/Navbar";
import BannerSwiper from "@/components/BannerSwiper";
import Hero from "@/components/Hero";
import BenefitsBar from "@/components/BenefitsBar";
import Plans from "@/components/Plans";
import SpeedTest from "@/components/SpeedTest";
import Coverage from "@/components/Coverage";
import Contact from "@/components/Contact";
import ServicesStatus from "@/components/ServicesStatus";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

// ISR: página estática, revalidada a cada 60s (o conteúdo vem do admin PHP e muda pouco)
export const revalidate = 60;

export default async function Home() {
  const site = await fetchSite();
  const { settings } = site;

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-[url('/img/fundo.png')] bg-cover bg-center bg-no-repeat -z-20 opacity-30 pointer-events-none" />
      <Particles />
      <Navbar settings={settings} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        <BannerSwiper images={site.carousel} whatsapp={settings.whatsapp_digits} />
        <Hero whatsappLink={settings.whatsapp_link} />
        <BenefitsBar />
        <Plans plans={site.plans} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 gs-reveal">
          <SpeedTest speedtestUrl={settings.speedtest_url} />
          <Coverage whatsappDigits={settings.whatsapp_digits} />
          <Contact whatsappLink={settings.whatsapp_link} instagram={settings.instagram_link} />
        </div>

        <ServicesStatus />
      </div>

      <Footer settings={settings} />
      <FloatingWhatsApp href={settings.whatsapp_link} />
      <RevealOnScroll />
      <TrackBeacon />
    </>
  );
}
