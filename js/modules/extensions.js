/* ============================================
   Tooark — Extensões VS Code (Marketplace + Open VSX)
   ============================================ */

import {
  ORG,
  OPENVSX_API,
  OPENVSX_NAMESPACE,
  MARKETPLACE_API,
  INITIAL_EXTENSIONS,
  EXTENSIONS_STEP,
} from './config.js';
import { t, formatDownloads, onLocaleChange } from './locale.js';
import { pickNumber, pickString } from './utils.js';
import { getTooarkProjects } from './tooark-api.js';
import { initReveal } from './reveal.js';

/**
 * @typedef {{
 *  name: string;
 *  displayName: string;
 *  description: string;
 *  version: string;
 *  marketplaceInstalls: number | null;
 *  openVsxDownloads: number | null;
 *  marketplaceUrl: string;
 *  openVsxUrl: string;
 *  onMarketplace: boolean;
 *  onOpenVsx: boolean;
 * }} VsCodeExtension
 */

/** @type {{ all: VsCodeExtension[]; visibleCount: number; }} */
var extensionsState = { all: [], visibleCount: INITIAL_EXTENSIONS };

// ---- Fetch VS Code Marketplace ----
/**
 * Consulta a API pública do VS Code Marketplace para obter as extensões do publisher
 * @returns {Promise<Record<string, { displayName: string; description: string; version: string; installs: number | null; }>>}
 */
async function fetchMarketplaceExtensions() {
  var response = await fetch(MARKETPLACE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;api-version=3.0-preview.1',
    },
    body: JSON.stringify({
      filters: [
        {
          criteria: [{ filterType: 18, value: ORG }],
          pageNumber: 1,
          pageSize: 50,
        },
      ],
      flags: 914,
    }),
  });

  // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
  if (!response.ok) {
    throw new Error('Falha ao carregar extensões do VS Code Marketplace');
  }

  var data = await response.json();
  var extensions =
    data.results && data.results[0] && Array.isArray(data.results[0].extensions)
      ? data.results[0].extensions
      : [];
  /** @type {Record<string, { displayName: string; description: string; version: string; installs: number | null; }>} */
  var byName = {};

  extensions.forEach(function (/** @type {any} */ ext) {
    /** @type {Record<string, number>} */
    var stats = {};

    (ext.statistics || []).forEach(
      function (/** @type {{ statisticName: string; value: number; }} */ stat) {
        stats[stat.statisticName] = stat.value;
      },
    );

    byName[ext.extensionName] = {
      displayName: ext.displayName || ext.extensionName,
      description: ext.shortDescription || '',
      version:
        (ext.versions && ext.versions[0] && ext.versions[0].version) || '',
      installs:
        typeof stats.install === 'number' ? Math.round(stats.install) : null,
    };
  });

  return byName;
}

// ---- Fetch Open VSX -----------
/**
 * Consulta a API pública do Open VSX para obter os dados de uma extensão
 * @param {string} name
 * @returns {Promise<{ displayName: string; description: string; version: string; downloadCount: number | null; } | null>}
 */
async function fetchOpenVsxExtension(name) {
  var response = await fetch(
    OPENVSX_API + '/' + OPENVSX_NAMESPACE + '/' + encodeURIComponent(name),
  );

  // Extensão pode não existir no Open VSX; nesse caso, retorna nulo sem interromper as demais
  if (!response.ok) {
    return null;
  }

  var data = await response.json();

  return {
    displayName: data.displayName || name,
    description: data.description || '',
    version: data.version || '',
    downloadCount:
      typeof data.downloadCount === 'number' ? data.downloadCount : null,
  };
}

// ---- Create extension card ----
/**
 * @param {VsCodeExtension} ext
 */
