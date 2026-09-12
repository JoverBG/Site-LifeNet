export default function Hero({ whatsappLink }: { whatsappLink: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center gs-reveal">
      <div>
        <p className="text-[#007BFF] font-bold tracking-[0.3em] text-xs mb-4 uppercase">Internet Fibra Óptica</p>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] text-white">Conexão que<br /> transforma</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
          Ultravelocidade, estabilidade e atendimento que você merece. Conecte-se com o futuro com a{" "}
          <span className="text-[#007BFF] font-bold">LifeNet</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <a href="#planos" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-10 rounded-xl flex items-center gap-2 transition shadow-[0_0_20px_rgba(0,123,255,0.4)] transform hover:-translate-y-1">
            Ver Planos <i aria-hidden="true" className="fa-solid fa-chevron-right text-xs" />
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener" className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition transform hover:-translate-y-1">
            <i aria-hidden="true" className="fa-brands fa-whatsapp text-green-500 text-xl" /> Falar no WhatsApp
          </a>
        </div>
      </div>
      <div className="relative flex justify-center items-center h-[350px] md:h-[450px]">
        <div className="absolute inset-0 bg-[#007BFF] opacity-10 blur-[120px] rounded-full animate-pulse" />
        <img src="/img/logo.png" alt="LifeNet" className="w-72 md:w-96 object-contain drop-shadow-[0_0_40px_rgba(0,123,255,0.5)] transform hover:rotate-3 transition duration-700" />
        <div className="absolute bottom-6 right-0 md:right-8 bg-[#0a1122]/95 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl z-20 w-64 border-glow-blue animate-[bounce_5s_infinite]">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[#FF8C00] text-[10px] font-bold tracking-[0.2em] uppercase">Suporte Premium</p>
            <i aria-hidden="true" className="fa-solid fa-headset text-[#007BFF] text-2xl" />
          </div>
          <p className="text-4xl font-black mb-2">24h</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">Atendimento todos os dias via WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
