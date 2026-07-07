(function () {
  'use strict';

  // @ts-ignore
  window.TooarkI18n = {
    htmlLang: { pt: 'pt-BR', en: 'en-US' },
    messages: {
      pt: {
        meta: {
          title: 'Tooark - Ferramentas para Desenvolvedores e DevOps',
          description:
            'Ferramentas open source que aceleram o dia a dia de desenvolvedores e equipes DevOps. Bibliotecas .NET e Node, extensões VS Code, imagens Docker e templates CI/CD.',
          ogTitle: 'Tooark - Ferramentas para Desenvolvedores e DevOps',
          ogDescription:
            'Ferramentas open source que aceleram o dia a dia de desenvolvedores e equipes DevOps.',
          twitterTitle: 'Tooark - Ferramentas para Desenvolvedores e DevOps',
          twitterDescription:
            'Ferramentas open source que aceleram o dia a dia de desenvolvedores e equipes DevOps.',
          ogImageAlt:
            'Tooark — ferramentas open source para desenvolvedores e DevOps',
        },
        header: {
          homeAria: 'Tooark Home',
          openMenu: 'Abrir menu',
          closeMenu: 'Fechar menu',
          languageSelector: 'Selecionar idioma',
          projects: 'Projetos',
          packages: 'Pacotes',
          contributors: 'Contribuidores',
          categories: 'Categorias',
          services: 'Serviços',
          sponsors: 'Apoie',
        },
        hero: {
          subtitle:
            'Ferramentas criadas por entusiastas para ajudar <strong>Desenvolvedores de Software</strong> e <strong>DevOps</strong>',
          ctaProjects: 'Ver Projetos',
          statsRepos: 'Repositórios',
          statsLanguages: 'Linguagens',
          shapeSequence:
            'Tooark|Open Source|Ferramentas|DevOps|Código|#infinity 50',
        },
        projects: {
          title: 'Projetos Open Source',
          desc: 'Temos projetos que são open source construídos para resolver problemas reais do dia a dia de desenvolvimento e operações.',
          searchPlaceholder: 'Buscar projetos por nome ou descrição',
          searchAria: 'Buscar projetos',
          filterAll: 'Todos',
          filterOthers: 'Outros',
          loading: 'Carregando projetos...',
          empty: 'Nenhum projeto encontrado para os filtros atuais.',
        },
        packages: {
          title: 'Pacotes',
          desc: 'Bibliotecas publicadas em registros de pacotes para uso direto em suas aplicações.',
          nugetTitle: 'Pacotes .NET',
          npmTitle: 'Pacotes JavaScript / TypeScript',
          githubTitle: 'Pacotes publicados no GitHub',
          githubMeta:
            'Pacotes e artefatos publicados no GitHub Packages da organização.',
          githubCardTitle: 'GitHub Packages da Tooark',
          githubCardDesc:
            'Acesse os pacotes publicados diretamente no GitHub, incluindo artefatos distribuídos pela organização.',
          extensionsTitle: 'Extensões para VS Code e Open VSX',
          metaExtensions: 'extensões',
          installsLabel: 'installs',
          ghpkgDesc:
            'Imagem de contêiner publicada no GitHub Packages da organização.',
          metaImages: 'imagens de contêiner',
          seeInGithub: 'Veja no GitHub',
          seeInMarketplace: 'Veja no Marketplace',
          searchPlaceholder: 'Buscar pacotes por nome ou descrição',
          nugetSearchAria: 'Buscar pacotes NuGet',
          npmSearchAria: 'Buscar pacotes npm',
          sortAria: 'Ordenar pacotes',
          sortDownloads: 'Downloads',
          sortName: 'Nome',
          loading: 'Carregando pacotes...',
          empty: 'Nenhum pacote encontrado para sua busca.',
          metaPackages: 'pacotes',
          metaDownloads: 'downloads',
          metaDownloadsPerMonth: 'downloads/mes',
          seeInNuget: 'Veja no NuGet',
          seeInNpm: 'Veja no npm',
          noDescription: 'Sem descrição disponível.',
          downloadsLabel: 'downloads',
          npmFallbackTags: 'JavaScript / TypeScript',
        },
        contributors: {
          title: 'Contribuidores',
          desc: 'Pessoas que ajudam a construir e evoluir os projetos open source da Tooark.',
        },
        categories: {
          title: 'O que fazemos',
          desc: 'Organizamos nossas ferramentas em categorias para facilitar a busca pela solução ideal para seu projeto.',
          cardLibrariesTitle: 'Bibliotecas',
          cardLibrariesDesc:
            'Pacotes e bibliotecas reutilizáveis em C#, Node.js e JavaScript para acelerar o desenvolvimento.',
          cardCiCdTitle: 'CI/CD & DevOps',
          cardCiCdDesc:
            'Templates e actions para GitLab CI e GitHub Actions - SonarQube, Trivy, notificações e mais.',
          cardObservabilityTitle: 'Observabilidade',
          cardObservabilityDesc:
            'Soluções pré-configuradas com OpenTelemetry para monitoramento de aplicações web e backend.',
          cardInfraTitle: 'Infraestrutura',
          cardInfraDesc:
            'Módulos Terraform para AWS e GCP, imagens Docker base e configurações de terminal.',
        },
        services: {
          title: 'Serviços',
          soon: 'Em breve',
          desc: 'Estamos preparando serviços profissionais para levar suas operações ao próximo nível.',
          cardConsultingTitle: 'Consultoria DevOps',
          cardConsultingDesc:
            'Implementação de pipelines CI/CD, conteinerização e automação de infraestrutura.',
          cardSecurityTitle: 'Segurança & Compliance',
          cardSecurityDesc:
            'Análise de vulnerabilidades, quality gates e conformidade de código com melhores práticas.',
          cardMonitoringTitle: 'Monitoramento',
          cardMonitoringDesc:
            'Setup completo de observabilidade com OpenTelemetry, dashboards e alertas inteligentes.',
        },
        sponsors: {
          title: 'Apoie a Tooark',
          desc: 'Se as ferramentas da Tooark te ajudam no dia a dia, considere apoiar o desenvolvimento. Toda contribuição mantém o ecossistema open source vivo.',
          githubDesc: 'Apoio recorrente ou único diretamente pelo GitHub.',
          githubCta: 'Patrocinar',
          kofiDesc: 'Pague um café para apoiar o desenvolvimento dos projetos.',
          kofiCta: 'Pagar um café',
          paypalDesc: 'Doação única de qualquer valor via PayPal.',
          paypalCta: 'Doar',
        },
        footer: {
          tagline:
            'Ferramentas open source que aceleram o dia a dia de desenvolvedores e equipes DevOps.',
          rights: 'Todos os direitos reservados.',
        },
        common: {
          showMore: 'Mostrar mais',
          seeAll: 'Ver todos ->',
          visibilityPublic: 'Público',
        },
        errors: {
          projectsLoad: 'Não foi possível carregar os projetos.',
          packagesLoad: 'Não foi possível carregar os pacotes.',
          extensionsLoad: 'Não foi possível carregar as extensões.',
        },
      },
      en: {
        meta: {
          title: 'Tooark - Tools for Developers and DevOps',
          description:
            'Open source tools that speed up the daily work of software developers and DevOps teams. .NET and Node libraries, VS Code extensions, Docker images and CI/CD templates.',
          ogTitle: 'Tooark - Tools for Developers and DevOps',
          ogDescription:
            'Open source tools that speed up the daily work of software developers and DevOps teams.',
          twitterTitle: 'Tooark - Tools for Developers and DevOps',
          twitterDescription:
            'Open source tools that speed up the daily work of software developers and DevOps teams.',
          ogImageAlt: 'Tooark — open source tools for developers and DevOps',
        },
        header: {
          homeAria: 'Tooark Home',
          openMenu: 'Open menu',
          closeMenu: 'Close menu',
          languageSelector: 'Select language',
          projects: 'Projects',
          packages: 'Packages',
          contributors: 'Contributors',
          categories: 'Categories',
          services: 'Services',
          sponsors: 'Sponsor',
        },
        hero: {
          subtitle:
            'Tools created by enthusiasts to help <strong>Software Developers</strong> and <strong>DevOps</strong>',
          ctaProjects: 'View Projects',
          statsRepos: 'Repositories',
          statsLanguages: 'Languages',
          shapeSequence: 'Tooark|Open Source|Tools|DevOps|Code|#infinity 50',
        },
        projects: {
          title: 'Open Source Projects',
          desc: 'Open source projects built to solve real everyday development and operations challenges.',
          searchPlaceholder: 'Search projects by name or description',
          searchAria: 'Search projects',
          filterAll: 'All',
          filterOthers: 'Others',
          loading: 'Loading projects...',
          empty: 'No projects found for the current filters.',
        },
        packages: {
          title: 'Packages',
          desc: 'Libraries published in package registries for direct use in your applications.',
          nugetTitle: '.NET Packages',
          npmTitle: 'JavaScript / TypeScript Packages',
          githubTitle: 'Packages published on GitHub',
          githubMeta:
            'Packages and artifacts published in the organization GitHub Packages registry.',
          githubCardTitle: 'Tooark GitHub Packages',
          githubCardDesc:
            'Access packages published directly on GitHub, including artifacts distributed by the organization.',
          extensionsTitle: 'VS Code and Open VSX Extensions',
          metaExtensions: 'extensions',
          installsLabel: 'installs',
          ghpkgDesc:
            'Container image published in the organization GitHub Packages registry.',
          metaImages: 'container images',
          seeInGithub: 'View on GitHub',
          seeInMarketplace: 'View on Marketplace',
          searchPlaceholder: 'Search packages by name or description',
          nugetSearchAria: 'Search NuGet packages',
          npmSearchAria: 'Search npm packages',
          sortAria: 'Sort packages',
          sortDownloads: 'Downloads',
          sortName: 'Name',
          loading: 'Loading packages...',
          empty: 'No packages found for your search.',
          metaPackages: 'packages',
          metaDownloads: 'downloads',
          metaDownloadsPerMonth: 'downloads/month',
          seeInNuget: 'View on NuGet',
          seeInNpm: 'View on npm',
          noDescription: 'No description available.',
          downloadsLabel: 'downloads',
          npmFallbackTags: 'JavaScript / TypeScript',
        },
        contributors: {
          title: 'Contributors',
          desc: 'People helping build and evolve Tooark open source projects.',
        },
        categories: {
          title: 'What we build',
          desc: 'Our tools are organized by category to help you find the right solution for your project.',
          cardLibrariesTitle: 'Libraries',
          cardLibrariesDesc:
            'Reusable packages and libraries in C#, Node.js and JavaScript to speed up development.',
          cardCiCdTitle: 'CI/CD & DevOps',
          cardCiCdDesc:
            'Templates and actions for GitLab CI and GitHub Actions - SonarQube, Trivy, notifications and more.',
          cardObservabilityTitle: 'Observability',
          cardObservabilityDesc:
            'Preconfigured OpenTelemetry solutions for monitoring web and backend applications.',
          cardInfraTitle: 'Infrastructure',
          cardInfraDesc:
            'Terraform modules for AWS and GCP, base Docker images and terminal configurations.',
        },
        services: {
          title: 'Services',
          soon: 'Coming soon',
          desc: 'We are preparing professional services to take your operations to the next level.',
          cardConsultingTitle: 'DevOps Consulting',
          cardConsultingDesc:
            'CI/CD pipelines, containerization and infrastructure automation implementation.',
          cardSecurityTitle: 'Security & Compliance',
          cardSecurityDesc:
            'Vulnerability analysis, quality gates and code compliance with best practices.',
          cardMonitoringTitle: 'Monitoring',
          cardMonitoringDesc:
            'Complete observability setup with OpenTelemetry, dashboards and smart alerts.',
        },
        sponsors: {
          title: 'Sponsor Tooark',
          desc: 'If Tooark tools help you in your daily work, consider supporting the development. Every contribution keeps the open source ecosystem alive.',
          githubDesc: 'Recurring or one-time support directly through GitHub.',
          githubCta: 'Sponsor',
          kofiDesc: 'Buy a coffee to support the development of the projects.',
          kofiCta: 'Buy a coffee',
          paypalDesc: 'One-time donation of any amount via PayPal.',
          paypalCta: 'Donate',
        },
        footer: {
          tagline:
            'Open source tools that speed up the daily work of developers and DevOps teams.',
          rights: 'All rights reserved.',
        },
        common: {
          showMore: 'Show more',
          seeAll: 'See all ->',
          visibilityPublic: 'Public',
        },
        errors: {
          projectsLoad: 'Could not load projects.',
          packagesLoad: 'Could not load packages.',
          extensionsLoad: 'Could not load extensions.',
        },
      },
    },
  };
})();
