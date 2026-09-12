import type { Metadata } from "next";

export const metadata: Metadata = { title: "Página não encontrada | LifeNet", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="fixed inset-0 w-full h-full bg-[url('/img/fundo.png')] bg-cover bg-center bg-no-repeat -z-20 opacity-30 pointer-events-none" />
      <img src="/img/logo.png" alt="LifeNet" className="w-40 md:w-56 object-contain drop-shadow-[0_0_40px_rgba(0,123,255,0.5)] mb-8" />
      <p className="text-[#007BFF] font-bold tracking-[0.3em] text-xs uppercase mb-3">Erro 404</p>
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">Página não encontrada</h1>
      <p className="text-gray-400 text-lg max-w-md mb-10">O endereço que você acessou não existe ou mudou de lugar. A conexão continua firme, só a página que não está aqui.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a href="/" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-10 rounded-xl flex items-center gap-2 transition shadow-[0_0_20px_rgba(0,123,255,0.4)]">
          <i aria-hidden="true" className="fa-solid fa-house text-xs" /> Voltar ao início
        </a>
        <a href="/#planos" className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition">
          Ver planos <i aria-hidden="true" className="fa-solid fa-chevron-right text-xs" />
        </a>
      </div>
    </main>
  );
}
