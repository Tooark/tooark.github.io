/* ============================================
   Tooark — Pacotes JavaScript/TypeScript (npm Registry API)
   ============================================ */

import {
  NPM_API,
  ORG,
  INITIAL_NPM_PACKAGES,
  NPM_PACKAGES_STEP,
} from './config.js';
import { t, formatDownloads, getLocaleTag, onLocaleChange } from './locale.js';
import { normalizeText } from './utils.js';
import { initReveal } from './reveal.js';

/**
 * @typedef {{
 *  name: string;
 *  version: string;
 *  description: string;
 *  keywords: string[];
 *  downloadsMonthly: number;
 *  npmUrl: string;
 * }} NpmFrontendPackage
 */

/**
 * @typedef {{ monthly: number; weekly: number; }} NpmDownloads
 * @typedef {{ email: string; username: string; }} NpmUser
 * @typedef {{ homepage?: string; repository?: string; bugs?: string; npm?: string; }} NpmLinks
 * @typedef {{
 *  name: string;
 *  keywords?: string[];
 *  version: string;
 *  description?: string;
 *  sanitized_name?: string;
 *  publisher?: NpmUser;
 *  maintainers?: NpmUser[];
 *  license?: string;
 *  date?: string;
 *  links?: NpmLinks;
 * }} NpmRegistryPackage
 * @typedef {{
 *  downloads: NpmDownloads;
 *  dependents?: number;
 *  updated?: string;
 *  searchScore?: number;
 *  package: NpmRegistryPackage;
 *  score?: { final?: number; detail?: { popularity?: number; quality?: number; maintenance?: number; }; };
 *  flags?: { insecure?: number; };
 * }} NpmSearchObject
 * @typedef {{ objects: NpmSearchObject[]; total: number; time?: string; }} NpmSearchResponse
 */

/** @type {{ all: NpmFrontendPackage[]; filtered: NpmFrontendPackage[]; visibleCount: number; searchTerm: string; sortBy: 'downloads' | 'name'; }} */
var npmPackagesState = {
  all: [],
  filtered: [],
  visibleCount: INITIAL_NPM_PACKAGES,
  searchTerm: '',
  sortBy: 'downloads',
};

// ---- Setup npm controls ------
function setupNpmControls() {
  var sortSelect = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('npmSort')
  );

  // Ordenação npm
  if (sortSelect && sortSelect.dataset.bound !== 'true') {
    sortSelect.addEventListener('change', function () {
      if (sortSelect) {
        npmPackagesState.sortBy =
          sortSelect.value === 'name' ? 'name' : 'downloads';
        renderNpmPackages();
      }
    });
    sortSelect.dataset.bound = 'true';
  }

  var searchInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('npmSearch')
  );
  var showMoreBtn = document.getElementById('npmShowMore');

  // Verifica se o elemento de busca existe e ainda não tem um listener de input vinculado, para evitar múltiplos listeners
  if (searchInput && searchInput.dataset.bound !== 'true') {
    var safeSearchInput = searchInput;

    searchInput.addEventListener('input', function () {
      npmPackagesState.searchTerm = normalizeText(safeSearchInput.value);
      npmPackagesState.visibleCount = INITIAL_NPM_PACKAGES;
      renderNpmPackages();
    });
    searchInput.dataset.bound = 'true';
  }

  // Verifica se o botão de mostrar mais existe e ainda não tem um listener de clique vinculado, para evitar múltiplos listeners
  if (showMoreBtn && showMoreBtn.dataset.bound !== 'true') {
    showMoreBtn.addEventListener('click', function () {
      npmPackagesState.visibleCount += NPM_PACKAGES_STEP;
      renderNpmPackages();
    });
    showMoreBtn.dataset.bound = 'true';
  }
}

// ---- Fetch npm packages -------
/**
 * @returns {Promise<NpmFrontendPackage[]>}
 */
async function fetchNpmPackages() {
  var from = 0;
  var size = 100;
  var total = Number.POSITIVE_INFINITY;
  /** @type {NpmFrontendPackage[]} */
  var allPackages = [];

  // Realiza requisições paginadas para a API do npm
  while (from < total) {
    var response = await fetch(
      NPM_API +
        '?text=sanitized_name:@' +
        encodeURIComponent(ORG.toLowerCase()) +
        '&size=' +
        size +
        '&from=' +
        from,
    );

    // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
    if (!response.ok) {
      throw new Error('Falha ao carregar pacotes npm');
    }

    var pageData = /** @type {NpmSearchResponse} */ (await response.json());
    var objects = Array.isArray(pageData.objects) ? pageData.objects : [];
    total =
      typeof pageData.total === 'number' ? pageData.total : objects.length;

    var packages = objects
      .map(function (obj) {
        var registryPkg = obj.package;
        var keywords = Array.isArray(registryPkg.keywords)
          ? registryPkg.keywords
          : [];
        var monthlyDownloads =
          obj.downloads && typeof obj.downloads.monthly === 'number'
            ? obj.downloads.monthly
            : 0;

        return {
          name: registryPkg.name,
          description: registryPkg.description || '',
          version: registryPkg.version,
          keywords: keywords,
          downloadsMonthly: monthlyDownloads,
          npmUrl:
            registryPkg.links && registryPkg.links.npm
              ? registryPkg.links.npm
              : 'https://www.npmjs.com/package/' + registryPkg.name,
        };
      })
      .filter(function (pkg) {
        return Boolean(pkg.name);
      });

    allPackages = allPackages.concat(packages);

    // Se vier menos itens que o tamanho da página, não há mais páginas para buscar
    if (objects.length < size) {
      break;
    }

    from += size;
  }

  return allPackages;
}

