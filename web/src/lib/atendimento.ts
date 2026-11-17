// Fonte única do que o site diz sobre atendimento: o "24h" é sempre a Bruna
// (assistente virtual); a equipe humana sempre aparece com o horário.

export const BRUNA = {
  nome: "Bruna",
  papel: "assistente virtual",
  /** O que ela resolve sozinha, a qualquer hora, no WhatsApp. */
  faz: ["Envio e 2ª via de boleto", "Desbloqueio de confiança", "Avisos de problema na rede"],
} as const;

/** Horário da equipe (horário de Brasília). Dia: 0 = domingo ... 6 = sábado. */
export const EXPEDIENTE: { dias: number[]; turnos: [number, number][] }[] = [
  { dias: [1, 2, 3, 4, 5], turnos: [[8 * 60, 11 * 60], [13 * 60, 18 * 60]] },
  { dias: [6], turnos: [[8 * 60, 12 * 60]] },
];

export const HORARIO_TEXTO = {
  semana: "Seg a sex, 8h às 11h e 13h às 18h",
  sabado: "Sáb, 8h às 12h",
  curto: "Seg a sex 8h–11h e 13h–18h · Sáb 8h–12h (Brasília)",
  frase: "de segunda a sexta, das 8h às 11h e das 13h às 18h, e aos sábados, das 8h às 12h (horário de Brasília)",
} as const;

export const APP = {
  nome: "Minha LifeNet",
  appStore: "https://apps.apple.com/br/app/minha-lifenet/id6790950631",
  playStore: "https://play.google.com/store/apps/details?id=br.com.lifenett.minhalifenet&hl=pt_BR",
  /** O que a própria loja diz: fatura, PIX e suporte. */
  faz: ["Fatura e 2ª via de boleto", "Pagamento por PIX", "Desbloqueio de confiança", "Suporte e avisos da rede"],
} as const;

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
// A equipe trabalha no horário de Brasília (mesmo estando em MT, que é 1h a menos)
const TZ = "America/Sao_Paulo";

/** Feriados nacionais de data fixa ("MM-DD"). A equipe fecha nesses dias. */
const FERIADOS_FIXOS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
/**
 * Feriados locais (estado/município) e pontos facultativos em que a equipe
 * também fecha: "MM-DD" para data fixa ou "AAAA-MM-DD" para um dia específico.
 */
export const FERIADOS_LOCAIS: string[] = [];

/** Domingo de Páscoa (algoritmo de Meeus), em UTC. */
function pascoa(ano: number) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(ano, mes - 1, dia);
}

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** O dia (meia-noite UTC que representa a data de Brasília) é feriado? */
function ehFeriado(t: number) {
  const data = iso(t), mmdd = data.slice(5);
  if (FERIADOS_FIXOS.includes(mmdd) || FERIADOS_LOCAIS.includes(mmdd) || FERIADOS_LOCAIS.includes(data)) return true;
  const sextaSanta = pascoa(new Date(t).getUTCFullYear()) - 2 * 86_400_000;
  return t === sextaSanta;
}

/** Data, dia da semana e minutos do dia no horário de Brasília, seja qual for o fuso de quem abre o site. */
function agoraBrasilia(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const hoje = Date.UTC(get("year"), get("month") - 1, get("day"));
  return { hoje, min: get("hour") * 60 + get("minute") };
}

/** Turnos de um dia (vazio se domingo ou feriado). */
function turnosDo(t: number) {
  if (ehFeriado(t)) return [];
  const dia = new Date(t).getUTCDay();
  return EXPEDIENTE.find((e) => e.dias.includes(dia))?.turnos ?? [];
}

const hh = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;

/**
 * Equipe aberta agora? Se fechada, diz quando volta ("hoje às 13h", "amanhã às 8h",
 * "segunda às 8h") pulando domingos e feriados.
 */
export function statusEquipe(d = new Date()): { aberta: boolean; texto: string } {
  const { hoje, min } = agoraBrasilia(d);
  const turnos = turnosDo(hoje);
  const turno = turnos.find(([a, b]) => min >= a && min < b);
  if (turno) return { aberta: true, texto: `Equipe online até ${hh(turno[1])}` };

  const maisTarde = turnos.find(([a]) => a > min);
  if (maisTarde) return { aberta: false, texto: `Equipe volta hoje às ${hh(maisTarde[0])}` };

  const feriado = ehFeriado(hoje) ? "Feriado · " : "";
  for (let i = 1; i <= 14; i++) {
    const dia = hoje + i * 86_400_000;
    const t = turnosDo(dia)[0];
    if (t) {
      const quando = i === 1 ? "amanhã" : DIAS[new Date(dia).getUTCDay()];
      return { aberta: false, texto: `${feriado}Equipe volta ${quando} às ${hh(t[0])}` };
    }
  }
  return { aberta: false, texto: "Equipe fora do horário" };
}
