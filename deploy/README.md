# Publicação no Droplet `206.81.1.32`

Esta pasta contém uma implantação em que somente o Nginx recebe tráfego público no IPv4 `206.81.1.32`. O frontend e a API Bun ficam presos em `127.0.0.1`, portanto as portas `3000` e `3001` não podem ser acessadas diretamente pela internet.

## DNS

Crie estes registros `A` no DNS da DigitalOcean, todos apontando para `206.81.1.32`:

| Host | Destino |
| --- | --- |
| `@` | `206.81.1.32` |
| `campus` | `206.81.1.32` |
| `connect` | `206.81.1.32` |
| `events` | `206.81.1.32` |
| `google` | `206.81.1.32` |

Os hosts legados `connect`, `events` e `google` chegam ao Nginx por HTTPS e são tratados sem erro de certificado. Os links da interface usam as rotas canônicas em `campus.studentembassador.com`.

## Preparar o servidor

Execute como `root` ou com `sudo` no Droplet:

```bash
apt update
apt install -y nginx ufw certbot python3-certbot-dns-digitalocean
useradd --system --create-home --shell /usr/sbin/nologin gsa
mkdir -p /opt/google-student-ambassador /var/www/certbot
chown -R gsa:gsa /opt/google-student-ambassador
```

Instale o Bun em `/usr/local/bin/bun` ou ajuste `ExecStart` nos dois arquivos em `deploy/systemd/` para o caminho usado no Droplet.

Copie o projeto para `/opt/google-student-ambassador`, copie os arquivos `.env` reais (nunca os envie ao Git) e confira estes valores:

```dotenv
# Frontend/.env
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
CANONICAL_HOST=campus.studentembassador.com
API_ORIGIN=http://127.0.0.1:3001
SEO_API_URL=http://127.0.0.1:3001/api/2026/google/seo/index

# Backend/.env
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
FRONTEND_ORIGIN=https://campus.studentembassador.com
GOOGLE_OAUTH_CLIENT_ID=seu-client-id-web.apps.googleusercontent.com
```

No cliente OAuth 2.0 do tipo **Aplicativo da Web** no Google Cloud, cadastre
`https://campus.studentembassador.com` como origem JavaScript autorizada. Para
desenvolvimento local, adicione também `http://localhost:3000`. O Client ID é
público; o fluxo usa um ID token assinado, validado novamente pelo backend.

Como o usuário `gsa`, instale e compile:

```bash
cd /opt/google-student-ambassador/Frontend && bun install && bun run build
cd /opt/google-student-ambassador/Backend && bun install
chown -R gsa:gsa /opt/google-student-ambassador
```

## Certificado HTTPS

Para cobrir a raiz e todos os hosts publicados, emita um certificado SAN pelo webroot do Nginx:

```bash
certbot certonly --webroot -w /var/www/certbot \
  --cert-name studentembassador.com --expand \
  -d studentembassador.com \
  -d campus.studentembassador.com \
  -d connect.studentembassador.com \
  -d events.studentembassador.com \
  -d google.studentembassador.com
```

## Nginx e serviços

```bash
# On Ubuntu/Debian, remove the default virtual host to avoid a conflicting
# default listener on ports 80 and 443.
unlink /etc/nginx/sites-enabled/default 2>/dev/null || true

install -D -m 644 deploy/nginx/snippets/gsa-proxy.conf /etc/nginx/snippets/gsa-proxy.conf
install -D -m 644 deploy/nginx/snippets/gsa-tls.conf /etc/nginx/snippets/gsa-tls.conf
install -m 644 deploy/nginx/campus.studentembassador.com.conf /etc/nginx/conf.d/campus.studentembassador.com.conf
install -m 644 deploy/systemd/gsa-frontend.service /etc/systemd/system/gsa-frontend.service
install -m 644 deploy/systemd/gsa-backend.service /etc/systemd/system/gsa-backend.service

systemctl daemon-reload
systemctl enable --now gsa-backend gsa-frontend
nginx -t && systemctl reload nginx
```

## Firewall

Mantenha somente SSH, HTTP e HTTPS acessíveis externamente. Não abra `3000`, `3001`, MongoDB ou qualquer outra porta da aplicação:

```bash
uflow default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

## Verificação

```bash
ss -ltnp | grep -E ':(80|443|3000|3001)'
curl -I https://campus.studentembassador.com
curl -I https://connect.studentembassador.com/ambassadors
curl -I https://events.studentembassador.com/events
```

O resultado esperado é Nginx em `206.81.1.32:80` e `206.81.1.32:443`, enquanto os processos Bun aparecem somente em `127.0.0.1:3000` e `127.0.0.1:3001`.

> Nenhuma configuração consegue impedir um processo malicioso que já tenha acesso administrativo ao próprio Droplet de chamar `127.0.0.1`. A proteção aplicada aqui bloqueia o acesso remoto direto: apenas o Nginx público conversa com os serviços internos, e os serviços rodam como usuário sem login (`gsa`).
