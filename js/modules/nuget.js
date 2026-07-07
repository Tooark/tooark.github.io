/* ============================================
   Tooark — Pacotes .NET (NuGet Search API)
   ============================================ */

import { NUGET_API, ORG, INITIAL_PACKAGES, PACKAGES_STEP } from './config.js';
import { t, formatDownloads, getLocaleTag, onLocaleChange } from './locale.js';
import { normalizeText } from './utils.js';
import { initReveal } from './reveal.js';

/** @type {{ all: any[]; filtered: any[]; visibleCount: number; searchTerm: string; sortBy: 'downloads' | 'name'; }} */
var packagesState = {
  all: [],
  filtered: [],
  visibleCount: INITIAL_PACKAGES,
  searchTerm: '',
  sortBy: 'downloads',
};

// ---- Setup package controls ---
function setupPackageControls() {
  var sortSelect = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('nugetSort')
  );

  // Ordenação NuGet
  if (sortSelect && sortSelect.dataset.bound !== 'true') {
    sortSelect.addEventListener('change', function () {
      if (sortSelect) {
        packagesState.sortBy =
          sortSelect.value === 'name' ? 'name' : 'downloads';
        renderPackages();
      }
    });
    sortSelect.dataset.bound = 'true';
  }
  var searchInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('nugetSearch')
  );
  var showMoreBtn = document.getElementById('nugetShowMore');

  // Verifica se o elemento de busca existe e ainda não tem um listener de input vinculado, para evitar múltiplos listeners
  if (searchInput && searchInput.dataset.bound !== 'true') {
    var safeSearchInput = searchInput;

    searchInput.addEventListener('input', function () {
      packagesState.searchTerm = normalizeText(safeSearchInput.value);
      packagesState.visibleCount = INITIAL_PACKAGES;
      renderPackages();
    });
    searchInput.dataset.bound = 'true';
  }

  // Verifica se o botão de mostrar mais existe e ainda não tem um listener de clique vinculado, para evitar múltiplos listeners
  if (showMoreBtn && showMoreBtn.dataset.bound !== 'true') {
    showMoreBtn.addEventListener('click', function () {
      packagesState.visibleCount += PACKAGES_STEP;
      renderPackages();
    });
    showMoreBtn.dataset.bound = 'true';
  }
}

// ---- Fetch NuGet packages -----
/**
 * @returns {Promise<{ data: any[]; totalHits: number }>}
 */
async function fetchNugetPackages() {
  var take = 50;
  var skip = 0;
  var totalHits = Number.POSITIVE_INFINITY;
  /** @type {any[]} */
  var allPackages = [];

  // Realiza requisições paginadas para a API do NuGet
  while (allPackages.length < totalHits) {
    var response = await fetch(
      NUGET_API +
        '?q=owner:' +
        ORG +
        '&take=' +
        take +
        '&skip=' +
        skip +
        '&prerelease=false',
    );

    // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
    if (!response.ok) {
      throw new Error('Falha ao carregar pacotes NuGet');
    }

    var pageData = await response.json();
    var currentPagePackages = Array.isArray(pageData.data) ? pageData.data : [];
    totalHits =
      typeof pageData.totalHits === 'number'
        ? pageData.totalHits
        : allPackages.length + currentPagePackages.length;

    allPackages = allPackages.concat(currentPagePackages);

    // Se vier menos itens que o tamanho da página, não há mais páginas para buscar
    if (currentPagePackages.length < take) {
      break;
    }

    skip += take;
  }

  return {
    data: allPackages,
    totalHits: allPackages.length,
  };
}

// ---- Create package card ------
/**
 * @param {{ id: string; totalDownloads: number; version: string; description: any; }} pkg
 */
function createPackageCard(pkg) {
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
    formatDownloads(pkg.totalDownloads) +
    ' ' +
    t('packages.downloadsLabel') +
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
    '<span class="package-card__name">' +
    pkg.id +
    '</span>' +
    '<span class="package-card__version">v' +
    pkg.version +
    '</span>' +
    '</div>' +
    '<p class="package-card__desc">' +
    (pkg.description || t('packages.noDescription')) +
    '</p>' +
    '<div class="package-card__meta">' +
    downloadsHtml +
    frameworkHtml +
    '</div>';

  return card;
}

