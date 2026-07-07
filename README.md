# tooark.github.io

> 🇧🇷 [Leia em Português](README.pt-BR.md)

Official **Tooark** website — open source tools for developers and DevOps teams.

🔗 **[tooark.com](https://tooark.com)**

## Stack

- HTML5, CSS3 and vanilla JavaScript (ES modules, no build step)
- GitHub Pages (hosting) + Cloudflare (DNS/proxy)
- Data loaded client-side from public APIs:
  - GitHub API — repositories, stars and org stats
  - NuGet Search API — .NET packages
  - npm Registry API — JavaScript/TypeScript packages
  - VS Code Marketplace + Open VSX — editor extensions
  - Tooark API (`api.tooark.com`) — curated project metadata

## Structure

```plaintext
tooark.github.io/
├── .github/workflows/ci.yml   # CI: Prettier, html-validate and JS syntax check
├── .htmlvalidate.json          # html-validate configuration
├── .nojekyll                   # Disables Jekyll processing on GitHub Pages
├── 404.html                    # Redirects unknown routes to the home page
├── CNAME                       # Custom domain (GitHub Pages)
├── LICENSE                     # MIT (code); Tooark brand not included
├── index.html                  # Single-page site with all sections
├── robots.txt                  # Crawler rules + sitemap reference
├── sitemap.xml                 # Sitemap with pt-BR/en alternates
├── css/
│   └── style.css               # Design system and global styles
├── docs/
│   └── cloudflare-security-headers.md  # Security headers runbook (Cloudflare)
├── js/
│   ├── i18n.js                 # Translation messages (pt/en), classic script
│   ├── main.js                 # Entry point (ES modules)
│   ├── shape-fx.js             # Canvas background effect (Shape Shifter)
│   └── modules/
│       ├── config.js           # Constants and API endpoints
│       ├── locale.js           # Locale runtime: t(), setLocale, subscribers
│       ├── layout.js           # Header, mobile nav and footer
│       ├── reveal.js           # Scroll reveal (IntersectionObserver)
│       ├── utils.js            # Shared helpers
│       ├── tooark-api.js       # Shared client for api.tooark.com
│       ├── projects.js         # Open source projects section (GitHub)
│       ├── nuget.js            # NuGet packages section
│       ├── npm.js              # npm packages section
│       ├── extensions.js       # VS Code / Open VSX extensions section
│       └── ghpkg.js            # GitHub Packages (containers) section
└── media/                      # Logos, favicons and social image (og-image.jpg)
```

## Running locally

The site uses ES modules, so it must be served over HTTP (opening
`index.html` directly from the filesystem will not work):

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## Internationalization

Portuguese is the default language; English is available via the PT/EN toggle
or the `?lang=en` query parameter (e.g. <https://tooark.com/?lang=en>), which
is also exposed to crawlers through `hreflang` alternates in the `<head>` and
in `sitemap.xml`. Messages live in [js/i18n.js](js/i18n.js).

## Quality checks (CI)

Every push/PR runs [ci.yml](.github/workflows/ci.yml): Prettier check,
html-validate and a JS syntax check. Before committing, format with:

```bash
npx prettier --write .
```

## Deploy

Pushes to `main` are automatically published by GitHub Pages
(custom domain configured in [CNAME](CNAME), Jekyll disabled via `.nojekyll`).
Security headers (HSTS, CSP, etc.) are applied at the Cloudflare edge — see
[docs/cloudflare-security-headers.md](docs/cloudflare-security-headers.md).

## License

Code licensed under the [MIT License](LICENSE). The Tooark name, logo and
brand assets are not covered by the license.
