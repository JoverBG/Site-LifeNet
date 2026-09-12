import type { Plan } from "@/lib/site-api";
import type { CSSProperties } from "react";

/** Mesma lógica de cores do index.php: popular > mais vendido > selo custom > padrão azul. */
function styleFor(p: Plan) {
  // Só #rrggbb: os sufixos 33/b3 (alpha) e o style dependem disso; evita CSS extra vindo do admin
  const c = /^#[0-9a-f]{6}$/i.test(p.custom_badge_color) ? p.custom_badge_color : "#007BFF";
  const custom = !!p.custom_badge;
  if (p.popular) {
    return {
      card: { borderColor: "#FF8C00", boxShadow: "0 0 20px rgba(255,140,0,0.3)" },
      badge: { background: "linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%)" },
      badgeText: ["Melhor Custo", "Benefício"],
      speed: { color: "#FF8C00", textShadow: "0 0 15px rgba(255, 140, 0, 0.7)" },
      unit: { color: "#FF8C00" },
      perMonth: "text-white", perMonthStyle: {},
      price: { color: "#fff" },
      icon: { color: "#FF8C00", textShadow: "0 0 15px rgba(255, 140, 0, 0.7)" },
      btn: { background: "linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%)", boxShadow: "0 0 30px rgba(255,140,0,0.6)" },
    };
  }
  if (p.best_seller) {
    return {
      card: { borderColor: "#22c55e", boxShadow: "0 0 20px rgba(34,197,94,0.3)" },
      badge: { backgroundColor: "#22c55e" },
      badgeText: ["Mais", "Vendido"],
      speed: { color: "#22c55e", textShadow: "0 0 15px rgba(34, 197, 94, 0.7)" },
      unit: { color: "#22c55e" },
      perMonth: "text-green-500", perMonthStyle: {},
      price: { color: "#fff" },
      icon: { color: "#22c55e" },
      btn: { backgroundColor: "#22c55e", boxShadow: "0 0 20px rgba(34,197,94,0.5)" },
    };
  }
  if (custom) {
    return {
      card: { borderColor: c, boxShadow: `0 0 20px ${c}33` },
      badge: { backgroundColor: c },
      badgeText: [p.custom_badge],
      speed: { color: c, textShadow: `0 0 15px ${c}b3` },
      unit: { color: c },
      perMonth: "", perMonthStyle: { color: c },
      price: { color: c },
      icon: { color: c },
      btn: { backgroundColor: c, boxShadow: `0 0 20px ${c}b3` },
    };
  }
  return {
    card: { borderColor: "#007BFF", boxShadow: "0 0 20px rgba(0,123,255,0.3)" },
    badge: { backgroundColor: "#007BFF" },
    badgeText: ["Plano", "Fibra"],
    speed: { color: "#007BFF", textShadow: "0 0 15px rgba(0, 123, 255, 0.7)" },
    unit: { color: "#007BFF" },
    perMonth: "text-[#007BFF]", perMonthStyle: {},
    price: { color: "#007BFF" },
    icon: { color: "#007BFF", textShadow: "0 0 15px rgba(0, 123, 255, 0.7)" },
    btn: { backgroundColor: "#007BFF", boxShadow: "0 0 20px rgba(0,123,255,0.5)" },
  };
}

