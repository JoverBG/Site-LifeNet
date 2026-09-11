const items = [
  { icon: "fa-bolt", color: "blue", title: "Ultravelocidade", sub: "Fibra Óptica" },
  { icon: "fa-shield-halved", color: "orange", title: "Estabilidade", sub: "Sem Quedas" },
  { icon: "fa-headset", color: "blue", title: "Suporte 24h", sub: "Humanizado" },
  { icon: "fa-wifi", color: "orange", title: "Wi-Fi Grátis", sub: "Dual-Band" },
  { icon: "fa-lock", color: "blue", title: "Segurança", sub: "Rede Blindada" },
] as const;

export default function BenefitsBar() {
  return (
    <div className="gs-reveal bg-card rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 border border-white/5">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-4 group cursor-default">
          <i className={`fa-solid ${it.icon} ${it.color === "blue" ? "text-[#007BFF] text-glow-blue" : "text-[#FF8C00] text-glow-orange"} text-4xl w-10 text-center group-hover:scale-110 transition`} />
          <div>
            <h4 className="font-bold text-sm">{it.title}</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
