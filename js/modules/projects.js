/* ============================================
   Tooark — Projetos Open Source (GitHub API)
   ============================================ */

import {
  GITHUB_API,
  ORG,
  REPO_HIDE,
  LANG_COLORS,
  TOPIC_HIDE,
  MAX_TAG_FILTERS,
  MAX_CARD_TAGS,
  INITIAL_PROJECTS,
  PROJECTS_STEP,
} from './config.js';
import { t, formatNumberByLocale, onLocaleChange } from './locale.js';
import { normalizeText } from './utils.js';
import { initReveal } from './reveal.js';

/** @type {{ all: any[]; filtered: any[]; visibleCount: number; activeTag: string; searchTerm: string; topTopics: string[]; }} */
var projectsState = {
  all: [],
  filtered: [],
  visibleCount: INITIAL_PROJECTS,
  activeTag: 'all',
  searchTerm: '',
  topTopics: [],
};

/**
 * @param {string} language
 */
function getLanguageColor(language) {
  // Retorna a cor associada à linguagem de programação, ou uma cor padrão se a linguagem não estiver definida
  if (Object.prototype.hasOwnProperty.call(LANG_COLORS, language)) {
    return LANG_COLORS[/** @type {keyof typeof LANG_COLORS} */ (language)];
  }

  return '#00B050';
}

// ---- Setup controls -----------
function setupProjectControls() {
  var searchInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('projectSearch')
  );
  var showMoreBtn = document.getElementById('projectsShowMore');

  // Verifica se o elemento de busca existe e ainda não tem um listener de input vinculado, para evitar múltiplos listeners
  if (searchInput && searchInput.dataset.bound !== 'true') {
    var safeSearchInput = searchInput;

    searchInput.addEventListener('input', function () {
      projectsState.searchTerm = normalizeText(safeSearchInput.value);
      projectsState.visibleCount = INITIAL_PROJECTS;
      renderProjects();
    });
    searchInput.dataset.bound = 'true';
  }

  // Verifica se o botão de mostrar mais existe e ainda não tem um listener de clique vinculado, para evitar múltiplos listeners
  if (showMoreBtn && showMoreBtn.dataset.bound !== 'true') {
    showMoreBtn.addEventListener('click', function () {
      projectsState.visibleCount += PROJECTS_STEP;
      renderProjects();
    });
    showMoreBtn.dataset.bound = 'true';
  }
}

// ---- Fetch repos --------------
/**
 * @returns {Promise<any[]>}
 */
async function fetchRepos() {
  /** @type {any[]} */
  var repos = [];
  var page = 1;
  var perPage = 100;
  var hasNextPage = true;

  // Realiza requisições paginadas para a API do GitHub
  while (hasNextPage) {
    var response = await fetch(
      GITHUB_API +
        '/orgs/' +
        ORG +
        '/repos?per_page=' +
        perPage +
        '&page=' +
        page +
        '&sort=updated&type=public',
    );

    // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
    if (!response.ok) {
      throw new Error('Falha ao carregar repositórios');
    }

    /** @type {any[]} */
    var currentPageRepos = await response.json();
    repos = repos.concat(currentPageRepos);

    hasNextPage = currentPageRepos.length === perPage;
    page += 1;
  }

  return repos;
}

// ---- Get topics for repo ------
/**
 * Retorna os topics (tags) do repositório no GitHub, sem os topics genéricos ocultados
 * @param {{ topics?: string[]; }} repo
 * @returns {string[]}
 */
function getRepoTopics(repo) {
  var topics = Array.isArray(repo.topics) ? repo.topics : [];

  return topics.filter(function (topic) {
    return TOPIC_HIDE.indexOf(topic) === -1;
  });
}

// ---- Render project card ------
/**
 * @param {{
 *  html_url: string;
 *  name: string;
 *  language: string;
 *  stargazers_count: number;
 *  open_issues_count: number;
 *  forks_count: number;
 *  license: { spdx_id: string; };
 *  description: any;
 *  topics?: string[];
 * }} repo
 */