// ---- Create npm package card ------
/**
 * @param {NpmFrontendPackage} pkg
 */
function createNpmPackageCard(pkg) {
  var card = document.createElement('a');
  card.href = pkg.npmUrl;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'package-card';

  var tagsText =
    pkg.keywords.length > 0
      ? pkg.keywords.slice(0, 3).join(' · ')
      : t('packages.npmFallbackTags');

  var downloadsHtml =
    '<span class="package-card__meta-item">' +
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
    '<polyline points="7 10 12 15 17 10"/>' +
    '<line x1="12" y1="15" x2="12" y2="3"/>' +
    '</svg>' +
    formatDownloads(pkg.downloadsMonthly) +
    ' ' +
    t('packages.downloadsLabel') +
    '</span>';

  var tagsHtml =
    '<span class="package-card__meta-item">' +
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M20.59 13.41 11 3.83V3H3v8h.83l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/>' +
    '<circle cx="7.5" cy="7.5" r="1.5"/>' +
    '</svg>' +
    tagsText +
    '</span>';

  card.innerHTML =
    '<div class="package-card__header">' +
    '<span class="package-card__name">' +
    pkg.name +
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
    tagsHtml +
    '</div>';

  return card;
}

// ---- Update npm meta ----------
function updateNpmMeta() {
  var meta = document.getElementById('npmMeta');

  // Verifica se o elemento de meta existe e há pacotes carregados antes de tentar definir seu conteúdo
  if (!meta || npmPackagesState.all.length === 0) {
    return;
  }

  var totalDownloads = npmPackagesState.all.reduce(function (sum, pkg) {
    return sum + pkg.downloadsMonthly;
  }, 0);
  meta.textContent =
    npmPackagesState.all.length +
    ' ' +
    t('packages.metaPackages') +
    ' · ' +
    formatDownloads(totalDownloads) +
    ' ' +
    t('packages.metaDownloadsPerMonth');
}

// ---- Render npm packages ------
function renderNpmPackages() {
  var grid = document.getElementById('npmGrid');
  var showMoreBtn = document.getElementById('npmShowMore');

  // Verifica se o elemento do grid existe antes de tentar renderizar os pacotes
  if (!grid) {
    return;
  }

  var searchTerm = npmPackagesState.searchTerm;

  npmPackagesState.filtered = npmPackagesState.all.filter(function (pkg) {
    var name = normalizeText(pkg.name);
    var description = normalizeText(pkg.description);
    var keywords = Array.isArray(pkg.keywords)
      ? normalizeText(pkg.keywords.join(' '))
      : '';
    return (
      searchTerm === '' ||
      name.indexOf(searchTerm) !== -1 ||
      description.indexOf(searchTerm) !== -1 ||
      keywords.indexOf(searchTerm) !== -1
    );
  });

  // Ordenação dinâmica
  if (npmPackagesState.sortBy === 'name') {
    npmPackagesState.filtered.sort(function (a, b) {
      return a.name.localeCompare(b.name, getLocaleTag(), {
        sensitivity: 'base',
      });
    });
  } else {
    npmPackagesState.filtered.sort(function (a, b) {
      return (b.downloadsMonthly || 0) - (a.downloadsMonthly || 0);
    });
  }

  grid.innerHTML = '';

  var visiblePackages = npmPackagesState.filtered.slice(
    0,
    npmPackagesState.visibleCount > 0
      ? npmPackagesState.visibleCount
      : INITIAL_NPM_PACKAGES,
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
      grid.appendChild(createNpmPackageCard(pkg));
    });

    initReveal();
  }

  // Verifica se o botão de mostrar mais existe antes de tentar atualizar sua visibilidade e texto
  if (showMoreBtn) {
    var remaining = npmPackagesState.filtered.length - visiblePackages.length;
    showMoreBtn.hidden = remaining <= 0;
    showMoreBtn.textContent =
      remaining > 0
        ? t('common.showMore') + ' (' + remaining + ')'
        : t('common.showMore');
  }
}

// Re-renderiza a seção quando o idioma muda
onLocaleChange(function () {
  renderNpmPackages();
  updateNpmMeta();
});

// ---- Init npm packages --------
export async function initNpm() {
  try {
    setupNpmControls();

    var packages = await fetchNpmPackages();

    // Ordena os pacotes por downloads mensais (ordem decrescente) para garantir uma apresentação consistente
    packages.sort(
      function (
        /** @type {NpmFrontendPackage} */ a,
        /** @type {NpmFrontendPackage} */ b,
      ) {
        return b.downloadsMonthly - a.downloadsMonthly;
      },
    );

    npmPackagesState.all = packages;
    npmPackagesState.visibleCount = INITIAL_NPM_PACKAGES;
    renderNpmPackages();
    updateNpmMeta();
  } catch (err) {
    var grid = document.getElementById('npmGrid');

    // Verifica se o elemento do grid existe antes de tentar exibir a mensagem de erro
    if (grid) {
      grid.innerHTML =
        '<div class="packages__loading">' +
        '<p>' +
        t('errors.packagesLoad') +
        ' ' +
        '<a href="https://www.npmjs.com/search?q=sanitized_name%3A%40' +
        ORG.toLowerCase() +
        '" target="_blank" rel="noopener noreferrer" class="inline-link">' +
        t('packages.seeInNpm') +
        '</a>' +
        '</p>' +
        '</div>';
    }
  }
}