// ---- Update NuGet meta --------
function updateNugetMeta() {
  var meta = document.getElementById('nugetMeta');

  // Verifica se o elemento de meta existe e há pacotes carregados antes de tentar definir seu conteúdo
  if (!meta || packagesState.all.length === 0) {
    return;
  }

  // Calcula o total de downloads somando os downloads de cada pacote
  var totalDownloads = packagesState.all.reduce(function (
    /** @type {number} */ sum,
    /** @type {{ totalDownloads: number; }} */ p,
  ) {
    return sum + p.totalDownloads;
  }, 0);

  meta.textContent =
    packagesState.all.length +
    ' ' +
    t('packages.metaPackages') +
    ' · ' +
    formatDownloads(totalDownloads) +
    ' ' +
    t('packages.metaDownloads');
}

// ---- Render packages ----------
function renderPackages() {
  var grid = document.getElementById('nugetGrid');
  var showMoreBtn = document.getElementById('nugetShowMore');

  // Verifica se o elemento do grid existe antes de tentar renderizar os pacotes
  if (!grid) {
    return;
  }

  var searchTerm = packagesState.searchTerm;

  packagesState.filtered = packagesState.all.filter(function (pkg) {
    var name = normalizeText(pkg.id);
    var description = normalizeText(pkg.description);
    return (
      searchTerm === '' ||
      name.indexOf(searchTerm) !== -1 ||
      description.indexOf(searchTerm) !== -1
    );
  });

  // Ordenação dinâmica
  if (packagesState.sortBy === 'name') {
    packagesState.filtered.sort(function (a, b) {
      return a.id.localeCompare(b.id, getLocaleTag(), { sensitivity: 'base' });
    });
  } else {
    packagesState.filtered.sort(function (a, b) {
      return (b.totalDownloads || 0) - (a.totalDownloads || 0);
    });
  }

  grid.innerHTML = '';

  var visiblePackages = packagesState.filtered.slice(
    0,
    packagesState.visibleCount > 0
      ? packagesState.visibleCount
      : INITIAL_PACKAGES,
  );

  // Verifica se há pacotes visíveis para renderizar, caso contrário, exibe uma mensagem indicando que nenhum pacote foi encontrado para a busca atual
  if (visiblePackages.length === 0) {
    grid.innerHTML =
      '<div class="packages__loading">' +
      '<p>' +
      t('packages.empty') +
      '</p>' +
      '</div>';
  } else {
    visiblePackages.forEach(function (pkg) {
      grid.appendChild(createPackageCard(pkg));
    });

    initReveal();
  }

  // Verifica se o botão de mostrar mais existe antes de tentar atualizar sua visibilidade e texto
  if (showMoreBtn) {
    var remaining = packagesState.filtered.length - visiblePackages.length;
    showMoreBtn.hidden = remaining <= 0;
    showMoreBtn.textContent =
      remaining > 0
        ? t('common.showMore') + ' (' + remaining + ')'
        : t('common.showMore');
  }
}

// Re-renderiza a seção quando o idioma muda
onLocaleChange(function () {
  renderPackages();
  updateNugetMeta();
});

// ---- Init NuGet packages ------
export async function initNuget() {
  try {
    setupPackageControls();

    var data = await fetchNugetPackages();
    var packages = data.data || [];

    // Ordena os pacotes por total de downloads (ordem decrescente) para destacar os mais populares
    packages.sort(
      function (
        /** @type {{ totalDownloads: number; }} */ a,
        /** @type {{ totalDownloads: number; }} */ b,
      ) {
        return b.totalDownloads - a.totalDownloads;
      },
    );

    packagesState.all = packages;
    packagesState.visibleCount = INITIAL_PACKAGES;
    renderPackages();
    updateNugetMeta();
  } catch (err) {
    var grid = document.getElementById('nugetGrid');

    // Verifica se o elemento do grid existe antes de tentar exibir a mensagem de erro
    if (grid) {
      grid.innerHTML =
        '<div class="packages__loading">' +
        '<p>' +
        t('errors.packagesLoad') +
        ' ' +
        '<a href="https://www.nuget.org/profiles/' +
        ORG +
        '" target="_blank" rel="noopener noreferrer" class="inline-link">' +
        t('packages.seeInNuget') +
        '</a>' +
        '</p>' +
        '</div>';
    }
  }
}
