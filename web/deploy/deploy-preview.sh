#!/usr/bin/env bash
# Sobe o código ATUAL de web/ em https://novo.lifenett.com.br SEM tocar na produção.
#
#   cd ~/projetos/site-lifenet && git fetch && git checkout <branch>
#   bash web/deploy/deploy-preview.sh
#
# Como funciona: uma segunda instância do Next (serviço lifenett-web-preview,
# /opt/lifenett-web-preview, porta 3101) e o server block do novo.lifenett.com.br
# passa a incluir snippets/lifenett-next-preview.conf (cópia do snippet da
# produção apontando pra 3101). lifenett.com.br continua na 3100, intocado.
# Na primeira vez instala a unit e troca o include do novo (com backup + nginx -t);
# nas seguintes só rebuilda, sincroniza e reinicia a prévia.
#
# Desfazer (novo volta a mostrar a produção):
#   sudo sed -i 's#snippets/lifenett-next-preview.conf#snippets/lifenett-next.conf#' <arquivo do novo>
#   sudo nginx -t && sudo systemctl reload nginx && sudo systemctl disable --now lifenett-web-preview
set -euo pipefail

VM="${VM:-lifenet@10.20.2.11}"
cd "$(dirname "$0")/.."   # web/

echo "==> build ($(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD))"
npm ci
SITE_API_URL=https://lifenett.com.br/api npx next build
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public

echo "==> unit e pasta da prévia (só muda algo na primeira vez)"
scp deploy/lifenett-web-preview.service "$VM":/tmp/lifenett-web-preview.service
ssh -t "$VM" 'set -e
  sudo install -d -o lifenet -g lifenet /opt/lifenett-web-preview
  if ! cmp -s /tmp/lifenett-web-preview.service /etc/systemd/system/lifenett-web-preview.service; then
    sudo install -m 644 /tmp/lifenett-web-preview.service /etc/systemd/system/lifenett-web-preview.service
    sudo systemctl daemon-reload
    sudo systemctl enable lifenett-web-preview
  fi'

echo "==> enviando build pra /opt/lifenett-web-preview"
rsync -az --delete .next/standalone/ "$VM":/opt/lifenett-web-preview/
ssh -t "$VM" 'set -e
  sudo systemctl restart lifenett-web-preview
  for i in 1 2 3 4 5 6 7 8 9 10; do curl -sf -o /dev/null http://127.0.0.1:3101/ && break; sleep 1; done
  curl -sf -o /dev/null http://127.0.0.1:3101/ && echo "prévia respondendo na 3101" || { echo "prévia NÃO subiu: journalctl -u lifenett-web-preview -n 50"; exit 1; }'

echo "==> nginx: novo.lifenett.com.br -> prévia (só na primeira vez)"
ssh -t "$VM" 'set -e
  S=/etc/nginx/snippets
  N=$(readlink -f "$(sudo grep -l "server_name novo.lifenett.com.br" /etc/nginx/sites-enabled/* | head -1)")
  [ -f "$N" ] || { echo "server block do novo não encontrado em sites-enabled"; exit 1; }
  if sudo grep -q "lifenett-next-preview.conf" "$N"; then echo "já aponta pra prévia ($N)"; exit 0; fi
  # Trava de segurança: o arquivo tem que ser só do novo (1 include), senão mexeria na produção
  if sudo grep -q "server_name lifenett.com.br" "$N" || [ "$(sudo grep -c "include snippets/lifenett-next.conf;" "$N")" != 1 ]; then
    echo "ABORTADO: $N não é exclusivo do novo.lifenett.com.br. Troque o include à mão."; exit 1
  fi
  sudo sed "s#127.0.0.1:3100#127.0.0.1:3101#" $S/lifenett-next.conf | sudo tee $S/lifenett-next-preview.conf >/dev/null
  B=/etc/nginx/backups/$(basename "$N").bak-$(date +%Y%m%d%H%M%S)
  sudo cp "$N" "$B"
  sudo sed -i "s#include snippets/lifenett-next.conf;#include snippets/lifenett-next-preview.conf;#" "$N"
  if ! sudo nginx -t; then sudo cp "$B" "$N"; echo "nginx -t falhou: revertido de $B"; exit 1; fi
  sudo systemctl reload nginx
  echo "novo.lifenett.com.br agora usa a prévia (backup: $B)"'

echo "==> conferindo"
curl -sI https://novo.lifenett.com.br/ | head -1
curl -sI https://lifenett.com.br/ | head -1
echo "Pronto: abra https://novo.lifenett.com.br (Ctrl+F5 pra não pegar cache)."
