# Security & Hardening — lifenett.com.br

Documento das medidas de segurança aplicadas no servidor de produção (`10.20.2.11`, Ubuntu 26.04, nginx + PHP 8.5 + SQLite).

Última atualização: **2026-05-24**.

---

## Stack defendida

- **Webserver**: nginx 1.28.3
- **Aplicação**: PHP 8.5-fpm
- **Banco**: SQLite (`/var/www/lifenett.com.br/data/database.sqlite`)
- **TLS**: Let's Encrypt via Certbot (`*.lifenett.com.br`)
- **Firewall**: ufw (22, 80, 443)
- **Anti brute-force**: fail2ban (jails `sshd`, `nginx-botsearch`)
- **Auto-updates**: unattended-upgrades

---

## Hardening aplicado (rajada 2026-05-24)

### Backup completo

**Antes**: backup salvava só `data/` + `uploads/` (~3 KB). Se ransomware ou erro humano apagasse o código PHP, **não havia recuperação**.

**Agora**: `/usr/local/bin/backup-lifenett.sh` salva:
- `webroot/` — site inteiro, snapshot consistente do SQLite (via `.backup`)
- `nginx/` — vhost, snippets, `nginx.conf`
- `php/` — `php.ini` + `pool.d/`
- `certs/` — `/etc/letsencrypt/live` (segue symlinks) + `renewal/`
- `system/` — crontabs + `/etc/cron.d` + `dpkg --get-selections`
- `meta.txt` — versões de nginx/php/sqlite/kernel

Tamanho: ~21 MB. Cron: `03:00` diário. Retenção: 14 dias. Local: `/home/lifenet/backups/`.

### Serviços removidos

- **MySQL purgado** (era órfão, zero databases de usuário, zero conexões, zero referências no código). Liberou 475 MB de RAM e 188 MB de disco.

### nginx — Headers de segurança

Já existentes:
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), microphone=(), camera=()`

Adicionados em 2026-05-24:
- `Content-Security-Policy-Report-Only` — política inicial em **Report-Only** (não bloqueia, só reporta violações no console do navegador). Lista de CDNs permitidos: `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `cdn.tailwindcss.com`, `unpkg.com`, `fonts.googleapis.com`, `fonts.gstatic.com`. Plano: monitorar console por alguns dias, depois trocar pra `Content-Security-Policy` (enforce).

### nginx — Bloqueios de path

Já existentes:
- `*.sqlite|*.sqlite3|*.db` → 404
- `/.ht*` → 404
- `/data/` → 404
- `/.git|/.svn|/.hg|/.env|/.DS_Store` → 404
- `/api/db.php`, `/api/security.php`, `/api/geo_helper.php` → 404 (bibliotecas internas)
- `*.php` em `/uploads/` → 404
- Rate limit em `/admin/login.php` (5 req burst)

### PHP — Hardening em `/etc/php/8.5/fpm/conf.d/99-lifenett-hardening.ini`

Override limpo, sobrevive `apt upgrade`. Pra reverter: `rm` + `systemctl reload php8.5-fpm`.

| Setting | Valor | Proteção |
|---|---|---|
| `expose_php` | `Off` | Esconde `X-Powered-By: PHP/8.5.4` |
| `session.cookie_httponly` | `1` | JS não acessa cookie de sessão (anti-XSS roubar sessão) |
| `session.cookie_secure` | `1` | Cookie de sessão só via HTTPS |
| `session.cookie_samesite` | `"Lax"` | Defesa CSRF cross-site |
| `session.use_strict_mode` | `1` | Bloqueia session ID forjado |
| `disable_functions` | `exec,passthru,shell_exec,system,proc_open,popen,pcntl_exec,proc_get_status,proc_terminate` | Anti-RCE: mesmo se atacante injetar PHP, não roda comando shell |
| `open_basedir` | `/var/www/lifenett.com.br/:/tmp/:/var/lib/php/sessions/` | Sandbox de filesystem (PHP só lê/escreve nesses paths) |
| `allow_url_fopen` | `Off` | Anti-SSRF/RFI: `file_get_contents("http://...")` bloqueado |
| `allow_url_include` | `Off` | RFI bloqueado |
| `upload_max_filesize` | `16M` | Alinhado com tamanho real de uploads do admin (carousel/logo) |
| `post_max_size` | `20M` | `>=` upload_max_filesize |

### SSH — Só por chave

Drop-in `/etc/ssh/sshd_config.d/01-lifenett-hardening.conf` (prefixo `01-` pra ganhar precedência sobre `50-cloud-init.conf` que tinha `PasswordAuthentication yes` — OpenSSH é first-match-wins):

```
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
```

Login por senha rejeitado (`Permission denied (publickey)`). `sudo` continua com senha pelo usuário `lifenet`.

### Higiene

- Removidos `index.php.bak.*` de dentro do webroot (fallback `try_files` os mascarava como 200, mas eram backups antigos sem propósito).
- `.bak-*` do nginx movidos pra `/etc/nginx/backups/` (não ficavam mais soltos em `sites-available/`).

### Acesso interno por IP (workaround temporário)

Adicionado server block HTTP em nginx pra servir o site quando acessado por `http://10.20.2.11/` (Host header não bate com `lifenett.com.br`). Workaround enquanto o **hairpin SNAT no Mikrotik edge** (`190.89.178.250`) não é aplicado. Quando o hairpin for aplicado, esse server block pode ser removido.

---

## Pendência conhecida

### 2FA no admin (não aplicado)

Adiciona TOTP no `/admin/login.php`. Envolve:
1. Lib TOTP (`RobThree/TwoFactorAuth` ou implementar RFC 6238 nativo, ~150 linhas)
2. Coluna `users.totp_secret` + `users.totp_enabled` (migration SQLite)
3. Página `/admin/2fa-setup.php` (QR code, valida primeiro código, salva secret)
4. Modificar `/admin/login.php` pra exigir TOTP após senha quando `totp_enabled=1`
5. Backup codes (caso perca o celular)
6. Testar fluxo completo

Estimativa: 2-3h de trabalho focado + testes.

---

## Como reverter (em caso de problema)

| Mudança | Comando de rollback |
|---|---|
| PHP hardening | `sudo rm /etc/php/8.5/fpm/conf.d/99-lifenett-hardening.ini && sudo systemctl reload php8.5-fpm` |
| SSH só por chave | `sudo rm /etc/ssh/sshd_config.d/01-lifenett-hardening.conf && sudo systemctl reload ssh` |
| nginx (CSP + IP block) | Restaurar de `/etc/nginx/backups/lifenett.com.br.bak-*` mais recente |
| MySQL purgado | `sudo apt install mysql-server` (vai começar zerado) |
| Backup script | `sudo cp /usr/local/bin/backup-lifenett.sh.bak-* /usr/local/bin/backup-lifenett.sh` |

## Como auditar o estado atual

```bash
# Settings PHP efetivos
sudo php-fpm8.5 -i | grep -E '^(expose_php|session\.cookie|disable_functions|open_basedir|allow_url|upload_max)'

# SSH efetivo
sudo sshd -T | grep -iE '^(passwordauthentication|pubkeyauthentication)'

# Headers do site
curl -sI https://lifenett.com.br/

# Cert validade
echo | openssl s_client -servername lifenett.com.br -connect lifenett.com.br:443 2>/dev/null | openssl x509 -noout -dates

# fail2ban jails
sudo fail2ban-client status

# Último backup
ls -laht /home/lifenet/backups/ | head -3
```