function createProjectCard(repo) {
  var card = document.createElement('a');
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'project-card';

  var langDot = '';
  // Verifica se a linguagem do repositório está disponível
  if (repo.language) {
    var color = getLanguageColor(repo.language);
    langDot =
      '<span class="project-card__meta-item">' +
      '<span class="project-card__lang-dot" style="background:' +
      color +
      '"></span>' +
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

  var forksHtml = '';
  // Verifica se o repositório possui forks
  if (repo.forks_count > 0) {
    forksHtml =
      '<span class="project-card__meta-item">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="6" cy="6" r="3"/>' +
      '<circle cx="18" cy="18" r="3"/>' +
      '<circle cx="18" cy="6" r="3"/>' +
      '<path d="M9 6h6"/>' +
      '<path d="M9 8c0 5 6 3 6 7"/>' +
      '</svg>' +
      repo.forks_count +
      '</span>';
  }

  var licenseHtml = '';
  // Verifica se o repositório tem uma licença válida
  if (
    repo.license &&
    repo.license.spdx_id &&
    repo.license.spdx_id !== 'NOASSERTION'
  ) {
    licenseHtml =
      '<span class="project-card__meta-item">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
      '</svg>' +
      repo.license.spdx_id +
      '</span>';
  }

  var tagsHtml = '';
  var topics = getRepoTopics(repo).slice(0, MAX_CARD_TAGS);
  // Exibe as tags (topics) do repositório como chips no card, quando disponíveis
  if (topics.length > 0) {
    tagsHtml =
      '<div class="project-card__tags">' +
      topics
        .map(function (topic) {
          return '<span class="project-card__tag">' + topic + '</span>';
        })
        .join('') +
      '</div>';
  }

  card.innerHTML =
    '<div class="project-card__header">' +
    '<span class="project-card__name">' +
    repo.name +
    '</span>' +
    '<span class="project-card__visibility">' +
    t('common.visibilityPublic') +
    '</span>' +
    '</div>' +
    '<p class="project-card__desc">' +
    (repo.description || t('packages.noDescription')) +
    '</p>' +
    tagsHtml +
    '<div class="project-card__meta">' +
    langDot +
    starsHtml +
    issuesHtml +
    forksHtml +
    licenseHtml +
    '</div>';

  return card;
}

// ---- Render filters -----------
/**
 * @param {any[]} repos
 */
function renderFilters(repos) {
  var filtersContainer = document.getElementById('projectFilters');
  var topicCounts = /** @type {Record<string, number>} */ ({});

  // Verifica se o container de filtros existe antes de tentar renderizar os filtros
  if (!filtersContainer) {
    return;
  }

  // Itera sobre os repositórios para contar a frequência de cada topic (tag) presente nos dados
  repos.forEach(function (repo) {
    getRepoTopics(repo).forEach(function (topic) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  // Seleciona os topics com mais projetos, ordenados por frequência e nome, limitados a MAX_TAG_FILTERS
  var topics = Object.keys(topicCounts)
    .sort(function (a, b) {
      if (topicCounts[b] !== topicCounts[a]) {
        return topicCounts[b] - topicCounts[a];
      }

      return a.localeCompare(b);
    })
    .slice(0, MAX_TAG_FILTERS);

  projectsState.topTopics = topics;

  // Verifica se existe algum repositório fora dos topics do topo, para exibir a opção "Outros"
  var hasOthers = repos.some(function (repo) {
    return getRepoTopics(repo).every(function (topic) {
      return topics.indexOf(topic) === -1;
    });
  });

  var tags = ['all'].concat(topics);
  if (hasOthers) {
    tags.push('others');
  }

  // Se o topic ativo saiu da lista (ex: dados recarregados), volta para "Todos"
  if (tags.indexOf(projectsState.activeTag) === -1) {
    projectsState.activeTag = 'all';
  }
  var safeFiltersContainer = filtersContainer;
  safeFiltersContainer.innerHTML = '';

  tags.forEach(function (tag) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.dataset.filter = tag;
    btn.textContent =
      tag === 'all'
        ? t('projects.filterAll')
        : tag === 'others'
          ? t('projects.filterOthers')
          : tag;

    if (tag === projectsState.activeTag) {
      btn.classList.add('active');
    }

    safeFiltersContainer.appendChild(btn);
  });

  // Verifica se o container de filtros existe antes de adicionar o listener de clique
  if (safeFiltersContainer.dataset.bound !== 'true') {
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
      if (!filter) {
        return;
      }

      projectsState.activeTag = filter;
      projectsState.visibleCount = INITIAL_PROJECTS;
      renderProjects();
    });

    safeFiltersContainer.dataset.bound = 'true';
  }
}

// ---- Render projects ----------
function renderProjects() {
  var grid = document.getElementById('projectsGrid');
  var showMoreBtn = document.getElementById('projectsShowMore');
  var filtersContainer = document.getElementById('projectFilters');

  if (!grid) {
    return;
  }

  var activeTag = projectsState.activeTag;
  var searchTerm = projectsState.searchTerm;
  projectsState.filtered = projectsState.all.filter(function (repo) {
    var topics = getRepoTopics(repo);
    var name = normalizeText(repo.name);
    var description = normalizeText(repo.description);
    var topicsText = normalizeText(topics.join(' '));
    // "Outros" agrupa os repositórios sem nenhum topic entre os mais frequentes exibidos no filtro
    var tagMatch =
      activeTag === 'all' ||
      (activeTag === 'others'
        ? topics.every(function (topic) {
            return projectsState.topTopics.indexOf(topic) === -1;
          })
        : topics.indexOf(activeTag) !== -1);
    var searchMatch =
      searchTerm === '' ||
      name.indexOf(searchTerm) !== -1 ||
      description.indexOf(searchTerm) !== -1 ||
      topicsText.indexOf(searchTerm) !== -1;

    return tagMatch && searchMatch;
  });

  grid.innerHTML = '';

  var visibleRepos = projectsState.filtered.slice(
    0,
    projectsState.visibleCount,
  );

  if (visibleRepos.length === 0) {
    grid.innerHTML =
      '<div class="projects__loading">' +
      '<p>' +
      t('projects.empty') +
      '</p>' +
      '</div>';
  } else {
    visibleRepos.forEach(function (repo) {
      grid.appendChild(createProjectCard(repo));
    });

    initReveal();
  }

  if (showMoreBtn) {
    var remaining = projectsState.filtered.length - visibleRepos.length;
    showMoreBtn.hidden = remaining <= 0;
    showMoreBtn.textContent =
      remaining > 0
        ? t('common.showMore') + ' (' + remaining + ')'
        : t('common.showMore');
  }

  if (filtersContainer) {
    filtersContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
      var btnEl = /** @type {HTMLElement} */ (btn);
      btnEl.classList.toggle('active', btnEl.dataset.filter === activeTag);
    });
  }
}

