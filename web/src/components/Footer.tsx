import type { Settings } from "@/lib/site-api";
import { assetUrl } from "@/lib/site-api";

export default function Footer({ settings }: { settings: Settings }) {
  const s = settings;
  return (
    <footer className="border-t border-white/10 bg-[#050b14] pt-16 pb-10 mt-20 gs-reveal">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetUrl(s.logo_footer)} alt="LifeNet" className="h-14 mb-6" />
            <p className="text-xs text-gray-500 leading-relaxed pr-6">Sua melhor escolha em conectividade. Fibra Óptica real, alta performance e o atendimento humano que você sempre quis.</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Navegação</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href="#" className="hover:text-white transition">Início</a></li>
              <li><a href="#planos" className="hover:text-white transition">Nossos Planos</a></li>
              <li><a href="#cobertura" className="hover:text-white transition">Cobertura</a></li>
              <li><a href={s.customer_portal_link} target="_blank" rel="noopener" className="hover:text-[#FF8C00] transition">Área do Cliente</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Suporte</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href={s.customer_portal_link} className="hover:text-white transition">- 2ª Via de Boleto</a></li>
              <li><a href={s.whatsapp_link} className="hover:text-white transition">- Abrir Chamado</a></li>
              <li><a href={s.whatsapp_link} className="hover:text-white transition">- Status da Rede</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Fale Conosco</h4>
            <ul className="text-xs text-gray-500 space-y-4">
              <li className="flex items-center gap-3"><i className="fa-brands fa-whatsapp text-[#25D366] text-lg" /> {s.whatsapp_number}</li>
              <li className="flex items-center gap-3"><i className="fa-regular fa-envelope text-[#007BFF] text-lg" /> {s.contact_email}</li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-location-dot text-[#007BFF] text-lg mt-0.5" /> {s.contact_address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <p>©2026 LifeNet. Todos os direitos reservados. CNPJ: 33.476.774/0001-42</p>
          <p className="mt-4 md:mt-0">Desenvolvido pela LifeNet</p>
        </div>
      </div>
    </footer>
  );
}
