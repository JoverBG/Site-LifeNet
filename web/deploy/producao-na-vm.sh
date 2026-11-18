#!/usr/bin/env bash
# Troca o site principal (lifenett.com.br, serviço lifenett-web, porta 3100) pela versão
# que está na prévia (novo.lifenett.com.br, /opt/lifenett-web-preview). Não builda nada:
# publica exatamente o que já foi testado no novo. As duas units só diferem na porta.
#
# Roda dentro da VM 104, na pasta web/ do projeto:
#   bash deploy/producao-na-vm.sh --ensaio   # só confere, não muda nada (não pede senha)
#   bash deploy/producao-na-vm.sh            # publica (guarda cópia de segurança antes)
#   bash deploy/producao-na-vm.sh --voltar   # volta pra cópia de segurança mais nova
#
# Se a versão nova não responder (direto na 3100 ou pelo nginx), volta sozinho pra cópia.
# Guarda as 3 cópias mais novas em /opt/lifenett-web.bak-<data>.
set -euo pipefail
P=/opt/lifenett-web
V=/opt/lifenett-web-preview

espera() { for _ in $(seq 1 20); do curl -sf -o /dev/null "http://127.0.0.1:$1/" && return 0; sleep 1; done; return 1; }
codigo() { curl -s -o /dev/null -w '%{http_code}' "$@" || true; }
site() { codigo --resolve lifenett.com.br:443:127.0.0.1 "https://lifenett.com.br$1"; }

restaura() {
  echo "==> voltando para $1"
  sudo rsync -a --delete "$1/" "$P/"
  sudo systemctl restart lifenett-web
  if espera 3100; then echo "produção de volta na versão anterior (lifenett.com.br: $(site /))"
  else echo "ATENÇÃO: a produção não respondeu nem com a cópia"; sudo journalctl -u lifenett-web -n 30 --no-pager || true; fi
}

if [ "${1:-}" = "--voltar" ]; then
  B=$(ls -d "$P".bak-* 2>/dev/null | sort | tail -1 || true)
  [ -n "$B" ] || { echo "Nenhuma cópia de segurança em $P.bak-*"; exit 1; }
  sudo -v
  restaura "$B"
  exit 0
fi

echo "==> conferindo a prévia (é ela que vai pra produção)"
[ -f "$V/server.js" ] || { echo "Prévia não encontrada em $V"; exit 1; }
espera 3101 || { echo "Prévia não responde na 3101"; exit 1; }
[ "$(codigo http://127.0.0.1:3101/speedtest/ping)" = 204 ] || { echo "Teste de velocidade da prévia não responde"; exit 1; }
echo "prévia:   build $(cat "$V/.next/BUILD_ID")"
echo "produção: build $(cat "$P/.next/BUILD_ID") (atual)"
if [ "$(cat "$V/.next/BUILD_ID")" = "$(cat "$P/.next/BUILD_ID")" ]; then echo "A produção já está nesta versão."; exit 0; fi
livre=$(df --output=avail -k /opt | tail -1); precisa=$(( $(du -sk "$V" | cut -f1) * 3 ))
[ "$livre" -gt "$precisa" ] || { echo "Pouco espaço em disco em /opt"; exit 1; }
echo "espaço ok, produção hoje: lifenett.com.br/ $(site /), /speedtest/ping $(site /speedtest/ping)"

if [ "${1:-}" = "--ensaio" ]; then echo "Ensaio ok: nada foi mudado."; exit 0; fi

sudo -v
B="$P.bak-$(date +%Y%m%d%H%M%S)"
echo "==> cópia de segurança: $B"
sudo cp -a "$P" "$B"

echo "==> publicando"
sudo rsync -a --delete "$V/" "$P/"
sudo chown -R lifenet:lifenet "$P"
sudo systemctl restart lifenett-web
if ! espera 3100 || [ "$(codigo http://127.0.0.1:3100/speedtest/ping)" != 204 ]; then
  echo "ERRO: a versão nova não respondeu na 3100"
  sudo journalctl -u lifenett-web -n 30 --no-pager || true
  restaura "$B"; exit 1
fi

echo "==> conferindo pelo nginx"
for u in / /speedtest/ping /api/site.php /robots.txt /sitemap.xml; do echo "lifenett.com.br$u -> $(site "$u")"; done
if [ "$(site /)" != 200 ]; then echo "ERRO: site não respondeu pelo nginx"; restaura "$B"; exit 1; fi

# Guarda só as 3 cópias mais novas
ls -d "$P".bak-* | sort | head -n -3 | xargs -r sudo rm -rf --

echo "Pronto: lifenett.com.br está na versão nova (build $(cat "$P/.next/BUILD_ID"))."
echo "Pra voltar: bash deploy/producao-na-vm.sh --voltar"
