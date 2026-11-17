import { fetchSite } from "@/lib/site-api";
import Particles from "@/components/Particles";
import RevealOnScroll from "@/components/RevealOnScroll";
import Effects from "@/components/Effects";
import Marquee from "@/components/Marquee";
import TrackBeacon from "@/components/TrackBeacon";
import Navbar from "@/components/Navbar";
import BannerSwiper from "@/components/BannerSwiper";
import Hero from "@/components/Hero";
import WhyLifeNet from "@/components/WhyLifeNet";
import Plans from "@/components/Plans";
import SpeedTest from "@/components/SpeedTest";
import Coverage from "@/components/Coverage";
import Contact from "@/components/Contact";
import ServicesStatus from "@/components/ServicesStatus";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import FloatingCTA from "@/components/FloatingCTA";
import ProgressRail from "@/components/ProgressRail";
import SectionHead from "@/components/SectionHead";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import PlanFinder from "@/components/PlanFinder";
import AppSection from "@/components/AppSection";

// ISR: página estática, revalidada a cada 60s (o conteúdo vem do admin PHP e muda pouco)
export const revalidate = 60;

export default async function Home() {
  const site = await fetchSite();
  const { settings } = site;

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-hero bg-cover bg-center bg-no-repeat -z-20 opacity-20 pointer-events-none" />
      <div className="page-grid" aria-hidden="true" />
      <Particles />
      <Navbar settings={settings} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-8 space-y-28 md:space-y-36">
        <Hero whatsappLink={settings.whatsapp_link} />

        <div className="space-y-12">
          <Marquee />
          <BannerSwiper images={site.carousel} whatsapp={settings.whatsapp_digits} plans={site.plans} />
        </div>

        <WhyLifeNet />
        <Plans plans={site.plans} />
        <PlanFinder plans={site.plans} />
        <Stats />
        <HowItWorks whatsappLink={settings.whatsapp_link} />

        <section id="atendimento" data-rail="Atendimento" data-cta-hide className="pt-10">
          <SectionHead n="06" eyebrow="Atendimento" title="Tudo o que você precisa, a um clique." mark="clique."
            sub="Teste sua velocidade, confira a cobertura no seu bairro ou fale direto com a nossa equipe." className="mb-14" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div data-reveal><SpeedTest speedtestUrl={settings.speedtest_url} /></div>
            <div data-reveal data-delay="100"><Coverage whatsappDigits={settings.whatsapp_digits} /></div>
            <div data-reveal data-delay="200"><Contact whatsappLink={settings.whatsapp_link} instagram={settings.instagram_link} email={settings.contact_email} /></div>
          </div>
        </section>

        <AppSection />
        <ServicesStatus />
        <Faq whatsappLink={settings.whatsapp_link} portal={settings.customer_portal_link} />
        <FinalCTA whatsappLink={settings.whatsapp_link} />
      </main>

      <Footer settings={settings} />
      <ProgressRail />
      <FloatingCTA />
      <FloatingWhatsApp href={settings.whatsapp_link} />
      <RevealOnScroll />
      <Effects />
      <TrackBeacon />
    </>
  );
}
