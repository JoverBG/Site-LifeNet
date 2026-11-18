#!/usr/bin/env bash
# Faz www.lifenett.com.br redirecionar (301) para lifenett.com.br nas PÁGINAS do site.
# Roda dentro da VM 104:  cd <pasta do projeto>/web && bash deploy/www-para-apex.sh
#
# Só mexe no `location /` do snippets/lifenett-next.conf (páginas do Next). /api, /app-api,
# /admin, /img e /uploads seguem respondendo no www como antes: assim nenhum app ou POST
# antigo que use o www quebra (301 em POST vira GET em vários clientes).
#
# Desfazer: sudo cp <backup impresso no fim> /etc/nginx/snippets/lifenett-next.conf
#           sudo nginx -t && sudo systemctl reload nginx
set -euo pipefail
S=/etc/nginx/snippets/lifenett-next.conf
LINHA='    if ($host = www.lifenett.com.br) { return 301 https://lifenett.com.br$request_uri; }'

# -F (texto literal): sem ele o "." casa com "/" e o comentário "/var/www/lifenett.com.br" dava falso positivo
if sudo grep -qF 'host = www.lifenett.com.br' "$S"; then
  echo "www já redireciona ($S)"
else
  [ "$(sudo grep -c '^location / {$' "$S")" = 1 ] || { echo "ABORTADO: não achei um único 'location / {' em $S"; exit 1; }
  B=/etc/nginx/backups/lifenett-next.conf.bak-$(date +%Y%m%d%H%M%S)
  sudo install -d /etc/nginx/backups
  sudo cp "$S" "$B"
  sudo sed -i "/^location \/ {\$/a\\
$LINHA" "$S"
  if ! sudo nginx -t; then sudo cp "$B" "$S"; echo "nginx -t falhou: revertido de $B"; exit 1; fi
  sudo systemctl reload nginx
  echo "www agora redireciona (backup: $B)"
fi

echo "==> conferindo"
r() { curl -s -o /dev/null -w "%{http_code} %{redirect_url}" --resolve "$1:443:127.0.0.1" "https://$1$2"; }
echo "www /             -> $(r www.lifenett.com.br /)"
echo "www /?x=1         -> $(r www.lifenett.com.br '/?x=1')"
echo "www /api/site.php -> $(r www.lifenett.com.br /api/site.php)"
echo "lifenett.com.br / -> $(r lifenett.com.br /)"
echo "novo /            -> $(r novo.lifenett.com.br /)"