function PlanCard({ plan }: { plan: Plan }) {
  const s = styleFor(plan);
  return (
    <div className="gs-reveal bg-card border rounded-[2.5rem] p-10 relative flex flex-col justify-between transform lg:-translate-y-6 shadow-2xl hover:-translate-y-9 transition duration-500 z-10" style={s.card as CSSProperties}>
      <div className="absolute top-0 right-0 text-white text-[10px] font-black px-6 py-2.5 rounded-bl-2xl rounded-tr-[2.5rem] uppercase tracking-widest leading-tight text-center" style={s.badge as CSSProperties}>
        {s.badgeText.map((t, i) => (<span key={i}>{i > 0 && <br />}{t}</span>))}
      </div>
      <div className="text-center mt-6">
        <div className="text-6xl font-black mb-2 tracking-tighter" style={s.speed}>
          {plan.speed.value}<span className="text-xl" style={s.unit}> {plan.speed.unit}</span>
        </div>
        <p className={`${s.perMonth} text-xs font-bold tracking-[0.2em] mb-4 mt-6`} style={s.perMonthStyle}>POR MÊS</p>
        <div className="text-5xl font-black mb-3" style={s.price}>R$ {plan.price}</div>
        <p className="text-yellow-500 text-[11px] font-bold uppercase tracking-widest">{plan.name}</p>
      </div>
      <div className="flex justify-center gap-6 my-10">
        <i aria-hidden="true" className="fa-solid fa-wifi text-2xl" style={s.icon} />
        <i aria-hidden="true" className="fa-solid fa-bolt text-yellow-500 text-2xl" />
        <i aria-hidden="true" className="fa-solid fa-gamepad text-2xl" style={s.icon} />
        <i aria-hidden="true" className="fa-solid fa-tv text-2xl" style={s.icon} />
      </div>
      <a href={plan.whatsapp_link} target="_blank" rel="noopener" className="w-full text-white font-black py-5 rounded-2xl transition text-center block text-xl" style={s.btn as CSSProperties}>
        Assinar Agora
      </a>
    </div>
  );
}

const sideBenefits = [
  { icon: "fa-calendar-check", color: "blue", title: "Mensalidade Pré-paga", text: "Controle total dos seus gastos, sem surpresas no final do mês." },
  { icon: "fa-screwdriver-wrench", color: "orange", title: "Instalação Gratuita", text: "Toda a infraestrutura por nossa conta para sua conexão brilhar." },
  { icon: "fa-unlock-keyhole", color: "blue", title: "Sem Fidelidade", text: "Fique conosco pela qualidade, não por contrato." },
  { icon: "router", color: "orange", title: "Roteador em Comodato", text: "Equipamento de alta qualidade para sua conexão." },
] as const;

export default function Plans({ plans }: { plans: Plan[] }) {
  return (
    <div id="planos" className="pt-10">
      <p className="text-center text-[#007BFF] font-bold text-xs tracking-[0.3em] uppercase mb-3 gs-reveal">Planos</p>
      <h2 className="text-center text-4xl md:text-5xl font-black mb-12 gs-reveal">Escolha o plano ideal para você</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.length > 0 ? plans.map((p) => <PlanCard key={p.id} plan={p} />) : (
          <div className="gs-reveal bg-card border border-white/10 rounded-[2.5rem] p-10 lg:col-span-2 text-center flex items-center justify-center">
            <p className="text-gray-400">Nenhum plano cadastrado no momento. Verifique com nossa equipe.</p>
          </div>
        )}

        <div className="gs-reveal relative bg-card border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#050b14] px-6 py-2 rounded-full border border-white/5 shadow-2xl z-10">
            <p className="text-[#007BFF] font-bold text-[11px] tracking-[0.3em] uppercase m-0">Benefícios</p>
          </div>
          <div className="space-y-8 pt-2">
            {sideBenefits.map((b) => {
              const blue = b.color === "blue";
              return (
                <div key={b.title} className="flex items-start gap-5 group">
                  <div className={`w-12 h-12 rounded-2xl ${blue ? "bg-[#007BFF]/10 text-[#007BFF] border-[#007BFF]/20" : "bg-[#FF8C00]/10 text-[#FF8C00] border-[#FF8C00]/20"} flex items-center justify-center flex-shrink-0 border group-hover:scale-110 transition`}>
                    {b.icon === "router"
                      ? <img src="/img/icone-roteador.png" alt="Roteador" className="w-8 h-8 object-contain" />
                      : <i aria-hidden="true" className={`fa-solid ${b.icon} text-xl`} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{b.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{b.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
