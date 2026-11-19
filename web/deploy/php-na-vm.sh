#!/usr/bin/env bash
# Publica PHPs do projeto no webroot (/var/www/lifenett.com.br), dentro da VM 104.
# Vale pro lifenett.com.br e pro novo ao mesmo tempo (os dois usam o mesmo webroot).
#
#   cd <pasta do projeto>/web
#   bash deploy/php-na-vm.sh admin/forgot_password.php api/telegram.php ...
#
# Caminhos relativos à raiz do projeto. Roda `php -l` em todos antes de copiar e guarda
# os arquivos que existiam em /var/backups/lifenett-php/<data>/ (os novos não têm cópia:
# pra desfazer, apague-os do webroot).
set -euo pipefail
cd "$(dirname "$0")/../.."   # raiz do projeto
W=/var/www/lifenett.com.br
[ $# -gt 0 ] || { echo "uso: bash deploy/php-na-vm.sh <arquivo.php> [...]"; exit 1; }

for f in "$@"; do
  [ -f "$f" ] || { echo "não achei $f"; exit 1; }
  php -l "$f" >/dev/null || { echo "erro de sintaxe em $f: nada foi copiado"; exit 1; }
done

sudo -v
B=/var/backups/lifenett-php/$(date +%Y%m%d%H%M%S)
sudo install -d "$B"
for f in "$@"; do
  if sudo test -e "$W/$f"; then sudo install -d "$B/$(dirname "$f")"; sudo cp -a "$W/$f" "$B/$f"; echo "  cópia: $f"
  else echo "  novo:  $f"; fi
done
for f in "$@"; do sudo install -o www-data -g www-data -m 644 "$f" "$W/$f"; done
echo "PHPs publicados (cópia dos anteriores em $B)"
echo "Desfazer: sudo cp -a $B/. $W/   (e apagar os marcados como novo)"
