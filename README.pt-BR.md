# tooark.github.io

> 🇺🇸 [Read in English](README.md)

Site oficial da **Tooark** — ferramentas open source para desenvolvedores e equipes DevOps.

🔗 **[tooark.com](https://tooark.com)**

## Stack

- HTML5, CSS3 e JavaScript vanilla (ES modules, sem etapa de build)
- GitHub Pages (hospedagem) + Cloudflare (DNS/proxy)
- Dados carregados no cliente a partir de APIs públicas:
  - GitHub API — repositórios, stars e estatísticas da org
  - NuGet Search API — pacotes .NET
  - npm Registry API — pacotes JavaScript/TypeScript
  - VS Code Marketplace + Open VSX — extensões de editor
  - Tooark API (`api.tooark.com`) — metadados curados dos projetos

## Estrutura

```plaintext
tooark.github.io/
├── .github/workflows/ci.yml   # CI: Prettier, html-validate e checagem de sintaxe JS
├── .htmlvalidate.json          # Configuração do html-validate
├── .nojekyll                   # Desativa o processamento Jekyll no GitHub Pages
├── 404.html                    # Redireciona rotas desconhecidas para a home
├── CNAME                       # Domínio customizado (GitHub Pages)
├── LICENSE                     # MIT (código); a marca Tooark não está incluída
├── index.html                  # Página única com todas as seções
├── robots.txt                  # Regras para crawlers + referência ao sitemap
├── sitemap.xml                 # Sitemap com alternates pt-BR/en
├── css/
│   └── style.css               # Design system e estilos globais
├── docs/
│   └── cloudflare-security-headers.md  # Runbook de security headers (Cloudflare)
├── js/
│   ├── i18n.js                 # Mensagens de tradução (pt/en), script clássico
│   ├── main.js                 # Ponto de entrada (ES modules)
│   ├── shape-fx.js             # Efeito de fundo em canvas (Shape Shifter)
│   └── modules/
│       ├── config.js           # Constantes e endpoints de API
│       ├── locale.js           # Runtime de idioma: t(), setLocale, subscribers
│       ├── layout.js           # Header, menu móvel e footer
│       ├── reveal.js           # Reveal ao rolar (IntersectionObserver)
│       ├── utils.js            # Helpers compartilhados
│       ├── tooark-api.js       # Cliente compartilhado da api.tooark.com
│       ├── projects.js         # Seção de projetos open source (GitHub)
│       ├── nuget.js            # Seção de pacotes NuGet
│       ├── npm.js              # Seção de pacotes npm
│       ├── extensions.js       # Seção de extensões VS Code / Open VSX
│       └── ghpkg.js            # Seção de GitHub Packages (containers)
└── media/                      # Logos, favicons e imagem social (og-image.jpg)
```

## Rodando localmente

O site usa ES modules, então precisa ser servido via HTTP (abrir o
`index.html` direto do sistema de arquivos não funciona):

```bash
# Python
python -m http.server 8000

# ou Node
npx serve .
```

Depois acesse <http://localhost:8000>.

## Internacionalização

Português é o idioma padrão; inglês fica disponível pelo toggle PT/EN ou pelo
parâmetro `?lang=en` (ex.: <https://tooark.com/?lang=en>), que também é
exposto aos crawlers via alternates `hreflang` no `<head>` e no
`sitemap.xml`. As mensagens ficam em [js/i18n.js](js/i18n.js).

## Checagens de qualidade (CI)

Todo push/PR roda o [ci.yml](.github/workflows/ci.yml): Prettier check,
html-validate e checagem de sintaxe do JS. Antes de commitar, formate com:

```bash
npx prettier --write .
```

## Deploy

Pushes na `main` são publicados automaticamente pelo GitHub Pages
(domínio customizado no [CNAME](CNAME), Jekyll desativado via `.nojekyll`).
Os security headers (HSTS, CSP, etc.) são aplicados na borda da Cloudflare —
veja [docs/cloudflare-security-headers.md](docs/cloudflare-security-headers.md).

## Licença

Código licenciado sob a [Licença MIT](LICENSE). O nome, o logo e os demais
ativos de marca da Tooark não são cobertos pela licença.
