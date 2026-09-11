"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { CarouselImage } from "@/lib/site-api";
import { assetUrl, waLink } from "@/lib/site-api";

const slideCls = "relative w-full h-[260px] md:h-[380px] lg:h-[450px] rounded-[2rem] overflow-hidden";

export default function BannerSwiper({ images, whatsapp }: { images: CarouselImage[]; whatsapp: string }) {
  const banners = images.length > 0 ? images.map((i) => assetUrl(i.image_path)) : ["/img/Carrossel1.png"];
  return (
    <div className="gs-reveal w-full rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(255,140,0,0.3)]">
      <Swiper modules={[Autoplay, Pagination]} loop autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }}
        className="bannerSwiper">
        {banners.map((src) => (
          <SwiperSlide key={src} className={slideCls}>
            <a href={waLink(whatsapp)} target="_blank" rel="noopener" className="block w-full h-full cursor-pointer hover:opacity-95 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Banner Promoção" className="w-full h-full object-cover" />
            </a>
          </SwiperSlide>
        ))}

        {/* Slide fixo: 600 MEGA (igual ao PHP) */}
        <SwiperSlide className="relative w-full h-[260px] md:h-[380px] lg:h-[450px] bg-gradient-to-r from-blue-700 to-indigo-900 flex items-center justify-between px-8 md:px-20 rounded-[2rem]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none rounded-[2rem]" />
          <div className="z-20 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none">600</div>
            <div className="text-3xl md:text-5xl font-black italic text-cyan-400">MEGA</div>
            <div className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-4 py-1.5 mt-3 rounded-full uppercase tracking-[0.2em] inline-block">Plano Gamer + TV</div>
          </div>
          <div className="z-20 text-center flex-col items-center hidden lg:flex">
            <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-[-12px]">Melhor oferta</p>
            <div className="flex items-start">
              <span className="text-2xl font-bold mt-6 mr-1 text-white">R$</span>
              <span className="text-[10rem] font-black text-cyan-400 drop-shadow-2xl leading-none">99</span>
              <div className="flex flex-col text-left mt-6 ml-1">
                <span className="text-3xl font-bold text-white leading-none">,99</span>
                <span className="text-2xl font-bold text-white">/mês</span>
              </div>
            </div>
          </div>
          <div className="z-20 hidden md:block">
            <a href={waLink(whatsapp, "Olá! Vi o banner de 600 Mega e quero assinar.")} target="_blank" rel="noopener"
              className="bg-blue-600 hover:bg-blue-500 border-2 border-white text-white font-black italic text-xl px-10 py-5 rounded-full shadow-[0_0_30px_rgba(0,123,255,0.6)] transform hover:scale-105 transition block text-center leading-tight">
              ASSINE JÁ SEM<br />SAIR DE CASA
            </a>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
