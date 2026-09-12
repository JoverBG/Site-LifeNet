# 🛠️ Operações & Runbook — Site LifeNet (lifenett.com.br)

Guia operacional do **ambiente de produção** do site. Use isto quando o site sair do ar, na manutenção do servidor ou pra entender onde cada coisa mora. Para instalação do zero veja [MANUAL_DE_INSTALACAO.md](MANUAL_DE_INSTALACAO.md); para segurança veja [SECURITY.md](SECURITY.md).

> ⚠️ **Atenção ao domínio:** é `lifenett.com.br` com **dois "t"**. `lifenet.com.br` (1 T) é de outra empresa.

---

## 🗺️ Onde o site mora (infraestrutura)

| Item | Valor |
| :--- | :--- |
| **Domínio** | `lifenett.com.br` / `www.lifenett.com.br` |
| **IP público** | `190.89.178.250` (loopback do CCR1036 de borda, que faz o DNAT) |
| **IP local** | `10.20.2.11` |
| **Máquina** | Proxmox **VM 104 "ServidorWEB"** (host PVE `10.20.3.2:8006`) — rede `vmbr1 tag=101`, disco no HD-4TB |
| **SO** | Ubuntu Server |
| **Stack** | nginx + **Next.js (home, `/opt/lifenett-web`, serviço `lifenett-web` em `127.0.0.1:3100`)** + PHP-FPM (admin e `/api`) + SQLite (sem MySQL) — desde 2026-09-11, ver `web/README.md` |
| **Webroot** | `/var/www/lifenett.com.br/` (dono `www-data:www-data`) |
| **Banco** | `/var/www/lifenett.com.br/data/database.sqlite` |
| **TLS** | Let's Encrypt / Certbot |
| **Acesso SSH** | usuário `lifenet` (só por chave; senha desativada) |

**Backup:** `backup-lifenett.sh` (em `/usr/local/bin/`) roda diário às 03:00, retenção 14 dias — salva webroot + nginx + php + certs + crontabs em `~/backups/`.

---

## 🚑 Site fora do ar — checklist de diagnóstico

Diagnostique de fora pra dentro. O objetivo é isolar **rede/DNS** × **máquina desligada** × **serviço (nginx/PHP) quebrado**.

### 1. O site público responde?
```bash
curl -I https://www.lifenett.com.br/        # esperado: HTTP 200 (ou 301 no http://)
getent hosts www.lifenett.com.br            # esperado: 190.89.178.250
```

### 2. A máquina interna está viva?
```bash
ping -c2 10.20.2.11
curl -I http://10.20.2.11/                  # bate direto no nginx, sem passar pela borda (só responde de dentro da 10.20.2.0/24)
```
- **Não responde nada (nem ping)** → a máquina (VM 104) provavelmente está **desligada ou travada**. Vá pro passo 3.
- **Responde aqui mas não no público** → problema na borda (CCR1036 / DNAT / hairpin). Veja a seção de rede no SECURITY/memória.
- **Responde `502 Bad Gateway` na home (`/`)** → nginx vivo, mas o **Next (`lifenett-web`) caiu**. Vá pro passo 4.
- **Responde `502` só em `/admin` ou `/api`** → nginx vivo, mas **PHP-FPM caiu**. Vá pro passo 4.

> 💡 **Truque de isolamento:** teste um vizinho da mesma sub-rede (ex.: `ping 10.20.2.1`, `curl 10.20.2.109`). Se os vizinhos respondem e só o `.11` não, o problema é a **máquina**, não a rede nem o DNS.

### 3. A VM está rodando no Proxmox?
```bash
ssh root@10.20.3.2 "qm status 104"          # esperado: status: running
ssh root@10.20.3.2 "qm start 104"           # liga se estiver stopped
```
Depois de ligar, **espere ~15-30s** o Ubuntu bootar. O nginx pode responder `502` por alguns segundos até o PHP-FPM subir — é transitório.

### 4. Serviços dentro da VM
```bash
ssh lifenet@10.20.2.11
sudo systemctl status nginx php8.5-fpm lifenett-web   # web + admin/api + home Next
sudo systemctl restart lifenett-web          # home em 502? reinicia o Next (sobe em ~1s)
sudo systemctl restart php8.5-fpm nginx      # reinicia o backend + web
sudo nginx -t                                # valida config antes de recarregar
curl -I http://127.0.0.1:3100/               # o Next responde direto? (esperado 200)
```

> **Rollback do Next pro PHP antigo** (se precisar tirar o Next do caminho): restaure o backup do server block em
> `/etc/nginx/backups/lifenett.com.br.bak-<data>` e `sudo nginx -t && sudo systemctl reload nginx`. O `index.php` continua no webroot.

---

## 🛰️ Monitor externo (alerta no Telegram)

Desde 2026-09-11 a **VPS Hostinger `lifenet-core`** (`179.197.78.116`, fora da rede LifeNet) checa o site a cada 2 minutos
e avisa no Telegram do Lucas (bot do painel) quando cai e quando volta. Cobre queda de link, de VM e de serviço.

| Item | Valor |
|---|---|
| Script | `/opt/monitor/site-lifenett-monitor.sh` (cópia em `deploy/monitor/` deste repo) |
| Agendamento | `systemd` timer `site-lifenett-monitor.timer` (a VPS não tem cron) |
| Alvos | `/` (Next), `/api/settings.php` (PHP) e `/app/` (estático) |
| Regra | 2 falhas seguidas (~4 min) = "fora do ar"; 1 sucesso = "voltou" |
| Estado | `/var/lib/site-monitor/` |
| Ver | `ssh -i ~/.ssh/lifenet_vps root@179.197.78.116 'journalctl -u site-lifenett-monitor -n 20'` |

