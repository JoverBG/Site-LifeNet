"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { phpUrl } from "@/lib/site-api";

type Status = "online" | "slow" | "offline";
type Svc = { name: string; slug: string; icon: string; color: string; status: Status };
type Data = { pages: Svc[][]; total: number; checked_at: string };

// Classes escritas por extenso pro Tailwind enxergar no build
const cfg: Record<Status, { dot: string; text: string; label: string; border: string; glow: string }> = {
  online:  { dot: "bg-green-500",  text: "Normal",   label: "text-green-400",  border: "border-green-500/15",  glow: "" },
  slow:    { dot: "bg-yellow-400", text: "Lentidão", label: "text-yellow-400", border: "border-yellow-400/20", glow: "shadow-[0_0_12px_rgba(250,204,21,0.25)]" },
  offline: { dot: "bg-red-500",    text: "Falha",    label: "text-red-400",    border: "border-red-500/40",    glow: "shadow-[0_0_16px_rgba(239,68,68,0.3)]" },
};

function Card({ svc }: { svc: Svc }) {
  const st = cfg[svc.status] ?? cfg.online;
  const pulse = svc.status === "online" ? "animate-pulse" : "";
  return (
    <a href={`https://downdetector.com.br/fora-do-ar/${svc.slug}/`} target="_blank" rel="noopener"
      className={`group bg-[#050b14]/80 border ${st.border} ${st.glow} rounded-2xl p-5 flex flex-col items-center gap-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 cursor-pointer`}>
      <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center text-5xl" style={{ background: `${svc.color}20`, color: svc.color }}>
        <i className={svc.icon} />
        {svc.status !== "online" && (
          <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${svc.status === "offline" ? "bg-red-500 text-white" : "bg-yellow-400 text-black"}`}>
            <i className={`fa-solid ${svc.status === "offline" ? "fa-triangle-exclamation" : "fa-clock"}`} />
          </span>
        )}
      </div>
      <span className="text-sm font-bold text-white group-hover:text-[#007BFF] transition text-center leading-tight">{svc.name}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${st.dot} ${pulse}`} />
        <span className={`text-xs font-bold ${st.label}`}>{st.text}</span>
      </div>
    </a>
  );
}

const grid = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";

export default function ServicesStatus() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(phpUrl("api/services_status.php"))
      .then((r) => r.json())
      .then((d: Data) => { if (!Array.isArray(d?.pages)) throw new Error("payload"); setData(d); })
      .catch(() => setError(true));
  }, []);

  const hasIssues = data?.pages.flat().some((s) => s.status !== "online");

  return (
    <div className="mt-8 bg-card border border-white/5 rounded-[2rem] p-8 gs-reveal shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[350px] h-[250px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div>
          <h3 className="font-bold text-2xl text-white mb-1">Status dos Serviços</h3>
          <p className="text-sm text-gray-400">Testamos em tempo real a disponibilidade dos principais serviços a partir da rede LifeNet</p>
        </div>
        <a href="https://downdetector.com.br/" target="_blank" rel="noopener"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition text-xs font-bold text-gray-300 hover:text-white whitespace-nowrap">
          <i className="fa-solid fa-arrow-up-right-from-square" /> Ver tudo no Downdetector
        </a>
      </div>

      <div className="relative z-10">
        {!data ? (
          <div className={grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4 h-52">
                <div className="w-28 h-28 rounded-2xl bg-white/10" />
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-2.5 w-14 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <Swiper modules={[Autoplay, Navigation, Pagination]} slidesPerView={1} spaceBetween={20} loop={data.pages.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ nextEl: ".services-next", prevEl: ".services-prev" }}
            pagination={{ el: ".services-pagination", clickable: true, dynamicBullets: true }}
            className="servicesSwiper">
            {data.pages.map((page, i) => (
              <SwiperSlide key={i} className="pb-10">
                <div className={grid}>{page.map((s) => <Card key={s.slug} svc={s} />)}</div>
              </SwiperSlide>
            ))}
            <div className="swiper-button-prev services-prev" />
            <div className="swiper-button-next services-next" />
            <div className="swiper-pagination services-pagination" />
          </Swiper>
        )}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-8 relative z-10">
        {error ? (<><i className="fa-solid fa-circle-xmark text-red-400 mr-1" /> Não foi possível verificar os serviços agora.</>)
          : !data ? (<><i className="fa-solid fa-circle-notch fa-spin mr-1" /> Verificando status dos serviços...</>)
          : hasIssues ? (<>
              <i className="fa-solid fa-triangle-exclamation text-yellow-400 mr-1" />{" "}
              <span className="text-yellow-400 font-bold">Algum serviço não respondeu ao nosso teste de disponibilidade.</span>{" "}
              Testado da rede LifeNet às {data.checked_at} — <a href="https://downdetector.com.br" target="_blank" rel="noopener" className="text-[#007BFF] hover:underline">Conferir no Downdetector</a>
            </>)
          : (<>
              <i className="fa-solid fa-circle-check text-green-500 mr-1" /> Os {data.total} serviços responderam normalmente. Testado da rede LifeNet às {data.checked_at} —{" "}
              <a href="https://downdetector.com.br" target="_blank" rel="noopener" className="text-[#007BFF] hover:underline">Conferir no Downdetector</a>
            </>)}
      </p>
    </div>
  );
}
