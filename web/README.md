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

## Revisão de 2026-09-12 (4 agentes: front, PHP, infra, QA no navegador)

Corrigido no mesmo dia: cor do selo do plano validada (`#rrggbb`), `carousel`/`coverage` normalizados e
timeout de 10 s no `fetchSite`, `noopener` no popup da cobertura, `favicon.ico` e `og.png` (1200x630)
próprios, `<main>` e `aria-hidden` nos ícones, velocímetro voltou a abrir o speedtest.net em nova aba
como no PHP. No PHP: URL absoluta com origem FIXA (o `Host` da requisição era forjável), erros de banco/JSON
viram 500 JSON (o ISR mantém a versão anterior), `whatsapp_digits` ignora 0 de tronco, e o admin gravava
o upload de logo com chave/valor trocados (bug antigo). No nginx: o server block interno `10.20.2.11`
ficou restrito à rede local (respondia pela internet via `Host:` com a home PHP antiga), `/img` e `/uploads`
sem `add_header` próprio (apagava HSTS/nosniff herdados), `api/totp.php` bloqueado, HSTS no `novo`.

Ainda em aberto (decisão do Lucas): `www.` responde 200 em vez de redirecionar pro apex (canonical
protege o SEO).

## Imagens (2026-09-12)

Banner e fundo passaram a WebP, com o PNG mantido no disco como reserva:

| Arquivo | Antes | Depois | Onde |
|---|---|---|---|
| `img/fundo.png` → `img/fundo.webp` | 1,7 MB | 121 KB | classe `.bg-hero` no `globals.css`, com `image-set()` e PNG de reserva |
| `img/Carrossel1.png` → `.webp` | 1,9 MB | 183 KB (desktop) / 71 KB (celular, `Carrossel1-sm.webp`) | `<picture>` no `BannerSwiper`, PNG no `<img>` de reserva |

Home caiu de **8,4 MB para 4,55 MB** no desktop e 4,44 MB no celular. Qualidade WebP 85 (banner, tem texto)
e 78 (fundo, exibido a 30% de opacidade); comparação lado a lado não mostrou diferença visível.
Banner cadastrado pelo admin **não** é convertido (o upload vai como veio) — só o banner padrão tem WebP.

O que ainda pesa: `mapa.png` 2,6 MB (é o arquivo que o teste de velocidade baixa, além de ilustrar a
cobertura num card de 144 px — daria pra separar as duas funções), os três logos (~1,1 MB somados, PNG com
transparência) e `icone-roteador.png` 275 KB. `fundo2.png` (1,6 MB) não é usado por ninguém.