function createExtensionCard(ext) {
  var card = document.createElement('div');
  card.className = 'package-card package-card--extension';

  var metaItems = '';

  // Exibe a contagem de installs do VS Code Marketplace quando disponível
  if (ext.marketplaceInstalls !== null) {
    metaItems +=
      '<span class="package-card__meta-item" title="VS Code Marketplace">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<polyline points="7 10 12 15 17 10"/>' +
      '<line x1="12" y1="15" x2="12" y2="3"/>' +
      '</svg>' +
      formatDownloads(ext.marketplaceInstalls) +
      ' ' +
      t('packages.installsLabel') +
      '</span>';
  }

  // Exibe a contagem de downloads do Open VSX quando disponível
  if (ext.openVsxDownloads !== null) {
    metaItems +=
      '<span class="package-card__meta-item" title="Open VSX">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' +
      '<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>' +
      '<line x1="12" y1="22.08" x2="12" y2="12"/>' +
      '</svg>' +
      formatDownloads(ext.openVsxDownloads) +
      ' Open VSX' +
      '</span>';
  }

  var links = '';

  // Link para a página da extensão no VS Code Marketplace
  if (ext.onMarketplace) {
    links +=
      '<a class="package-card__link" href="' +
      ext.marketplaceUrl +
      '" target="_blank" rel="noopener noreferrer">Marketplace</a>';
  }

  // Link para a página da extensão no Open VSX
  if (ext.onOpenVsx) {
    links +=
      '<a class="package-card__link" href="' +
      ext.openVsxUrl +
      '" target="_blank" rel="noopener noreferrer">Open VSX</a>';
  }

  card.innerHTML =
    '<div class="package-card__header">' +
    '<span class="package-card__name">' +
    ext.displayName +
    '</span>' +
    (ext.version
      ? '<span class="package-card__version">v' + ext.version + '</span>'
      : '') +
    '</div>' +
    '<p class="package-card__desc">' +
    (ext.description || t('packages.noDescription')) +
    '</p>' +
    '<div class="package-card__meta">' +
    metaItems +
    '</div>' +
    '<div class="package-card__links">' +
    links +
    '</div>';

  return card;
}

// ---- Render extensions --------
function renderExtensions() {
  var grid = document.getElementById('extensionsGrid');
  var showMoreBtn = document.getElementById('extensionsShowMore');

  // Verifica se o elemento do grid existe e há extensões carregadas antes de renderizar
  if (!grid || extensionsState.all.length === 0) {
    return;
  }

  grid.innerHTML = '';

  var visibleExtensions = extensionsState.all.slice(
    0,
    extensionsState.visibleCount > 0
      ? extensionsState.visibleCount
      : INITIAL_EXTENSIONS,
  );

  visibleExtensions.forEach(function (ext) {
    grid.appendChild(createExtensionCard(ext));
  });

  initReveal();

  // Verifica se o botão de mostrar mais existe antes de tentar atualizar sua visibilidade e texto
  if (showMoreBtn) {
    var remaining = extensionsState.all.length - visibleExtensions.length;
    showMoreBtn.hidden = remaining <= 0;
    showMoreBtn.textContent =
      remaining > 0
        ? t('common.showMore') + ' (' + remaining + ')'
        : t('common.showMore');
  }
}

// ---- Update extensions meta ---
function updateExtensionsMeta() {
  var meta = document.getElementById('extensionsMeta');

  // Verifica se o elemento de meta existe e há extensões carregadas antes de definir seu conteúdo
  if (!meta || extensionsState.all.length === 0) {
    return;
  }

  var totalInstalls = extensionsState.all.reduce(function (sum, ext) {
    return sum + (ext.marketplaceInstalls || 0);
  }, 0);
  var totalOpenVsx = extensionsState.all.reduce(function (sum, ext) {
    return sum + (ext.openVsxDownloads || 0);
  }, 0);

  meta.textContent =
    extensionsState.all.length +
    ' ' +
    t('packages.metaExtensions') +
    ' · ' +
    formatDownloads(totalInstalls) +
    ' ' +
    t('packages.installsLabel') +
    ' · ' +
    formatDownloads(totalOpenVsx) +
    ' Open VSX';
}

// Re-renderiza a seção quando o idioma muda
onLocaleChange(function () {
  renderExtensions();
  updateExtensionsMeta();
});

