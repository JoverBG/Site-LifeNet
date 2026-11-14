#!/usr/bin/env bash
# Mesma coisa do deploy-preview.sh, mas rodando DENTRO da VM 104 (pra quem não
# tem WSL/rsync na máquina): builda o web/ desta pasta e sobe em
# https://novo.lifenett.com.br sem tocar na produção (lifenett.com.br, porta 3100).
#
#   cd <pasta do projeto>/web && bash deploy/preview-na-vm.sh
#
# Desfazer: ver o cabeçalho do deploy-preview.sh.
set -euo pipefail
cd "$(dirname "$0")/.."   # web/

command -v node >/dev/null && command -v npm >/dev/null || { echo "Falta node/npm na VM"; exit 1; }
echo "==> node $(node -v), npm $(npm -v)"

echo "==> build"
npm ci --no-audit --no-fund
SITE_API_URL=http://10.20.2.11/api npx next build
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public

echo "==> unit e pasta da prévia"
sudo install -d -o lifenet -g lifenet /opt/lifenett-web-preview
if ! cmp -s deploy/lifenett-web-preview.service /etc/systemd/system/lifenett-web-preview.service; then
  sudo install -m 644 deploy/lifenett-web-preview.service /etc/systemd/system/lifenett-web-preview.service
  sudo systemctl daemon-reload
  sudo systemctl enable lifenett-web-preview
fi

echo "==> copiando build pra /opt/lifenett-web-preview"
sudo find /opt/lifenett-web-preview -mindepth 1 -delete
sudo cp -a .next/standalone/. /opt/lifenett-web-preview/
sudo chown -R lifenet:lifenet /opt/lifenett-web-preview
sudo systemctl restart lifenett-web-preview
for i in $(seq 1 15); do curl -sf -o /dev/null http://127.0.0.1:3101/ && break; sleep 1; done
curl -sf -o /dev/null http://127.0.0.1:3101/ && echo "prévia respondendo na 3101" \
  || { echo "prévia NÃO subiu:"; sudo journalctl -u lifenett-web-preview -n 30 --no-pager; exit 1; }

echo "==> nginx: novo.lifenett.com.br -> prévia (só na primeira vez)"
S=/etc/nginx/snippets
N=$(readlink -f "$(sudo grep -l "server_name novo.lifenett.com.br" /etc/nginx/sites-enabled/* | head -1)")
[ -f "$N" ] || { echo "server block do novo não encontrado em sites-enabled"; exit 1; }
if sudo grep -q "lifenett-next-preview.conf" "$N"; then
  echo "já aponta pra prévia ($N)"
else
  # Trava: o arquivo tem que ser só do novo (1 include), senão mexeria na produção
  if sudo grep -q "server_name lifenett.com.br" "$N" || [ "$(sudo grep -c "include snippets/lifenett-next.conf;" "$N")" != 1 ]; then
    echo "ABORTADO: $N não é exclusivo do novo.lifenett.com.br. Troque o include à mão."; exit 1
  fi
  sudo sed "s#127.0.0.1:3100#127.0.0.1:3101#" $S/lifenett-next.conf | sudo tee $S/lifenett-next-preview.conf >/dev/null
  B=/etc/nginx/backups/$(basename "$N").bak-$(date +%Y%m%d%H%M%S)
  sudo cp "$N" "$B"
  sudo sed -i "s#include snippets/lifenett-next.conf;#include snippets/lifenett-next-preview.conf;#" "$N"
  if ! sudo nginx -t; then sudo cp "$B" "$N"; echo "nginx -t falhou: revertido de $B"; exit 1; fi
  sudo systemctl reload nginx
  echo "novo.lifenett.com.br agora usa a prévia (backup: $B)"
fi

echo "==> conferindo (de dentro da VM)"
curl -s -o /dev/null -w "novo:     %{http_code}\n" --resolve novo.lifenett.com.br:443:127.0.0.1 https://novo.lifenett.com.br/ || true
curl -s -o /dev/null -w "produção: %{http_code}\n" --resolve lifenett.com.br:443:127.0.0.1 https://lifenett.com.br/ || true
echo "Pronto: abra https://novo.lifenett.com.br (Ctrl+F5)."
