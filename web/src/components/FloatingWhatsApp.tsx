export default function FloatingWhatsApp({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(37,211,102,0.6)] hover:scale-110 transition z-[100] animate-bounce">
      <i className="fa-brands fa-whatsapp" />
    </a>
  );
}
