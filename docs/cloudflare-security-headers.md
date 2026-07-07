# Security headers via Cloudflare

O GitHub Pages não permite configurar headers de resposta customizados. Como o
domínio `tooark.com` está **proxiado pela Cloudflare** (verificado: `Server: cloudflare` na resposta),
os security headers devem ser aplicados na borda, com **Response Header Transform Rules**.

## Como aplicar (dashboard)

1. Acesse o dashboard da Cloudflare → zona **tooark.com**.
2. Vá em **Rules → Overview → Create rule → Response Header Transform Rule** (em planos/UIs antigas: **Rules → Transform Rules → Modify Response Header**).
3. Nome sugerido: `security-headers`.
4. Expressão de filtro (aplica em todo o site):

   ```txt
   (http.host eq "tooark.com")
   ```

5. Adicione as operações **Set static** abaixo e faça o deploy da regra.

## Headers

| Header                      | Valor                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                                                                           |
| `X-Content-Type-Options`    | `nosniff`                                                                                                       |
| `X-Frame-Options`           | `DENY`                                                                                                          |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                               |
| `Permissions-Policy`        | `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()` |
| `Content-Security-Policy`   | ver seção abaixo                                                                                                |

> **Atenção ao HSTS**: `includeSubDomains` exige que todos os subdomínios
> (ex.: `api.tooark.com`) sirvam HTTPS válido — hoje já é o caso (Workers).
> Só adicione `preload` se tiver certeza de que isso não mudará.

## Content-Security-Policy

Valor completo (uma linha):

```txt
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://github.com https://avatars.githubusercontent.com; connect-src 'self' https://api.github.com https://azuresearch-usnc.nuget.org https://registry.npmjs.org https://api.tooark.com https://open-vsx.org https://marketplace.visualstudio.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

Racional das origens permitidas (manter em sincronia com
[`js/modules/config.js`](../js/modules/config.js)):

- **script-src**: além dos scripts próprios (`'self'`), o beacon do
  Cloudflare Web Analytics (`static.cloudflareinsights.com`), injetado
  automaticamente pela Cloudflare na borda.
- **style-src / font-src**: Google Fonts (`fonts.googleapis.com` /
  `fonts.gstatic.com`). `'unsafe-inline'` é necessário porque os cards
  renderizados via JS usam atributos `style` (ex.: cor da linguagem no card de
  projeto) e o select de ordenação usa `background-image` inline no CSS.
- **img-src**: avatares dos contribuidores (`github.com/*.png` redireciona para
  `avatars.githubusercontent.com`) e o ícone `data:` do select de ordenação.
- **connect-src**: todas as APIs consumidas pelo site — GitHub, NuGet, npm,
  API da Tooark, Open VSX e VS Code Marketplace.

### Rollout seguro

Publique primeiro como **`Content-Security-Policy-Report-Only`** com o mesmo
valor, navegue pelo site com o console aberto (F12) verificando violações e,
só então, troque para `Content-Security-Policy`.

### Scripts injetados pela Cloudflare (achados do Report-Only)

O modo Report-Only revelou violações de `script-src` que **não vêm do código do
site** (o `index.html` não tem nenhum script inline) e sim de recursos da
própria Cloudflare injetados na borda:

1. **Script inline no fim do `<body>`** (`window.__CF$cv$params` →
   `/cdn-cgi/challenge-platform/scripts/jsd/main.js`): injetado pelo
   **Bot Fight Mode / JavaScript Detections**. O conteúdo muda a cada resposta
   (ray ID + timestamp), então allowlist por hash **não funciona**. Opções:
   - **Desativar o Bot Fight Mode** (Security → Bots) — mantém o CSP estrito
     `script-src 'self'`. Para um site estático sem formulários/login é a
     opção recomendada.
   - Manter e usar `nonce`: a Cloudflare lê o nonce do header CSP e o aplica
     nos scripts que injeta; porém, como nosso header é estático (Transform
     Rule), o nonce seria fixo e previsível — segurança equivalente a
     `unsafe-inline`. Não recomendado.
   - `'unsafe-inline'`: desaconselhado pela própria Cloudflare.
2. **`https://static.cloudflareinsights.com/beacon.min.js`**: beacon RUM do
   **Web Analytics** (injeção automática). Opções:
   - Manter o Web Analytics e adicionar a origem ao `script-src`:
     `script-src 'self' https://static.cloudflareinsights.com`
   - Ou desativar a injeção automática (Analytics & Logs → Web Analytics).

Avisos esperados no console em Report-Only (sem ação):
`The Content Security Policy directive 'upgrade-insecure-requests' is ignored
when delivered in a report-only policy.` — a diretiva só tem efeito no modo
enforce.

> **Decisão aplicada (jul/2026)**: Bot Fight Mode **desativado** (mantém
> `script-src` sem inline) e Web Analytics **mantido**, com
> `https://static.cloudflareinsights.com` adicionado ao `script-src` — já
> refletido no valor canônico do CSP acima.

## Como aplicar (API)

Para automatizar (requer `CF_API_TOKEN` com permissão `Zone.Transform Rules:Edit`
e o `CF_ZONE_ID` da zona `tooark.com`):

```bash
curl -X PUT \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/rulesets/phases/http_response_headers_transform/entrypoint" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "rules": [
      {
        "description": "security-headers",
        "expression": "(http.host eq \"tooark.com\")",
        "action": "rewrite",
        "action_parameters": {
          "headers": {
            "Strict-Transport-Security": { "operation": "set", "value": "max-age=31536000; includeSubDomains" },
            "X-Content-Type-Options": { "operation": "set", "value": "nosniff" },
            "X-Frame-Options": { "operation": "set", "value": "DENY" },
            "Referrer-Policy": { "operation": "set", "value": "strict-origin-when-cross-origin" },
            "Permissions-Policy": { "operation": "set", "value": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" },
            "Content-Security-Policy-Report-Only": { "operation": "set", "value": "default-src '\''self'\''; script-src '\''self'\'' https://static.cloudflareinsights.com; style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src '\''self'\'' data: https://github.com https://avatars.githubusercontent.com; connect-src '\''self'\'' https://api.github.com https://azuresearch-usnc.nuget.org https://registry.npmjs.org https://api.tooark.com https://open-vsx.org https://marketplace.visualstudio.com; object-src '\''none'\''; base-uri '\''self'\''; form-action '\''self'\''; frame-ancestors '\''none'\''; upgrade-insecure-requests" }
          }
        }
      }
    ]
  }'
```

> O exemplo acima usa `Content-Security-Policy-Report-Only`; após validar,
> renomeie a chave para `Content-Security-Policy`.
> **Cuidado**: o `PUT` no entrypoint substitui todas as regras existentes da
> fase — se já houver outras Transform Rules de response header, inclua-as no
> payload.

## Verificação

```bash
curl -sI https://tooark.com | grep -iE "strict-transport|content-type-options|frame-options|referrer|permissions|content-security"
```

E teste o site inteiro (busca, filtros, troca de idioma PT/EN) com o console
do navegador aberto — violações de CSP aparecem como erros `Refused to ...`.