---

## 📒 Histórico de incidentes

### 2026-09-11 — Home migrada pra Next.js (mudança planejada, sem incidente)
- Fases 1–4 de `MIGRACAO-REACT-VPS.md`: PHP virou API de leitura (`api/site.php`), front novo em `web/`, ISR de 60 s, teste em `novo.lifenett.com.br` e corte no nginx via `snippets/lifenett-next.conf`.
- Comparação por screenshot (desktop e mobile) deu a mesma altura de página do PHP. Zero CDN no front novo (fontes, ícones e libs no bundle).
- Efeito colateral bom: o admin guardava o WhatsApp sem o DDI (`66 9 9229-9589`) e a home antiga gerava `wa.me/66 9…`; a API normaliza pra `5566992299589`.
- Ruído esperado no `journalctl -u lifenett-web`: `Server Reference ID did not match` = scanners mandando cabeçalho `Next-Action`; o site não usa server actions.

### 2026-06-06 — Site fora do ar após reboot do Proxmox
- **Sintoma:** `lifenett.com.br` inacessível (público e interno recusando 80/443).
- **Causa raiz:** o host Proxmox reiniciou ~06:53. A **VM 104 estava com `onboot=0`** e, ao contrário dos outros guests (todos `onboot=1`), **não subiu sozinha** — ficou desligada.
- **Como foi isolado:** vizinhos da sub-rede (`10.20.2.1`, `.108`, `.109`) respondiam normal; só o `.11` estava morto → era a máquina, não rede/DNS/nginx.
- **Correção:**
  ```bash
  ssh root@10.20.3.2 "qm start 104 && qm set 104 --onboot 1"
  ```
  O `--onboot 1` garante que a VM **inicia automaticamente** no próximo reboot do host, evitando a recorrência.
- **Lição:** toda VM de produção no Proxmox deve estar com `onboot: 1`. Conferir com `qm config <id> | grep onboot`.

### 2026-06-23 — "Status dos Serviços" mostrando Falha falsa
- **Sintoma:** na landing, **Disney+ e HBO Max** apareciam em **"Falha"** mesmo funcionando.
- **Causa raiz:** as URLs cadastradas na tabela `site_services` do SQLite estavam **erradas** — `https://disney-plus.com` e `https://hbo-max.com` (domínios inexistentes; alguém colou o slug como domínio). O monitor faz `HEAD` em cada URL e, sem DNS/conexão, marca offline.
- **Correção (no banco, não-versionado):**
  ```bash
  ssh lifenet@10.20.2.11
  sudo sqlite3 /var/www/lifenett.com.br/data/database.sqlite \
    "UPDATE site_services SET url='https://www.disneyplus.com' WHERE slug='disney-plus';
     UPDATE site_services SET url='https://www.max.com'        WHERE slug='hbo-max';"
  ```
- **Como o monitor funciona (importante):** `api/services_status.php` **NÃO** lê o Downdetector — ele faz um `HEAD` (curl_multi) em cada serviço **a partir da rede LifeNet** e classifica `online`/`slow`/`offline`. É um teste de **disponibilidade da nossa rede**, não o "sentimento" de reclamações do Downdetector (que está atrás de Cloudflare e não é raspável do servidor sem arriscar ban do IP público). Textos da seção foram ajustados pra refletir isso.
- **Lição:** ao cadastrar serviço novo no painel, conferir a URL real (não o slug) — `curl -I <url>` deve responder algo `< 500`.

---

## 📊 Analytics de visitas (caseiro)

O site registra cada acesso na tabela `page_views` (SQLite). Como funciona e **por que é assim**:

- **O nginx NÃO enxerga o IP real do visitante.** Por causa da regra de **hairpin masquerade** no CCR edge (`10.10.60.1`), todo o tráfego chega no nginx como `10.10.20.5` (o IP do CCR). Confirmado no access log: 100% das requisições vêm desse IP. O Mikrotik faz NAT em camada 3/4 e não consegue injetar o IP num header HTTP.
- **Solução (beacon client-side):** no `index.php`, um JS leve chama `https://api.ipify.org` **no navegador do visitante** (a chamada sai do cliente, contornando o NAT) e envia `{ip, path, referrer, vid}` para `api/track.php` via `navigator.sendBeacon`. O `vid` é um UUID em `localStorage` (visitante único).
- **`api/track.php`:** valida que o IP é público, **geolocaliza server-side** reusando `api/geo_helper.php` (`ip-api.com`), filtra **bots** por User-Agent (≈metade do tráfego são scanners) e grava em `page_views`. Bots não geram chamada de geo.
- **CSP:** o `connect-src` do nginx libera `https://api.ipify.org` (necessário quando a CSP virar enforce; hoje é Report-Only).
- **Alternativas descartadas:** Cloudflare na frente (mudaria DNS do Registro.br) e mexer no NAT/rota do CCR (risco de derrubar o site). Ver histórico se um dia quiser IP real **server-side**.
- **LGPD:** hoje guarda IP completo. Se for expor publicamente, anonimizar (truncar último octeto) e referenciar no `privacidade.php`.

## 🚀 Planos: como cadastrar GIGA

O campo **Velocidade** no painel é numérico e **sempre em Mega**. O helper `formatSpeed()` (em `api/db.php`) exibe automaticamente:

- `>= 1000` → **GIGA** (ex: `1000` → "1 GIGA", `1500` → "1.5 GIGA", `2000` → "2 GIGA")
- abaixo disso → **MEGA** (ex: `300` → "300 MEGA")

Aplicado no card do plano e no link de WhatsApp (`index.php`) e na lista do admin (`admin/plans.php`). **Para criar um plano de 1 giga: digite `1000` no campo Velocidade.**
