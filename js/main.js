/* ============================================
   Tooark — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  const ORG = 'Tooark';
  const API = 'https://api.github.com';
  const SITE_REPO = 'tooark.github.io';
  const NUGET_API = 'https://azuresearch-usnc.nuget.org/query';

  // Language colors (GitHub style)
  const LANG_COLORS = {
    'C#': '#6C1579',
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
    'Shell': '#243850',
    'HCL': '#7B42BC',
    'Dockerfile': '#2496ED',
    'HTML': '#FF4E1D',
    'CSS': '#3C9CD7',
    'Python': '#FECF40',
    'Go': '#00ACD7',
  };

  // Category mapping
  const CATEGORIES = {
    'Bibliotecas': [
      'tooark',
      'eslint',
      'tooark-observability-nodejs',
      'tooark-observability-web'
    ],
    'CI/CD': [
      'sonarqube-template-include',
      'trivy-summary-include',
      'trivy-summary-action',
      'notification-trigger-url-include',
      'notification-trigger-url-action'
    ],
    'Infra': [
      'terraform-aws-gcp-modules',
      'base-images'
    ],
    'Ferramentas': [
      'custom-terminal'
    ],
  };

  // ---- Functions ----------------

  /**
   * @param {string} language
   */
  function getLanguageColor (language) {
    // Retorna a cor associada à linguagem de programação, ou uma cor padrão se a linguagem não estiver definida
    if (Object.prototype.hasOwnProperty.call(LANG_COLORS, language)) {
      return LANG_COLORS[/** @type {keyof typeof LANG_COLORS} */ (language)];
    }

    return '#00B050';
  }

  // ---- Header scroll ------------
  const header = document.getElementById('header');

  // Verifica se o elemento do header existe antes de adicionar o listener de scroll
  if (header) {
    // Adiciona um listener de scroll para alterar a classe do header com base na posição de rolagem
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;

      // Adiciona ou remove a classe com base na posição de rolagem
      if (scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

    }, { passive: true });
  }

  // ---- Mobile nav toggle --------
  const nav = document.getElementById('nav');
  const navClose = document.getElementById('navClose');
  const navToggle = document.getElementById('navToggle');

  // Verifica se os elementos de navegação e toggle existem antes de adicionar o listener de clique
  if (nav && navToggle) {
    var navEl = nav;
    var navToggleEl = navToggle;

    // Função para fechar o menu móvel
    function closeMobileMenu () {
      navEl.classList.remove('open');
      navToggleEl.classList.remove('active');
      navToggleEl.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Adiciona um listener de clique para alternar a visibilidade da navegação móvel
    navToggleEl.addEventListener('click', function () {
      const isOpen = navEl.classList.toggle('open');

      navToggleEl.classList.toggle('active');
      navToggleEl.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Verifica se o elemento de fechamento da navegação existe
    if (navClose) {
      navClose.addEventListener('click', closeMobileMenu);
    }

    // Navegação móvel, fecha o menu ao clicar em um link
    nav.querySelectorAll('.header__link').forEach(function (link) {
      // Adiciona um listener de clique para cada link de navegação para fechar o menu móvel
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });
  }

  // ---- Year ---------------------
  const year = document.getElementById('year');

  // Verifica se o elemento do ano existe antes de definir seu conteúdo
  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }

  // ---- Scroll reveal ------------
  // Função para inicializar o efeito de revelação ao rolar a página
  function initReveal () {
    var classNames = '.project-card, .category-card, .service-card, .package-card, .contributor-card';
    var elements = document.querySelectorAll(classNames);

    // Adiciona a classe 'reveal' a todos os elementos que devem ter o efeito de revelação
    elements.forEach(function (el) { el.classList.add('reveal'); });

    // Cria um IntersectionObserver para observar quando os elementos entram na viewport e adicionar a classe 'visible' para ativar a animação de revelação
    var observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {
        // Verifica se o elemento está intersectando a viewport (ou seja, visível para o usuário)
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // ---- Format download count ----
  /**
   * @param {number} count
   */
  function formatDownloads (count) {
    // Formata o número de downloads em uma forma mais legível (ex: 1.2k, 3.4M)
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
    }

    // Formata o número de downloads em uma forma mais legível (ex: 1.2k, 3.4M)
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }

    return count.toLocaleString('pt-BR');
  }

  // ---- Fetch NuGet packages -----
  async function fetchNugetPackages () {
    var response = await fetch(NUGET_API + '?q=owner:' + ORG + '&take=50&prerelease=false');

    // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
    if (!response.ok) {
      throw new Error('Falha ao carregar pacotes NuGet');
    }

    return response.json();
  }

  // ---- Create package card ------
  /**
   * @param {{ id: string; totalDownloads: number; version: string; description: any; }} pkg
   */
  function createPackageCard (pkg) {
    var card = document.createElement('a');
    card.href = 'https://www.nuget.org/packages/' + pkg.id;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'package-card';

    var downloadsHtml =
      '<span class="package-card__meta-item">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<polyline points="7 10 12 15 17 10"/>' +
      '<line x1="12" y1="15" x2="12" y2="3"/>' +
      '</svg>' +
      formatDownloads(pkg.totalDownloads) + ' downloads' +
      '</span>';

    var frameworkHtml =
      '<span class="package-card__meta-item">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<rect x="2" y="3" width="20" height="14" rx="2"/>' +
      '<line x1="8" y1="21" x2="16" y2="21"/>' +
      '<line x1="12" y1="17" x2="12" y2="21"/>' +
      '</svg>' +
      '.NET 8.0+' +
      '</span>';

    card.innerHTML =
      '<div class="package-card__header">' +
      '<span class="package-card__name">' + pkg.id + '</span>' +
      '<span class="package-card__version">v' + pkg.version + '</span>' +
      '</div>' +
      '<p class="package-card__desc">' + (pkg.description || 'Sem descrição disponível.') + '</p>' +
      '<div class="package-card__meta">' + downloadsHtml + frameworkHtml + '</div>';

    return card;
  }

  // ---- Init NuGet packages ------
  async function initNuget () {
    try {
      var data = await fetchNugetPackages();
      var packages = data.data || [];

      // Ordena os pacotes por título (ordem alfabética) para garantir uma apresentação consistente
      packages.sort(function (/** @type {{ title: string; }} */ a, /** @type {{ title: string; }} */ b) {
        return a.title.localeCompare(b.title);
      });

      var grid = document.getElementById('nugetGrid');

      // Verifica se o elemento do grid existe antes de tentar renderizar os pacotes
      if (grid) {
        grid.innerHTML = '';

        // Itera sobre os pacotes e cria um card para cada um, adicionando-os ao grid
        packages.forEach(function (/** @type {{ id: string; totalDownloads: number; version: string; description: any; }} */ pkg) {
          // @ts-ignore
          grid.appendChild(createPackageCard(pkg));
        });
      }

      // Calcula o total de downloads somando os downloads de cada pacote
      var totalDownloads = packages.reduce(function (/** @type {number} */ sum, /** @type {{ totalDownloads: number; }} */ p) {
        return sum + p.totalDownloads;
      }, 0);

      var meta = document.getElementById('nugetMeta');

      // Verifica se o elemento de meta existe antes de tentar definir seu conteúdo
      if (meta) {
        meta.textContent = packages.length + ' pacotes · ' + formatDownloads(totalDownloads) + ' downloads';
      }

      initReveal();
    } catch (err) {
      var grid = document.getElementById('nugetGrid');

      // Verifica se o elemento do grid existe antes de tentar exibir a mensagem de erro
      if (grid) {
        grid.innerHTML =
          '<div class="packages__loading">' +
          '<p>' +
          'Não foi possível carregar os pacotes. ' +
          '<a href="https://www.nuget.org/profiles/' + ORG + '" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary)">' +
          'Veja no NuGet' +
          '</a>' +
          '</p>' +
          '</div>';
      }
    }
  }

  // ---- Fetch repos --------------
  async function fetchRepos () {
    var response = await fetch(API + '/orgs/' + ORG + '/repos?per_page=100&sort=updated&type=public');

    // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
    if (!response.ok) {
      throw new Error('Falha ao carregar repositórios');
    }

    return response.json();
  }

  // ---- Get category for repo ----
  /**
   * @param {any} repoName
   */
  function getCategory (repoName) {
    var categories = /** @type {(keyof typeof CATEGORIES)[]} */ (Object.keys(CATEGORIES));

    // Itera sobre as categorias definidas
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];

      // Verifica se o nome do repositório está presente na lista de repositórios da categoria atual
      if (CATEGORIES[cat].indexOf(repoName) !== -1) {
        return cat;
      }
    }

    return 'Outros';
  }

  // ---- Render project card ------
  /**
   * @param {{ 
   *  html_url: string;
   *  name: string;
   *  language: string;
   *  stargazers_count: number;
   *  open_issues_count: number;
   *  license: { spdx_id: string; };
   *  description: any;
   * }} repo
   */
  function createProjectCard (repo) {
    var card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'project-card';
    card.dataset.category = getCategory(repo.name);

    var langDot = '';
    // Verifica se a linguagem do repositório está disponível
    if (repo.language) {
      var color = getLanguageColor(repo.language);
      langDot =
        '<span class="project-card__meta-item">' +
        '<span class="project-card__lang-dot" style="background:' + color + '"></span>' +
        repo.language +
        '</span>';
    }

    var starsHtml = '';
    // Verifica se o repositório tem estrelas (stargazers)
    if (repo.stargazers_count > 0) {
      starsHtml =
        '<span class="project-card__meta-item">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M12 .587l3.668 7.568L24 9.306l-6 5.847 1.417 8.26L12 19.467l-7.417 3.946L6 15.153 0 9.306l8.332-1.151z"/>' +
        '</svg>' +
        repo.stargazers_count +
        '</span>';
    }

    var issuesHtml = '';
    // Verifica se o repositório tem issues abertas
    if (repo.open_issues_count > 0) {
      issuesHtml =
        '<span class="project-card__meta-item">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="8" x2="12" y2="12"/>' +
        '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
        '</svg>' +
        repo.open_issues_count +
        '</span>';
    }

    var licenseHtml = '';
    // Verifica se o repositório tem uma licença válida
    if (repo.license && repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION') {
      licenseHtml =
        '<span class="project-card__meta-item">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
        '</svg>' +
        repo.license.spdx_id +
        '</span>';
    }

    card.innerHTML =
      '<div class="project-card__header">' +
      '<span class="project-card__name">' + repo.name + '</span>' +
      '<span class="project-card__visibility">Public</span>' +
      '</div>' +
      '<p class="project-card__desc">' + (repo.description || 'Sem descrição disponível.') + '</p>' +
      '<div class="project-card__meta">' +
      langDot + starsHtml + issuesHtml + licenseHtml +
      '</div>';

    return card;
  }

  // ---- Render filters -----------
  /**
   * @param {any[]} repos
   */
  function renderFilters (repos) {
    var filtersContainer = document.getElementById('projectFilters');
    var categoriesSet = /** @type {Record<string, boolean>} */ ({});

    // Itera sobre os repositórios para coletar as categorias únicas presentes nos dados
    repos.forEach(function (repo) {
      var cat = getCategory(repo.name);
      categoriesSet[cat] = true;
    });

    // Ordena as categorias e cria um botão de filtro para cada uma, adicionando-os ao container de filtros
    var cats = Object.keys(categoriesSet).sort();
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.textContent = cat;

      // Verifica se o container de filtros existe antes de tentar adicionar os botões de filtro
      if (filtersContainer) {
        filtersContainer.appendChild(btn);
      }
    });

    // Verifica se o container de filtros existe antes de adicionar o listener de clique
    if (filtersContainer) {
      var safeFiltersContainer = filtersContainer;

      // Adiciona um listener de clique ao container de filtros para lidar com a lógica de filtragem dos projetos com base na categoria selecionada
      safeFiltersContainer.addEventListener('click', function (e) {
        // Verifica se o elemento clicado é um botão de filtro, caso contrário, ignora o clique
        if (!(e.target instanceof HTMLElement)) {
          return;
        }

        var target = e.target;
        // Verifica se o elemento clicado tem a classe 'filter-btn', caso contrário, ignora o clique
        if (!target.classList.contains('filter-btn')) {
          return;
        }

        var filter = target.dataset.filter;

        // Remove a classe 'active' de todos os botões de filtro e adiciona a classe 'active' ao botão clicado para indicar qual filtro está ativo
        safeFiltersContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
          btn.classList.remove('active');
        });
        target.classList.add('active');

        // Busca todos elementos que tenham a classe 'project-card'
        var cards = document.querySelectorAll('.project-card');
        // Itera sobre os cards de projeto e exibe ou oculta cada card com base no filtro selecionado
        cards.forEach(function (card) {
          var cardEl = /** @type {HTMLElement} */ (card);

          // Verifica se o filtro é 'all' ou se a categoria do card corresponde ao filtro selecionado, e exibe ou oculta o card de acordo 
          if (filter === 'all' || cardEl.dataset.category === filter) {
            cardEl.style.display = '';
            setTimeout(function () { cardEl.classList.add('visible'); }, 10);
          } else {
            cardEl.style.display = 'none';
            cardEl.classList.remove('visible');
          }
        });
      });
    }
  }

  // ---- Update stats -------------
  /**
   * @param {{ forEach: (arg0: (repo: any) => void) => void; length: string | null; }} repos
   */
  function updateStats (repos) {
    var totalStars = 0;
    var languages = /** @type {Record<string, boolean>} */ ({});

    // Itera sobre os repositórios para calcular o total de estrelas
    repos.forEach(function (repo) {
      totalStars += repo.stargazers_count;

      // Verifica se a linguagem do repositório está disponível
      if (repo.language) {
        languages[repo.language] = true;
      }
    });

    var statRepos = document.getElementById('statRepos');
    // Verifica se o elemento de estatísticas de repositórios existe antes de tentar definir seu conteúdo
    if (statRepos) {
      statRepos.textContent = repos.length;
    }

    var statStars = document.getElementById('statStars');
    // Verifica se o elemento de estatísticas de estrelas existe antes de tentar definir seu conteúdo
    if (statStars) {
      statStars.textContent = String(totalStars);
    }

    var statLanguages = document.getElementById('statLanguages');
    // Verifica se o elemento de estatísticas de linguagens existe antes de tentar definir seu conteúdo
    if (statLanguages) {
      statLanguages.textContent = String(Object.keys(languages).length);
    }
  }

  // ---- Init ---------------------
  async function init () {
    try {
      var repos = await fetchRepos();

      // Filtra os repositórios para excluir o repositório do site
      repos = repos.filter(function (/** @type {{ name: string; }} */ r) {
        return r.name !== SITE_REPO;
      });

      // Ordena os repositórios primeiro por número de estrelas (stargazers_count) em ordem decrescente,
      // e em caso de empate, ordena por data de atualização (updated_at) também em ordem decrescente
      repos.sort(function (
        /** @type {{ stargazers_count: number; updated_at: string | number | Date; }} */ a,
        /** @type {{ stargazers_count: number; updated_at: string | number | Date; }} */ b) {
        // Compara o número de estrelas dos repositórios, colocando os mais populares primeiro
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }

        // Em caso de empate, compara a data de atualização, colocando os mais recentes primeiro
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      updateStats(repos);
      renderFilters(repos);

      var grid = document.getElementById('projectsGrid');

      // Verifica se o elemento do grid de projetos existe antes de tentar renderizar os cards de projeto
      if (grid) {
        grid.innerHTML = '';

        // Itera sobre os repositórios e cria um card para cada um, adicionando-os ao grid de projetos
        repos.forEach(function (/** @type {{ html_url: string; name: string; language: string; stargazers_count: number; open_issues_count: number; license: { spdx_id: string; }; description: any; }} */ repo) {
          // @ts-ignore
          grid.appendChild(createProjectCard(repo));
        });
      }

      initReveal();
    } catch (err) {
      var grid = document.getElementById('projectsGrid');

      // Verifica se o elemento do grid de projetos existe antes de tentar exibir a mensagem de erro
      if (grid) {
        grid.innerHTML =
          '<div class="projects__loading">' +
          '<p>' +
          'Não foi possível carregar os projetos. ' +
          '<a href="https://github.com/' + ORG + '" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary)">' +
          'Veja no GitHub' +
          '</a>' +
          '</p>' +
          '</div>';
      }
    }
  }

  init();
  initNuget();
})();
