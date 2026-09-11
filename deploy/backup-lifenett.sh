#!/usr/bin/env bash
# Backup completo do site lifenett.com.br
# Inclui: webroot (com snapshot consistente do SQLite), home Next.js (/opt/lifenett-web + unit), configs nginx/php, certs TLS, crontabs, metadata
set -euo pipefail

BKP_DIR="/home/lifenet/backups"
WWW="/var/www/lifenett.com.br"
RETENTION_DAYS=14
STAMP="$(date +%Y%m%d-%H%M)"
mkdir -p "$BKP_DIR"

# Staging temporário
STAGE="$(mktemp -d /tmp/lifenett-bkp.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT

# === 1. Webroot completo (snapshot consistente do SQLite) ===
mkdir -p "$STAGE/webroot"
rsync -a --exclude='data/database.sqlite' "$WWW/" "$STAGE/webroot/"
# Snapshot consistente do SQLite (não corrompe se houver escrita simultânea)
sqlite3 "$WWW/data/database.sqlite" ".backup '$STAGE/webroot/data/database.sqlite'"

# === 2. Configs nginx ===
mkdir -p "$STAGE/nginx"
cp -a /etc/nginx/sites-available/lifenett.com.br "$STAGE/nginx/" 2>/dev/null || true
cp -a /etc/nginx/nginx.conf "$STAGE/nginx/" 2>/dev/null || true
cp -a /etc/nginx/snippets "$STAGE/nginx/" 2>/dev/null || true
cp -a /etc/nginx/sites-available/novo.lifenett.com.br "$STAGE/nginx/" 2>/dev/null || true

# === 2b. Home em Next.js (desde 2026-09-11): build standalone + serviço ===
# Restaurar = rsync de volta pra /opt/lifenett-web + copiar a unit + systemctl enable --now lifenett-web
mkdir -p "$STAGE/next"
rsync -a /opt/lifenett-web/ "$STAGE/next/lifenett-web/" 2>/dev/null || true
cp -a /etc/systemd/system/lifenett-web.service "$STAGE/next/" 2>/dev/null || true

# === 3. PHP config ===
mkdir -p "$STAGE/php"
cp -a /etc/php/8.5/fpm/php.ini "$STAGE/php/php.ini" 2>/dev/null || true
cp -a /etc/php/8.5/fpm/pool.d "$STAGE/php/" 2>/dev/null || true

# === 4. Certbot (TLS) — segue symlinks pra ter os arquivos reais ===
mkdir -p "$STAGE/certs"
cp -aL /etc/letsencrypt/live "$STAGE/certs/" 2>/dev/null || true
cp -a /etc/letsencrypt/renewal "$STAGE/certs/" 2>/dev/null || true

# === 5. Sistema ===
mkdir -p "$STAGE/system"
crontab -l -u root > "$STAGE/system/root.crontab" 2>/dev/null || true
crontab -l -u lifenet > "$STAGE/system/lifenet.crontab" 2>/dev/null || true
cp -a /etc/cron.d "$STAGE/system/" 2>/dev/null || true
dpkg --get-selections > "$STAGE/system/dpkg-selections.txt" 2>/dev/null || true

# === 6. Metadata ===
cat > "$STAGE/meta.txt" <<EOF
backup criado em: $(date)
servidor: $(hostname) ($(hostname -I | awk '{print $1}'))
kernel: $(uname -r)
distro: $(. /etc/os-release && echo $PRETTY_NAME)
nginx: $(nginx -v 2>&1)
php: $(php -v | head -1)
sqlite: $(sqlite3 --version)
EOF

# Empacota tudo
tar -czf "$BKP_DIR/lifenett-$STAMP.tar.gz" -C "$STAGE" .

# Retenção
find "$BKP_DIR" -name "lifenett-*.tar.gz" -mtime "+$RETENTION_DAYS" -delete

# Log
SIZE=$(du -h "$BKP_DIR/lifenett-$STAMP.tar.gz" | cut -f1)
FILES=$(tar -tzf "$BKP_DIR/lifenett-$STAMP.tar.gz" | wc -l)
echo "[$(date '+%F %T')] backup ok: lifenett-$STAMP.tar.gz ($SIZE, $FILES files)" >> "$BKP_DIR/backup.log"