// ---- Update stats -------------
/**
 * @param {{ stargazers_count: number; language: string | null; }[]} repos
 */
function updateStats(repos) {
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
    statRepos.textContent = formatNumberByLocale(repos.length);
  }

  var statStars = document.getElementById('statStars');
  // Verifica se o elemento de estatísticas de estrelas existe antes de tentar definir seu conteúdo
  if (statStars) {
    statStars.textContent = formatNumberByLocale(totalStars);
  }

  var statLanguages = document.getElementById('statLanguages');
  // Verifica se o elemento de estatísticas de linguagens existe antes de tentar definir seu conteúdo
  if (statLanguages) {
    statLanguages.textContent = formatNumberByLocale(
      Object.keys(languages).length,
    );
  }
}

// Re-renderiza a seção quando o idioma muda
onLocaleChange(function () {
  updateStats(projectsState.all);
  renderFilters(projectsState.all);
  renderProjects();
});

// ---- Init ---------------------
export async function initProjects() {
  try {
    setupProjectControls();

    var repos = await fetchRepos();

    // Filtra os repositórios para excluir os repositórios do site
    repos = repos.filter(function (/** @type {{ name: string; }} */ r) {
      return !REPO_HIDE.includes(r.name);
    });

    // Ordena os repositórios primeiro por número de estrelas (stargazers_count) em ordem decrescente,
    // e em caso de empate, ordena por data de atualização (updated_at) também em ordem decrescente
    repos.sort(
      function (
        /** @type {{ stargazers_count: number; updated_at: string | number | Date; }} */ a,
        /** @type {{ stargazers_count: number; updated_at: string | number | Date; }} */ b,
      ) {
        // Compara o número de estrelas dos repositórios, colocando os mais populares primeiro
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }

        // Em caso de empate, compara a data de atualização, colocando os mais recentes primeiro
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      },
    );

    updateStats(repos);
    projectsState.all = repos;
    projectsState.visibleCount = INITIAL_PROJECTS;
    renderFilters(repos);
    renderProjects();
  } catch (err) {
    var grid = document.getElementById('projectsGrid');

    // Verifica se o elemento do grid de projetos existe antes de tentar exibir a mensagem de erro
    if (grid) {
      grid.innerHTML =
        '<div class="projects__loading">' +
        '<p>' +
        t('errors.projectsLoad') +
        ' ' +
        '<a href="https://github.com/' +
        ORG +
        '" target="_blank" rel="noopener noreferrer" class="inline-link">' +
        'GitHub' +
        '</a>' +
        '</p>' +
        '</div>';
    }
  }
}
