# Plano: Migração do site pra React (Next.js) + VPS Hostinger

> **Status: EM ANDAMENTO — Fase 1 concluída em 2026-09-11.** Decisões tomadas em 2026-07-17.
> Este documento é o plano de referência da migração.

## Decisões já tomadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Formato "multiplataforma" | **Web moderna responsiva** (opção A) — NÃO app universal | O app de cliente já existe (Minha LifeNet/Expo); o site é vitrine/captação, não faz sentido em app store |
| Framework | **Next.js** (não React SPA/Vite) | O site vive de SEO local ("internet Pontal do Araguaia") e hoje é server-rendered em PHP; SPA mataria a indexação. Padrão de deploy já dominado (site do Grupo Araguaia: Next 15 + nginx + systemd) |
| Backend | **PHP atual vira API — não morre** | Admin (com 2FA TOTP) e SQLite ficam intactos; o Next só lê. Desacopla front de back sem reescrever o que funciona |
| Hospedagem final | **VPS Hostinger (já contratada)** | Mesma VPS do plano de migração do backend do Minha LifeNet (`docs/MIGRACAO-VPS.md` no monorepo) — consolidar site + app-api nela |
| Organização da VPS | **Docker Compose por projeto** + nginx/Caddy único na frente roteando por domínio | Vários projetos de stacks diferentes (Next, FastAPI+Postgres, PHP) isolados — análogo aos LXCs do Proxmox. Alternativa systemd+usuários descartada (conflito de versões de Node/Python) |

## Fases

### Fase 1 — API de leitura (PHP vira backend) ✅ FEITA (2026-09-11)
- Endpoints JSON em `api/` (GET/HEAD apenas, CORS `*`, `Cache-Control: max-age=60`), em produção:
  - `api/settings.php` — só as 8 chaves que o site usa, com os mesmos defaults do `index.php`; inclui `logo_*_url` absolutas, `whatsapp_digits` e `whatsapp_link`.
  - `api/planos.php` — `speed` já formatada (`{value, unit, label}` via `formatSpeed`), `speed_mbps` cru, `popular`/`best_seller` booleanos, `benefits` como array (split por vírgula) e `whatsapp_link` com o mesmo texto do botão "Assinar Agora".
  - `api/cobertura.php`, `api/carrossel.php` (com `url` absoluta da imagem).
  - `api/site.php` — agregado dos 4 acima numa chamada só (o que o Next vai usar no ISR).
  - `api/services_status.php` já existia em JSON e continua separado (é lento: sonda a rede).
- Helper compartilhado `api/_json.php` (não é endpoint, responde 404 se acessado direto).
- ⚠️ Achado: o admin guarda o WhatsApp como `66 9 9229-9589` (sem o 55) e o `index.php` usa cru → a home hoje gera `wa.me/66 9 9229-9589`. A API normaliza (prefixa 55 quando vêm 10–11 dígitos); o site PHP atual NÃO foi alterado.

### Fase 2 — Front Next.js
- Projeto novo (checkout no D:), Tailwind v3 **compilado** (sai o CDN).
- Componentizar o `index.php` (~55KB): Hero, Planos (replicar `formatSpeed` GIGA/MEGA de `api/db.php`), Cobertura (Leaflet), Carrossel (Swiper React ou Embla), Status dos Serviços, rodapé (CNPJ).
- Portar o beacon de analytics (ipify + `sendBeacon` → `api/track.php`) — é client-side, migra fácil.
- Rotas: home, `privacidade`, `termos`, `excluir-conta` (hoje HTMLs soltos na prod, fora do git).

### Fase 3 — SSG/ISR
- Conteúdo vem do admin e muda pouco → ISR com `revalidate` (ou on-demand): página estática e rápida, mas reflete edições do admin.

### Fase 4 — Deploy paralelo e corte
- Subir o Next em porta interna, testar em subdomínio (`novo.lifenett.com.br`) antes do corte.
- Corte: server block principal aponta pro Next; `/admin` e `/api` continuam no PHP-FPM. Rollback = reverter o nginx.
- ⚠️ **CSP do nginx** lista os CDNs do site atual — precisa de ajuste pro bundle do Next.
- ⚠️ Se o corte for ainda na VM 104: revalidar o hairpin da LAN.

### Fase 5 — Mudança pra VPS Hostinger
- Docker Compose: container do site (Next + PHP-FPM do admin) ao lado dos demais projetos.
- Corte de DNS: trocar o A record no Registro.br (hoje aponta direto pro `190.89.178.250`, DNS `a.sec.dns.br`/`c.sec.dns.br`, sem CDN) + certificado TLS novo do lado da VPS.
- Conferir `pdo_sqlite` no container PHP e recriar a rotina de backup diário (hoje cron na VM 104, retenção 14d).

### Fase 6 (opcional, depois)
- Reescrever o admin em React (ou manter PHP indefinidamente — funciona e tem 2FA).
- Extrair design tokens compartilhados com o app Minha LifeNet.

## Efeitos colaterais da saída da VM 104

**Melhora:**
- Acaba o problema do hairpin/IP mascarado (`10.10.20.5`) — o servidor volta a ver o IP real do visitante; o beacon de analytics vira opcional.
- Site deixa de depender da infra local (não repete o incidente do onboot de 2026-06-06).

**Quebra (precisa de solução):**
- A seção **"Status dos Serviços"** hoje mede latência/disponibilidade **a partir da rede LifeNet** (`curl_multi` no servidor). Rodando na Hostinger, mediria do datacenter deles — perde o sentido. Solução: um probe pequeno rodando na rede LifeNet (LXC) que reporta os resultados pro site via API.

## Pendências antes de começar

- [x] Registrar dados da VPS Hostinger — resolvido por tabela: o painel de atendimento e a `api.lifenett.com.br` já rodam nessa VPS desde 2026-09-06 (ver docs do LifeBot-Painel).
- [ ] Verificar recursos da VPS × soma dos serviços planejados (site + app-api + Postgres; 4GB de RAM é o confortável).
- [x] Trazer `excluir-conta.html` e `privacidade-app.html` da prod pro git (feito 2026-09-11, nos dois repos).

## Estimativa

4–6 sessões de trabalho até o corte do front (Fases 1–4). Fase 5 é um projeto próprio, coordenado com a migração do backend do Minha LifeNet.
