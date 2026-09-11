# lifenett.com.br — front Next.js

Front da home do site, em produção na VM 104 (`10.20.2.11`) desde 2026-09-11.
O admin (`/admin`, PHP + SQLite, 2FA) e a API (`/api/*.php`) continuam no webroot
PHP `/var/www/lifenett.com.br`; o Next só **lê** `api/site.php` e renderiza.

## Como funciona em produção

| Peça | Onde |
|---|---|
| Build standalone | `/opt/lifenett-web` (dono `lifenet`) |
| Serviço | `systemctl status lifenett-web` → `node server.js` em `127.0.0.1:3100` |
| nginx | `snippets/lifenett-next.conf` (incluído no server block de `lifenett.com.br` e no de teste `novo.lifenett.com.br`) |
| Dados | `SITE_API_URL=http://10.20.2.11/api` (server block HTTP interno, não sai pra internet) |
| ISR | página estática, revalidada a cada 60 s; se o PHP falhar, a última versão boa continua no ar |

Roteamento do nginx: `/admin/`, `/api/`, `/img/`, `/uploads/`, `/app/` e `*.html`
vêm do webroot PHP; **todo o resto** vai pro Next. `/index.php` → 301 `/`.

## Deploy (do WSL)

```bash
cd ~/projetos/site-lifenet/web        # clone em disco Linux (node_modules no /mnt/d é lento)
npm ci
SITE_API_URL=https://lifenett.com.br/api npx next build
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
rsync -az --delete .next/standalone/ lifenet@10.20.2.11:/opt/lifenett-web/
ssh lifenet@10.20.2.11 'sudo systemctl restart lifenett-web'
curl -sI https://lifenett.com.br/ | head -1
```

Teste antes do corte: o mesmo build responde em `https://novo.lifenett.com.br/`
(`noindex`, certificado próprio, mesmo snippet do nginx).

## Rollback

```bash
sudo cp /etc/nginx/backups/lifenett.com.br.bak-<ts> /etc/nginx/sites-available/lifenett.com.br
sudo nginx -t && sudo systemctl reload nginx
```
O `index.php` continua no webroot, intacto — o rollback é só o nginx.

## Armadilhas já encontradas

- **CSS do Swiper precisa vir antes do Tailwind** (`layout.tsx` importa `swiper/css` antes de `globals.css`).
  Senão `.swiper-slide {display:block; height:100%}` vence `flex`/`h-[260px]` e o banner empilha.
- **Pesos da Inter**: só 400/600/700/800, como o site PHP. Com 900 os títulos ficam mais pesados que o original.
- **Inter do next/font é ~5% mais larga** que a do Google Fonts CSS → o menu ganhou `gap-6 xl:gap-8` e `whitespace-nowrap`.
- **`.gs-reveal` só fica invisível com JS** (`html.js`): sem JS o conteúdo aparece, e o crawler vê tudo.
- `NEXT_PUBLIC_*` é fixado no build; `SITE_API_URL` é lido em runtime (systemd).
