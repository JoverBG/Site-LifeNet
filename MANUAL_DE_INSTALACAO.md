# 📝 Manual de Instalação e Implantação — LifeNet Telecom

Este guia orienta o passo a passo para instalar e colocar o site da **LifeNet Telecom** em produção em seu servidor de hospedagem ou rede local.

---

## 📋 1. Requisitos do Sistema, Máquina e Segurança

O site foi desenvolvido utilizando uma arquitetura ultra leve, limpa e extremamente eficiente (PHP puro + SQLite3), o que elimina a necessidade de bancos de dados MySQL/MariaDB separados e torna o consumo de recursos absurdamente baixo.

### 🐧 Sistema Operacional Recomendado
* **Linux (Altamente Recomendado):** Ubuntu Server (20.04 LTS, 22.04 LTS ou 24.04 LTS) ou Debian (11 ou 12). São os padrões da indústria, oferecem maior facilidade para configurar SSL (HTTPS) grátis com Let's Encrypt e gerenciar as permissões de arquivos.
* **Outros:** AlmaLinux, Rocky Linux, FreeBSD ou CentOS.
* **Windows Server:** Totalmente compatível (rodando sobre Apache ou IIS), embora Linux seja recomendado por razões de segurança nativa e performance.

### 💻 Configurações Mínimas e Recomendadas da Máquina (VM / VPS / Servidor Dedicado)
Como o SQLite funciona direto em arquivo e o PHP é extremamente otimizado, o site roda liso mesmo nas configurações mais básicas do mercado:

| Recurso | Configuração Mínima | Configuração Recomendada |
| :--- | :--- | :--- |
| **Processador (CPU)** | 1 vCPU (Core) | 2 vCPUs (Cores) |
| **Memória RAM** | 512 MB | 2 GB RAM (Gararante excelente folga para tráfego simultâneo) |
| **Armazenamento** | 5 GB SSD / HDD | 20 GB SSD |
| **Largura de Banda** | 100 Mbps simétrico | 1 Gbps ou superior simétrico (Crucial para o Speedtest!) |

> [!NOTE]
> **Sobre o Teste de Velocidade (Speedtest):** 
> Como o site possui um velocímetro próprio, a velocidade máxima que o seu cliente conseguirá testar estará limitada à largura de banda (link de rede) da própria máquina/VPS onde o site está hospedado. Por isso, hospedar em uma VPS com link de 1 Gbps garante testes de velocidade reais e precisos para planos de banda larga rápidos!

### ⚙️ Requisitos de Software
* **Servidor Web:** Apache (com módulo `mod_rewrite` ativo) ou Nginx.
* **Versão do PHP:** PHP 7.4 ou superior.
* **Extensões do PHP Necessárias:**
  * `pdo` (Ativada por padrão)
  * `pdo_sqlite` (Extensão para ler o arquivo do banco de dados SQLite)
  * `json` (Usado para tráfego de dados nas APIs)

---

## 🔒 2. Preparado para HTTPS (SSL) e Segurança de Sessão

**Sim! O site está 100% preparado e otimizado para funcionar sob HTTPS (conexão segura SSL).**

