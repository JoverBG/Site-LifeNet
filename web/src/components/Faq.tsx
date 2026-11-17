import SectionHead from "./SectionHead";
import { APP, HORARIO_TEXTO } from "@/lib/atendimento";

/**
 * Perguntas frequentes em acordeão (o `#faq` do tirvu.com.br): <details> com o
 * mesmo `name`, então abrir uma fecha a outra sem JS. As respostas só repetem o
 * que o site já diz em outros lugares.
 */
export default function Faq({ whatsappLink, portal }: { whatsappLink: string; portal: string }) {
  const faqs: { q: string; a: React.ReactNode }[] = [
    { q: "Tem fidelidade?", a: "Não. Nenhum plano tem contrato de fidelidade: você fica com a LifeNet pela qualidade, não por contrato." },
    { q: "Quanto custa a instalação?", a: "Nada. A instalação é gratuita: nossa equipe leva a fibra até a sua casa e deixa o roteador funcionando." },
    { q: "Como funciona a mensalidade pré-paga?", a: "Você paga a mensalidade antes do mês de uso. Assim tem controle total dos gastos, sem surpresas no fim do mês." },
    { q: "O roteador está incluso?", a: "Sim. O roteador Wi-Fi dual-band é fornecido em comodato, junto com a instalação." },
    { q: "Como sei se tem cobertura no meu endereço?", a: (<>Digite sua cidade ou bairro na busca de cobertura aqui no site, ou <a href={whatsappLink} target="_blank" rel="noopener" className="faq-link">chame no WhatsApp</a> que a gente confirma na hora.</>) },
    { q: "Como peço suporte?", a: (<>Pelo <a href={whatsappLink} target="_blank" rel="noopener" className="faq-link">WhatsApp</a>. A Bruna, nossa assistente virtual, atende 24 horas e já resolve boleto, desbloqueio de confiança e avisos de problema na rede. Se precisar falar com a equipe, o atendimento é {HORARIO_TEXTO.frase}.</>) },
    { q: "Qual o horário de atendimento?", a: (<>A equipe atende {HORARIO_TEXTO.frase}. Fora desse horário, a Bruna (assistente virtual) responde no WhatsApp a qualquer hora.</>) },
    { q: "Onde tiro a 2ª via do boleto?", a: (<>Com a Bruna no <a href={whatsappLink} target="_blank" rel="noopener" className="faq-link">WhatsApp</a>, a qualquer hora, no app <strong>{APP.nome}</strong> ou na <a href={portal} target="_blank" rel="noopener" className="faq-link">Central do Assinante</a>.</>) },
    { q: "A LifeNet tem aplicativo?", a: (<>Tem: o <strong>{APP.nome}</strong>, com fatura, pagamento por PIX, desbloqueio de confiança e suporte. Baixe na <a href={APP.playStore} target="_blank" rel="noopener" className="faq-link">Google Play</a> ou na <a href={APP.appStore} target="_blank" rel="noopener" className="faq-link">App Store</a>.</>) },
  ];

  return (
    <section id="faq" data-rail="Dúvidas" className="pt-10 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
      <div className="lg:sticky lg:top-32">
        <SectionHead n="09" eyebrow="Perguntas frequentes" title="Ainda em dúvida?" mark="dúvida"
          sub="Reunimos as perguntas mais comuns. Não encontrou a sua? Fale com a gente." align="left" />
        <div data-reveal data-delay="300" className="flex flex-wrap gap-3 mt-8">
          <a href={whatsappLink} target="_blank" rel="noopener" data-magnetic className="btn-arrow btn-arrow--green">
            <i aria-hidden="true" className="fa-brands fa-whatsapp text-lg" /><span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="faq-list">
        {faqs.map((f, i) => (
          <details key={f.q} name="faq" data-reveal data-delay={String(i * 60)} className="faq-item">
            <summary>
              <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">{f.q}</span>
              <span className="faq-icon" aria-hidden="true" />
            </summary>
            <div className="faq-body"><p>{f.a}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}
