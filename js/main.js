/* ============================================
   Tooark — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  const ORG = 'Tooark';
  const API = 'https://api.github.com';
  const SITE_REPO = 'tooark.github.io';

  // Language colors (GitHub style)
  const LANG_COLORS = {
    'C#': '#178600',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Shell': '#89e051',
    'HCL': '#844fba',
    'Dockerfile': '#384d54',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Python': '#3572A5',
    'Go': '#00ADD8',
  };

  // Category mapping
  const CATEGORIES = {
    'Bibliotecas': ['tooark', 'eslint', 'tooark-observability-nodejs', 'tooark-observability-web'],
    'CI/CD': ['sonarqube-template-include', 'trivy-summary-include', 'trivy-summary-action', 'notification-trigger-url-include', 'notification-trigger-url-action'],
    'Infra': ['terraform-aws-gcp-modules', 'base-images'],
    'Ferramentas': ['custom-terminal'],
  };

  // ---- Header scroll ----
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  navToggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on link click
  nav.querySelectorAll('.header__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ---- Year ----
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Scroll reveal ----
  function initReveal() {
    var elements = document.querySelectorAll('.project-card, .category-card, .service-card');
    elements.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // ---- Fetch repos ----
  async function fetchRepos() {
    var response = await fetch(API + '/orgs/' + ORG + '/repos?per_page=100&sort=updated&type=public');
    if (!response.ok) throw new Error('Falha ao carregar repositórios');
    return response.json();
  }

  // ---- Get category for repo ----
  function getCategory(repoName) {
    for (var cat in CATEGORIES) {
      if (CATEGORIES[cat].indexOf(repoName) !== -1) return cat;
    }
    return 'Outros';
  }

  // ---- Render project card ----
  function createProjectCard(repo) {
    var card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'project-card';
    card.dataset.category = getCategory(repo.name);

    var langDot = '';
    if (repo.language) {
      var color = LANG_COLORS[repo.language] || '#8b8b8b';
      langDot =
        '<span class="project-card__meta-item">' +
          '<span class="project-card__lang-dot" style="background:' + color + '"></span>' +
          repo.language +
        '</span>';
    }

    var starsHtml = '';
    if (repo.stargazers_count > 0) {
      starsHtml =
        '<span class="project-card__meta-item">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568L24 9.306l-6 5.847 1.417 8.26L12 19.467l-7.417 3.946L6 15.153 0 9.306l8.332-1.151z"/></svg>' +
          repo.stargazers_count +
        '</span>';
    }

    var issuesHtml = '';
    if (repo.open_issues_count > 0) {
      issuesHtml =
        '<span class="project-card__meta-item">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
          repo.open_issues_count +
        '</span>';
    }

    var licenseHtml = '';
    if (repo.license && repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION') {
      licenseHtml =
        '<span class="project-card__meta-item">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
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

  // ---- Render filters ----
  function renderFilters(repos) {
    var filtersContainer = document.getElementById('projectFilters');
    var categoriesSet = {};

    repos.forEach(function (repo) {
      var cat = getCategory(repo.name);
      categoriesSet[cat] = true;
    });

    var cats = Object.keys(categoriesSet).sort();
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.textContent = cat;
      filtersContainer.appendChild(btn);
    });

    // Filter click
    filtersContainer.addEventListener('click', function (e) {
      if (!e.target.classList.contains('filter-btn')) return;
      var filter = e.target.dataset.filter;

      filtersContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');

      var cards = document.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(function () { card.classList.add('visible'); }, 10);
        } else {
          card.style.display = 'none';
          card.classList.remove('visible');
        }
      });
    });
  }

  // ---- Update stats ----
  function updateStats(repos) {
    var totalStars = 0;
    var languages = {};

    repos.forEach(function (repo) {
      totalStars += repo.stargazers_count;
      if (repo.language) languages[repo.language] = true;
    });

    document.getElementById('statRepos').textContent = repos.length;
    document.getElementById('statStars').textContent = totalStars;
    document.getElementById('statLanguages').textContent = Object.keys(languages).length;
  }

  // ---- Init ----
  async function init() {
    try {
      var repos = await fetchRepos();

      // Filter out the site repo
      repos = repos.filter(function (r) { return r.name !== SITE_REPO; });

      // Sort: stars desc, then updated desc
      repos.sort(function (a, b) {
        if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

      updateStats(repos);
      renderFilters(repos);

      var grid = document.getElementById('projectsGrid');
      grid.innerHTML = '';

      repos.forEach(function (repo) {
        grid.appendChild(createProjectCard(repo));
      });

      initReveal();
    } catch (err) {
      var grid = document.getElementById('projectsGrid');
      grid.innerHTML =
        '<div class="projects__loading">' +
          '<p>Não foi possível carregar os projetos. ' +
          '<a href="https://github.com/' + ORG + '" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary)">Veja no GitHub</a></p>' +
        '</div>';
    }
  }

  init();
})();
