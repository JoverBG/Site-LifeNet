#!/usr/bin/env bash
# Monitor externo do site lifenett.com.br — roda na VPS (fora da rede LifeNet),
# então enxerga queda de link, de VM e de serviço. Avisa no Telegram quando cai
# e quando volta. Estado em /var/lib/site-monitor (sobrevive a reboot).
#
# Regra: 2 falhas seguidas (≈4 min) = fora do ar. 1 sucesso = voltou.
set -u
ENV_FILE=/opt/lifebot-painel/.env            # reaproveita o bot do painel
STATE_DIR=/var/lib/site-monitor
mkdir -p "$STATE_DIR"
TOKEN=$(grep -E '^PAINEL_TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' )
CHAT=$(grep -E '^PAINEL_TELEGRAM_CHAT_ID=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' )
if [[ -z "$TOKEN" || -z "$CHAT" ]]; then
  echo "ERRO: token/chat do Telegram vazios em $ENV_FILE - monitor sem canal de alerta" >&2
  exit 1   # deixa o service vermelho no systemctl status
fi

declare -A ALVOS=(
  [home]="https://lifenett.com.br/"
  [admin-php]="https://lifenett.com.br/api/settings.php"
  [app]="https://lifenett.com.br/app/"
)

tg() { curl -s -m 15 -o /dev/null -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
        --data-urlencode "chat_id=${CHAT}" --data-urlencode "text=$1" --data "parse_mode=HTML" --data "disable_web_page_preview=true"; }
agora() { TZ=America/Cuiaba date "+%d/%m %H:%M"; }

for nome in "${!ALVOS[@]}"; do
  url=${ALVOS[$nome]}
  code=$(curl -s -m 20 -o /dev/null -w "%{http_code}" -A "LifeNet-SiteMonitor/1.0" "$url" 2>/dev/null || echo 000)
  fails_f="$STATE_DIR/$nome.fails"; down_f="$STATE_DIR/$nome.down"
  fails=$(cat "$fails_f" 2>/dev/null || echo 0)

  if [[ "$code" == "200" ]]; then
    echo 0 > "$fails_f"
    if [[ -f "$down_f" ]]; then
      desde=$(cat "$down_f"); rm -f "$down_f"
      tg "✅ <b>lifenett.com.br voltou</b> ($nome)
Fora do ar desde $desde, voltou às $(agora)."
    fi
  else
    fails=$((fails+1)); echo "$fails" > "$fails_f"
    if [[ $fails -ge 2 && ! -f "$down_f" ]]; then
      agora > "$down_f"
      tg "🔴 <b>lifenett.com.br FORA DO AR</b> ($nome)
$url
Resposta: HTTP $code, 2 checagens seguidas. Detectado às $(agora) de fora da rede LifeNet.
Checklist: OPERACOES.md → 'Site fora do ar' (VM 104, nginx, lifenett-web, php-fpm)."
    fi
  fi
  echo "$(date -Is) $nome $code fails=$fails"
done
