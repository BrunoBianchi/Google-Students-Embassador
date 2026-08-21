# Produção: Campus Ambassador Hub

O endereço público canônico é `https://campus.studentembassador.com`.

## Serviços

- Frontend: configure `Frontend/.env` a partir de `Frontend/.env.example`, execute `bun run build` e depois `bun run start` na pasta `Frontend`.
- Backend: configure `Backend/.env` a partir de `Backend/.env.example` e execute `bun run start` na pasta `Backend`.
- O frontend encaminha as chamadas feitas em `/api/*` para `API_ORIGIN`. Assim, o navegador usa o mesmo domínio público para páginas, autenticação e API.

### Google Maps

Para ativar `/map`, crie uma chave de navegador no Google Cloud e habilite **Maps JavaScript API** e **Geocoding API**. Em `Backend/.env`, defina `GOOGLE_MAPS_BROWSER_API_KEY` e, opcionalmente, `GOOGLE_MAPS_MAP_ID`. Restrinja a chave por referenciador HTTP aos domínios publicados (por exemplo, `https://*.studentembassador.com/*`); a chave é entregue ao navegador por definição da API do Maps, portanto não use uma chave de servidor nesse campo.

## DNS e HTTPS

O redirecionamento de hosts só pode acontecer depois que a requisição chega ao servidor. Por isso, no provedor de DNS, aponte para a infraestrutura onde o frontend está publicado:

1. Crie um registro para `campus.studentembassador.com`.
2. Crie um registro para `studentembassador.com`.
3. Crie um registro curinga para `*.studentembassador.com`.
4. Emita um certificado TLS que cubra `studentembassador.com` e `*.studentembassador.com` (normalmente por desafio DNS).

Depois disso, com `NODE_ENV=production` e `CANONICAL_HOST=campus.studentembassador.com`, o frontend responde com redirecionamento permanente `308` para o domínio canônico, preservando caminho e parâmetros. Isso inclui a raiz, `google.studentembassador.com` e qualquer subdomínio que esteja direcionado ao servidor.

## Proxy reverso recomendado

Caso seja usado Nginx, Caddy, Cloudflare ou uma plataforma gerenciada, encaminhe todo o tráfego HTTPS ao processo do frontend e preserve o cabeçalho `Host`. Não crie uma rota pública separada para a API: o processo do frontend já encaminha `/api/*` ao backend interno definido por `API_ORIGIN`.

## Validação após publicar

1. Abra `https://campus.studentembassador.com` e faça login, crie um evento e publique uma mensagem no fórum.
2. Abra `https://studentembassador.com/alguma-rota?teste=1` e confira o `308` para `https://campus.studentembassador.com/alguma-rota?teste=1`.
3. Repita com um subdomínio apontado pelo curinga, por exemplo `https://teste.studentembassador.com`.
4. Confirme `https://campus.studentembassador.com/robots.txt` e `https://campus.studentembassador.com/sitemap.xml`.

## Prévia de compartilhamento

As URLs públicas de evento (`/events/:id`), perfil (`/u/:id`) e fórum público (`/forums/:id`) entregam no servidor títulos, descrição, imagem Open Graph/Twitter e dados estruturados específicos. Para que uma foto apareça na prévia, a capa do evento deve usar uma URL HTTPS pública; fotos de perfil são encaminhadas por `/uploads/*`. Fóruns privados nunca expõem dados de prévia pública.
