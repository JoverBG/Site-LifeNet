"use client";
import type { CSSProperties, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { CarouselImage, Plan } from "@/lib/site-api";
import { assetUrl, waLink } from "@/lib/site-api";
import { APP, BRUNA, HORARIO_TEXTO } from "@/lib/atendimento";

const slideCls = "relative w-full h-[300px] md:h-[380px] lg:h-[450px] rounded-[2rem] overflow-hidden";

/** Acha o plano pela velocidade (o admin manda speed_mbps). */
function planBy(plans: Plan[], mbps: number) {
  return plans.find((p) => p.speed_mbps === mbps);
}

/** "99,99" → ["99", ",99"] pro preço grande com centavos pequenos. */
function splitPrice(price?: string) {
  if (!price) return null;
  const [int, cents] = price.split(",");
  return { int, cents: cents ? `,${cents}` : "" };
}

type Promo = {
  key: string;
  accent: string;
  accent2: string;
  eyebrow: string;
  title: ReactNode;
  watermark: string;
  sub: string;
  bullets?: string[];
  note?: string;
  /** Troca o botão do WhatsApp pelos botões das lojas do app. */
  stores?: boolean;
  price?: string;
  img: string;
  imgCls?: string;
  cta: string;
  msg: string;
};

function PromoSlide({ p, whatsapp }: { p: Promo; whatsapp: string }) {
  const price = splitPrice(p.price);
  return (
    <div className="promo" style={{ "--a": p.accent, "--b": p.accent2 } as CSSProperties}>
      <span className="promo__lines" aria-hidden="true" />
      <span className="promo__watermark" aria-hidden="true">{p.watermark}</span>

      <div className="promo__body">
        <p className="promo__eyebrow promo-anim"><span className="live-dot live-dot--sm" aria-hidden="true" /> {p.eyebrow}</p>
        <h3 className="promo__title promo-anim" style={{ "--s": 1 } as CSSProperties}>{p.title}</h3>
        <p className="promo__sub promo-anim" style={{ "--s": 2 } as CSSProperties}>{p.sub}</p>
        {p.bullets && (
          <ul className="promo__bullets promo-anim" style={{ "--s": 2 } as CSSProperties}>
            {p.bullets.map((b) => <li key={b}><i aria-hidden="true" className="fa-solid fa-check" />{b}</li>)}
          </ul>
        )}
        <div className="promo__row promo-anim" style={{ "--s": 3 } as CSSProperties}>
          {price && (
            <p className="promo__price" aria-label={`R$ ${p.price} por mês`}>
              <span className="promo__cur">R$</span>
              <span className="promo__int">{price.int}</span>
              <span className="promo__cents">{price.cents}<small>/mês</small></span>
            </p>
          )}
          {p.stores ? (
            <div className="flex flex-wrap gap-2.5">
              <a href={APP.playStore} target="_blank" rel="noopener" className="store-btn">
                <i aria-hidden="true" className="fa-brands fa-google-play" /><span><small>Disponível no</small>Google Play</span>
              </a>
              <a href={APP.appStore} target="_blank" rel="noopener" className="store-btn">
                <i aria-hidden="true" className="fa-brands fa-apple" /><span><small>Baixar na</small>App Store</span>
              </a>
            </div>
          ) : (
            <a href={waLink(whatsapp, p.msg)} target="_blank" rel="noopener" data-cursor="Assinar" className="promo__btn">
              <span>{p.cta}</span>
              <span className="promo__btn-icon" aria-hidden="true"><i className="fa-solid fa-arrow-right" /></span>
            </a>
          )}
        </div>
        {p.note && <p className="promo__note promo-anim" style={{ "--s": 4 } as CSSProperties}><i aria-hidden="true" className="fa-regular fa-clock" /> {p.note}</p>}
      </div>

      <div className="promo__art" aria-hidden="true">
        <span className="promo__halo" />
        <img src={p.img} alt="" loading="lazy" decoding="async" className={`promo__img ${p.imgCls ?? ""}`} />
      </div>
    </div>
  );
}

export default function BannerSwiper({ images, whatsapp, plans }: { images: CarouselImage[]; whatsapp: string; plans: Plan[] }) {
  // Banners cadastrados no admin vão como estão (o admin não converte upload).
  // O banner padrão tem WebP: 71 KB no celular e 183 KB no desktop, contra 1,9 MB do PNG.
  const banners: { key: string; src: string; webp?: string; sizes?: string }[] =
    images.length > 0
      ? images.map((i) => ({ key: `img-${i.id}`, src: assetUrl(i.image_path) }))
      : [{
          key: "fallback",
          src: "/img/Carrossel1.png",
          webp: "/img/Carrossel1-sm.webp 1100w, /img/Carrossel1.webp 2173w",
          sizes: "(max-width: 768px) 100vw, 1280px",
        }];

  const p600 = planBy(plans, 600);
  const giga = plans.find((p) => p.speed_mbps >= 1000);

  // Slides desenhados em código: preço vem do admin (se o plano sumir, o slide fica sem preço)
  const promos: Promo[] = [
    {
      key: "gamer", accent: "#22d3ee", accent2: "#FF8C00", watermark: "600",
      eyebrow: "Plano Gamer + TV · melhor oferta",
      title: <>600 <em>MEGA</em></>,
      sub: "Pra jogar online e assistir TV ao mesmo tempo, com fibra até o roteador.",
      price: p600?.price ?? "99,99",
      img: "/arte/gamer.webp", imgCls: "promo__img--wide",
      cta: "Assine sem sair de casa", msg: "Olá! Vi o banner de 600 Mega e quero assinar.",
    },
    {
      key: "giga", accent: "#007BFF", accent2: "#38bdf8", watermark: "1G",
      eyebrow: "Plano fibra · velocidade máxima",
      title: <>1 <em>GIGA</em></>,
      sub: "A casa inteira conectada: Wi-Fi dual-band em comodato, instalação grátis e sem fidelidade.",
      price: giga?.price,
      img: "/arte/roteador.webp",
      cta: "Quero 1 Giga", msg: "Olá! Vi o banner de 1 Giga e quero assinar.",
    },
    {
      key: "instalacao", accent: "#FF8C00", accent2: "#ffb347", watermark: "R$0",
      eyebrow: "Sem taxa · sem contrato",
      title: <>Instalação <em>grátis</em></>,
      sub: "Nossa equipe leva a fibra até você. Mensalidade pré-paga e sem fidelidade.",
      img: "/arte/etapa-3.webp",
      cta: "Consultar cobertura", msg: "Olá! Quero saber se tem cobertura no meu endereço.",
    },
    {
      key: "bruna", accent: "#25D366", accent2: "#38bdf8", watermark: "24h",
      eyebrow: "Assistente virtual no WhatsApp",
      title: <>Conheça a <em>Bruna</em></>,
      sub: "Ela atende 24 horas e resolve na hora:",
      bullets: [...BRUNA.faz],
      note: `Equipe: ${HORARIO_TEXTO.curto}`,
      img: "/arte/bruna.webp", imgCls: "promo__img--bruna",
      cta: "Falar com a Bruna", msg: "Olá, Bruna!",
    },
    {
      key: "app", accent: "#FF8C00", accent2: "#007BFF", watermark: "APP",
      eyebrow: "Aplicativo oficial",
      title: <>Minha <em>LifeNet</em></>,
      sub: "Sua internet na palma da mão:",
      bullets: [...APP.faz],
      img: "/arte/app-icone.webp", imgCls: "promo__img--app",
      stores: true, cta: "", msg: "",
    },
  ];

  return (
    <div className="gs-reveal banner-wrap w-full rounded-[2rem] overflow-hidden">
      <Swiper modules={[Autoplay, Pagination]} loop speed={900} autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }} className="bannerSwiper">
        {banners.map(({ key, src, webp, sizes }) => (
          <SwiperSlide key={key} className={slideCls}>
            <a href={waLink(whatsapp)} target="_blank" rel="noopener" className="block w-full h-full cursor-pointer hover:opacity-95 transition">
              <picture className="block w-full h-full">
                {webp && <source type="image/webp" srcSet={webp} sizes={sizes} />}
                <img src={src} alt="Promoção LifeNet - fale no WhatsApp" className="w-full h-full object-cover" />
              </picture>
            </a>
          </SwiperSlide>
        ))}

        {promos.map((p) => (
          <SwiperSlide key={p.key} className={slideCls}>
            <PromoSlide p={p} whatsapp={whatsapp} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
