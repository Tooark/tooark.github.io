/* ============================================
   Tooark — Totais de uso por registro
   (rótulos das abas e total geral da seção de pacotes)
   ============================================ */

import { t, formatDownloads, getLocaleTag } from './locale.js';

// Nomes de marca usados na frase do total geral, na ordem das abas
// (espaço não separável em "VS Code" para o nome não quebrar entre linhas)
var REGISTRY_NAMES = { nuget: 'NuGet', npm: 'npm', extensions: 'VS\u00a0Code' };

/** @type {Record<string, number>} */
var downloadsByRegistry = {};

/**
 * Atualiza o rótulo da aba de um registro e, quando houver downloads, o total geral da seção.
 * Os módulos chamam esta função ao carregar e ao trocar de idioma (junto com o meta de cada registro).
 * @param {'nuget' | 'npm' | 'extensions' | 'ghpkg'} registry
 * @param {string} label
 * @param {number | null} downloads
 */
export function updatePackageStat(registry, label, downloads) {
  var tabStat = document.getElementById(registry + 'TabStat');

  if (tabStat) {
    tabStat.textContent = label;
  }

  if (downloads !== null) {
    downloadsByRegistry[registry] = downloads;
  }

  renderPackagesTotal();
}

function renderPackagesTotal() {
  var totalEl = document.getElementById('packagesTotal');
  var registries = Object.keys(REGISTRY_NAMES).filter(function (registry) {
    return registry in downloadsByRegistry;
  });

  // Verifica se o elemento existe e há pelo menos um registro carregado antes de exibir o total
  if (!totalEl || registries.length === 0) {
    return;
  }

  var total = registries.reduce(function (sum, registry) {
    return sum + downloadsByRegistry[registry];
  }, 0);
  var names = registries.map(function (registry) {
    return REGISTRY_NAMES[
      /** @type {keyof typeof REGISTRY_NAMES} */ (registry)
    ];
  });

  var value = document.createElement('strong');
  value.className = 'packages__total-value';
  value.textContent = formatDownloads(total);

  totalEl.replaceChildren(
    value,
    ' ' +
      t('packages.totalDownloads') +
      ' ' +
      new Intl.ListFormat(getLocaleTag(), { type: 'conjunction' }).format(
        names,
      ),
  );
  totalEl.hidden = false;
}
