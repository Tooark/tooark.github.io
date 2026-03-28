# tooark.github.io

Site oficial da **Tooark** — ferramentas open source para desenvolvedores e DevOps.

🔗 **[tooark.com](https://tooark.com)**

## Stack

- HTML5, CSS3, JavaScript (vanilla)
- GitHub Pages + Cloudflare DNS
- GitHub API para listagem dinâmica de repositórios
- NuGet Search API para listagem de pacotes

## Estrutura

```plaintext
tooark.github.io/
├── CNAME                    # Domínio customizado (GitHub Pages)
├── index.html               # Página principal e seções do site
├── README.md                # Documentação do projeto
├── css/
│   └── style.css            # Design system e estilos globais
├── js/
│   └── main.js              # Lógica da UI e integrações (GitHub/NuGet)
└── media/
    ├── favicon.png          # Favicon PNG
    ├── favicon.svg          # Favicon SVG
    ├── tooark-dark.svg      # Logo para fundo claro
    └── tooark-light.svg     # Logo para fundo escuro
```

## Seções da página

- Hero com estatísticas dinâmicas
- Projetos Open Source com filtros por categoria
- Pacotes (.NET via NuGet e bloco npm em breve)
- Contribuidores
- Categorias
- Serviços (em breve)

## Deploy

O site é servido automaticamente pelo GitHub Pages a partir da branch `main`.