// ---- Init extensions ----------
export async function initExtensions() {
  var grid = document.getElementById('extensionsGrid');
  var showMoreBtn = document.getElementById('extensionsShowMore');

  // Verifica se o elemento do grid existe antes de tentar carregar as extensões
  if (!grid) {
    return;
  }

  // Verifica se o botão de mostrar mais existe e ainda não tem um listener de clique vinculado, para evitar múltiplos listeners
  if (showMoreBtn && showMoreBtn.dataset.bound !== 'true') {
    showMoreBtn.addEventListener('click', function () {
      extensionsState.visibleCount += EXTENSIONS_STEP;
      renderExtensions();
    });
    showMoreBtn.dataset.bound = 'true';
  }

  /** @type {Record<string, VsCodeExtension>} */
  var byName = {};

  /**
   * @param {string} name
   */
  function ensureExtension(name) {
    if (!byName[name]) {
      byName[name] = {
        name: name,
        displayName: name,
        description: '',
        version: '',
        marketplaceInstalls: null,
        openVsxDownloads: null,
        marketplaceUrl:
          'https://marketplace.visualstudio.com/items?itemName=' +
          ORG +
          '.' +
          name,
        openVsxUrl:
          'https://open-vsx.org/extension/' + OPENVSX_NAMESPACE + '/' + name,
        onMarketplace: false,
        onOpenVsx: false,
      };
    }

    return byName[name];
  }

  // 1. Lista canônica de extensões vinda da API da Tooark (tolerante a falha)
  try {
    var projects = await getTooarkProjects();

    projects.forEach(function (project) {
      var tags = Array.isArray(project.tags) ? project.tags : [];
      var onMarketplace = tags.indexOf('vscode-marketplace') !== -1;
      var onOpenVsx = tags.indexOf('openvsx') !== -1;

      // Ignora projetos que não são extensões de editor
      if (!onMarketplace && !onOpenVsx) {
        return;
      }

      var ext = ensureExtension(project.name);
      ext.onMarketplace = ext.onMarketplace || onMarketplace;
      ext.onOpenVsx = ext.onOpenVsx || onOpenVsx;

      // Usa os dados já sincronizados pela API, quando populados (campos lidos de forma defensiva)
      var data = project.data || {};
      var marketplaceData = data.vscodeMarketplace || data.vscode || {};
      var openVsxData = data.openVsx || data.openvsx || {};

      ext.marketplaceInstalls =
        pickNumber(marketplaceData, [
          'installs',
          'installCount',
          'downloads',
        ]) || ext.marketplaceInstalls;
      ext.openVsxDownloads =
        pickNumber(openVsxData, ['downloadCount', 'downloads']) ||
        ext.openVsxDownloads;
      ext.version =
        pickString(marketplaceData, ['version', 'latestVersion']) ||
        pickString(openVsxData, ['version', 'latestVersion']) ||
        (project.summary && project.summary.latestVersion) ||
        ext.version;
    });
  } catch (err) {
    // API indisponível: segue apenas com os dados dos registries públicos
  }

  // 2. Enriquecimento com dados ao vivo do VS Code Marketplace (installs, versão, descrição)
  try {
    var marketplaceMap = await fetchMarketplaceExtensions();

    Object.keys(marketplaceMap).forEach(function (name) {
      var info = marketplaceMap[name];
      var ext = ensureExtension(name);

      ext.onMarketplace = true;
      ext.displayName = info.displayName;
      ext.description = info.description || ext.description;
      ext.version = info.version || ext.version;
      ext.marketplaceInstalls =
        info.installs !== null ? info.installs : ext.marketplaceInstalls;
    });
  } catch (err) {
    // Marketplace indisponível: mantém os dados já coletados
  }

  // 3. Enriquecimento com dados ao vivo do Open VSX (downloads)
  var names = Object.keys(byName);

  await Promise.all(
    names.map(async function (name) {
      try {
        var info = await fetchOpenVsxExtension(name);

        // Verifica se a extensão existe no Open VSX antes de aplicar os dados
        if (info) {
          var ext = byName[name];
          ext.onOpenVsx = true;
          ext.openVsxDownloads =
            info.downloadCount !== null
              ? info.downloadCount
              : ext.openVsxDownloads;
          ext.displayName =
            ext.displayName === ext.name ? info.displayName : ext.displayName;
          ext.description = ext.description || info.description;
          ext.version = ext.version || info.version;
        }
      } catch (err) {
        // Open VSX indisponível para esta extensão: mantém os dados já coletados
      }
    }),
  );

  var list = names.map(function (name) {
    return byName[name];
  });

  // Verifica se alguma extensão foi encontrada, caso contrário, exibe mensagem de erro com link para o Marketplace
  if (list.length === 0) {
    grid.innerHTML =
      '<div class="packages__loading">' +
      '<p>' +
      t('errors.extensionsLoad') +
      ' ' +
      '<a href="https://marketplace.visualstudio.com/publishers/' +
      ORG +
      '" target="_blank" rel="noopener noreferrer" class="inline-link">' +
      t('packages.seeInMarketplace') +
      '</a>' +
      '</p>' +
      '</div>';
    return;
  }

  // Ordena pela soma de installs e downloads (ordem decrescente) para destacar as mais populares
  list.sort(function (a, b) {
    var totalA = (a.marketplaceInstalls || 0) + (a.openVsxDownloads || 0);
    var totalB = (b.marketplaceInstalls || 0) + (b.openVsxDownloads || 0);
    return totalB - totalA;
  });

  extensionsState.all = list;
  renderExtensions();
  updateExtensionsMeta();
}
