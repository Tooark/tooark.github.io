/* ============================================
   Tooark — GitHub Packages (imagens de contêiner)
   ============================================ */

import { ORG, INITIAL_PACKAGES, PACKAGES_STEP } from './config.js';
import { t, onLocaleChange } from './locale.js';
import { pickSemverTag } from './utils.js';
import { getTooarkProjects } from './tooark-api.js';
import { initReveal } from './reveal.js';

/**
 * @typedef {{
 *  name: string;
 *  version: string;
 *  description: string;
 *  url: string;
 * }} GithubContainerPackage
 */

/** @type {{ all: GithubContainerPackage[]; visibleCount: number; }} */
var ghpkgState = { all: [], visibleCount: INITIAL_PACKAGES };

// ---- Setup GitHub Packages controls ----
function setupGhpkgControls() {
  var showMoreBtn = document.getElementById('ghpkgShowMore');

  // Verifica se o botão de mostrar mais existe e ainda não tem um listener de clique vinculado, para evitar múltiplos listeners
  if (showMoreBtn && showMoreBtn.dataset.bound !== 'true') {
    showMoreBtn.addEventListener('click', function () {
      ghpkgState.visibleCount += PACKAGES_STEP;
      renderGithubPackages();
    });
    showMoreBtn.dataset.bound = 'true';
  }
}

// ---- Create GitHub package card ----
/**
 * @param {GithubContainerPackage} pkg
 */
function createGhpkgCard(pkg) {
  var card = document.createElement('a');
  card.href = pkg.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'package-card';

  card.innerHTML =
    '<div class="package-card__header">' +
    '<span class="package-card__name">' +
    pkg.name +
    '</span>' +
    '<span class="package-card__version">' +
    (pkg.version ? 'v' + pkg.version : 'Container') +
    '</span>' +
    '</div>' +
    '<p class="package-card__desc">' +
    (pkg.description || t('packages.ghpkgDesc')) +
    '</p>' +
    '<div class="package-card__meta">' +
    '<span class="package-card__meta-item">GitHub Packages</span>' +
    '<span class="package-card__meta-item">Container</span>' +
    '</div>';

  return card;
}

// ---- Render GitHub Packages ---
function renderGithubPackages() {
  var grid = document.getElementById('ghpkgGrid');
  var showMoreBtn = document.getElementById('ghpkgShowMore');

  // Verifica se o elemento do grid existe e há pacotes carregados antes de renderizar
  if (!grid || ghpkgState.all.length === 0) {
    return;
  }

  grid.innerHTML = '';

  var visiblePackages = ghpkgState.all.slice(
    0,
    ghpkgState.visibleCount > 0 ? ghpkgState.visibleCount : INITIAL_PACKAGES,
  );

  visiblePackages.forEach(function (pkg) {
    grid.appendChild(createGhpkgCard(pkg));
  });

  initReveal();

  // Verifica se o botão de mostrar mais existe antes de tentar atualizar sua visibilidade e texto
  if (showMoreBtn) {
    var remaining = ghpkgState.all.length - visiblePackages.length;
    showMoreBtn.hidden = remaining <= 0;
    showMoreBtn.textContent =
      remaining > 0
        ? t('common.showMore') + ' (' + remaining + ')'
        : t('common.showMore');
  }
}

// ---- Update GitHub Packages meta ----
function updateGhpkgMeta() {
  var meta = document.getElementById('ghpkgMeta');

  // Verifica se o elemento de meta existe e há pacotes carregados antes de definir seu conteúdo
  if (!meta || ghpkgState.all.length === 0) {
    return;
  }

  meta.textContent = ghpkgState.all.length + ' ' + t('packages.metaImages');
}

// Re-renderiza a seção quando o idioma muda
onLocaleChange(function () {
  renderGithubPackages();
  updateGhpkgMeta();
});

// ---- Init GitHub Packages -----
export async function initGithubPackages() {
  var grid = document.getElementById('ghpkgGrid');

  // Verifica se o elemento do grid existe antes de tentar carregar os pacotes
  if (!grid) {
    return;
  }

  try {
    setupGhpkgControls();

    var projects = await getTooarkProjects();

    var packages = projects
      .filter(function (project) {
        var tags = Array.isArray(project.tags) ? project.tags : [];
        return tags.indexOf('github-packages') !== -1;
      })
      .map(function (project) {
        var summary = project.summary || {};
        var packageData = (project.data && project.data.githubPackage) || {};
        var url =
          (Array.isArray(summary.packageUrls) && summary.packageUrls[0]) ||
          'https://github.com/orgs/' +
            ORG +
            '/packages/container/package/' +
            project.name;

        return {
          name: project.name,
          version: pickSemverTag(packageData.tags, summary.latestVersion),
          description: project.description || '',
          url: url,
        };
      });

    packages.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    ghpkgState.all = packages;
    ghpkgState.visibleCount = INITIAL_PACKAGES;
    renderGithubPackages();
    updateGhpkgMeta();
  } catch (err) {
    grid.innerHTML =
      '<div class="packages__loading">' +
      '<p>' +
      t('errors.packagesLoad') +
      ' ' +
      '<a href="https://github.com/orgs/' +
      ORG +
      '/packages" target="_blank" rel="noopener noreferrer" class="inline-link">' +
      t('packages.seeInGithub') +
      '</a>' +
      '</p>' +
      '</div>';
  }
}
