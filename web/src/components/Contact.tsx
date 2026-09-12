export default function Contact({ whatsappLink, instagram }: { whatsappLink: string; instagram: string }) {
  return (
    <div id="contato" className="bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-xl mb-1 text-white">Atendimento rápido</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Suporte direto</p>
      </div>
      <div className="space-y-4">
        <a href={whatsappLink} target="_blank" rel="noopener"
          className="flex items-center justify-between bg-[#050b14] border border-white/5 p-5 rounded-2xl hover:border-[#25D366]/50 hover:shadow-[0_0_20px_rgba(37,211,102,0.1)] transition group">
          <div className="flex items-center gap-4">
            <i aria-hidden="true" className="fa-brands fa-whatsapp text-4xl text-[#25D366] group-hover:scale-110 transition" />
            <div><h4 className="font-bold text-sm">WhatsApp</h4><p className="text-[11px] text-gray-500">Suporte Comercial</p></div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
            <i aria-hidden="true" className="fa-solid fa-arrow-right text-xs" />
          </div>
        </a>
        <a href={instagram} target="_blank" rel="noopener"
          className="flex items-center justify-between bg-[#050b14] border border-white/5 p-5 rounded-2xl hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.1)] transition group">
          <div className="flex items-center gap-4">
            <i aria-hidden="true" className="fa-brands fa-instagram text-4xl text-pink-500 group-hover:scale-110 transition" />
            <div><h4 className="font-bold text-sm">Instagram</h4><p className="text-[11px] text-gray-500">Siga nosso perfil</p></div>
          </div>
          <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition">
            <i aria-hidden="true" className="fa-solid fa-arrow-right text-xs" />
          </div>
        </a>
      </div>
    </div>
  );
}