### Como o site se comporta em HTTPS:
1. **Links Relativos:** Toda a estrutura de links do site (CSS, Javascript, imagens e requisições de API) foi programada com caminhos relativos. Isso significa que ao ativar o certificado SSL, o site migra instantaneamente para HTTPS sem links quebrados ou avisos de *"Conteúdo Misto"* (Mixed Content).
2. **Cookies de Sessão Seguros:** Nossa biblioteca de segurança ([api/security.php](file:///d:/Game/Downloads/MK%20BK/var/www/html/nove-site/api/security.php)) foi programada com **detecção dinâmica de protocolo**. Se o site for acessado via HTTPS, as configurações de sessão ativam automaticamente a flag `Secure`, criptografando os cookies administrativos contra interceptações na rede (ataques Man-in-the-Middle).

### 💡 Dica para Instalar SSL no Linux (Let's Encrypt / Certbot)
Caso use Ubuntu Server e Apache, você pode instalar um certificado SSL 100% gratuito e com renovação automática em 2 minutos rodando:
```bash
sudo apt update
sudo apt install certbot python3-certbot-apache
sudo certbot --apache
```
*(O Certbot configurará as regras de redirecionamento automático de HTTP para HTTPS de forma 100% automática e segura!)*

---

## 🚀 3. Instalação Passo a Passo

### Passo 1: Transferir os Arquivos
Envie toda a pasta do projeto (todos os arquivos PHP, HTML, pastas `admin`, `api`, `css`, `img`, `js`, `data` e `fonts`) para o diretório do seu servidor de hospedagem.
* Normalmente é a pasta `/public_html/` ou `/var/www/html/`.

### Passo 2: Configurar Permissões de Escrita (CRÍTICO)
Como o banco de dados SQLite é salvo em arquivo físico dentro do projeto, o servidor web precisa de permissão de escrita para atualizar os dados (planos, logs, carrossel).
* **No Linux (via terminal):**
  Acesse a pasta do projeto e execute os comandos:
  ```bash
  sudo chown -R www-data:www-data data/
  sudo chmod -R 775 data/
  ```
* **Via Painel de Controle (cPanel / FileZilla):**
  1. Vá até a pasta do projeto e localize a pasta `data/`.
  2. Clique com o botão direito na pasta `data/` e selecione **"Permissões do Arquivo" (File Permissions / CHMOD)**.
  3. Defina a permissão para `775` (ou `777` caso seu servidor web seja restrito).
  4. Certifique-se de marcar a opção *"Aplicar recursivamente a todos os arquivos e subpastas"*.

---

## 🔒 4. Acesso Administrativo e Segurança

O painel administrativo já está integrado e pronto para uso:

* **URL de Acesso:** `http://seu-dominio.com.br/admin/`
* **Usuário Padrão:** `admin`
* **Senha Padrão:** `admin123`

> [!WARNING]
> **RECOMENDAÇÃO DE SEGURANÇA:** 
> Assim que acessar o painel pela primeira vez em produção, vá na aba **Configurações** no menu lateral e altere a senha do administrador para uma senha forte de sua preferência.

---

## 🛡️ 5. Recursos de Segurança Já Ativados no Projeto

Para garantir que o site e os dados fiquem 100% protegidos em produção, as seguintes camadas de segurança já foram programadas por nós:
1. **Proteção de Banco de Dados:** Criamos o arquivo `data/.htaccess` que bloqueia qualquer tentativa de download direto do arquivo de banco de dados pela URL (`/data/database.sqlite`).
2. **Proteção Contra Ataques de Força Bruta:** O login do painel administrativo possui um limitador que bloqueia o IP por 5 minutos após 5 tentativas incorretas consecutivas.
3. **Segurança de Sessão:** Cookies HTTP-Only, Strict e Secure ativados para evitar roubos de sessão.
4. **Proteção CSRF:** Tokens criptográficos gerados para validar todos os formulários administrativos, impedindo envios falsificados.
5. **Upload de Imagens Seguro:** Validação rigorosa de extensão de arquivo e MIME-type no envio de banners e logos para evitar RCE (execução de scripts maliciosos).

---

## ⚙️ 6. Primeiros Passos Pós-Instalação

Uma vez instalado o site, use o painel administrativo para configurar:
1. **Contatos e Redes Sociais:** Vá em **Configurações** e altere o número do **WhatsApp** de atendimento e a URL do **Instagram**.
2. **Logotipos:** Faça upload do seu logotipo de cabeçalho e rodapé.
3. **Planos de Internet:** Remova os planos de teste e adicione seus planos de fibra reais (escolhendo as cores e etiquetas personalizadas!).
4. **Banners Rotativos:** Envie seus banners na aba **Carrossel Topo** (suporta banners de 1920x600px em JPG, PNG, WEBP e SVG, que se redimensionarão automaticamente).
5. **Sugestões do Downdetector:** Vá na aba **Serviços Monitorados** e use nosso catálogo rápido de mais de 40 sugestões populares do Downdetector para adicionar os serviços que deseja exibir na grade de status do seu site!

---

### 🎉 Parabéns! O site da LifeNet Telecom está pronto para voar alto!
