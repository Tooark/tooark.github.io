/* ============================================
   Tooark — Locale e traduções (runtime i18n)
   As mensagens ficam em js/i18n.js (script clássico
   que expõe window.TooarkI18n, também lido pelo shape-fx).
   ============================================ */

import { STORAGE_LOCALE_KEY } from './config.js';

var globalWindow =
  /** @type {Window & { TooarkI18n?: { htmlLang: { pt: string; en: string; }; messages: any; }; }} */ (
    window
  );
var i18nConfig = globalWindow.TooarkI18n || {
  htmlLang: { pt: 'pt-BR', en: 'en-US' },
  messages: { pt: {}, en: {} },
};
var HTML_LANG = i18nConfig.htmlLang;
var I18N = i18nConfig.messages;
var OG_LOCALE = { pt: 'pt_BR', en: 'en_US' };

/** @type {'pt' | 'en'} */
var currentLocale = 'pt';

/** @type {Array<() => void>} */
var subscribers = [];

/**
 * Registra um callback executado sempre que o idioma muda
 * @param {() => void} callback
 */
export function onLocaleChange(callback) {
  subscribers.push(callback);
}

/** @returns {'pt' | 'en'} */
export function getLocale() {
  return currentLocale;
}

/** Tag BCP 47 do idioma atual, para toLocaleString/localeCompare */
export function getLocaleTag() {
  return currentLocale === 'en' ? 'en-US' : 'pt-BR';
}

/**
 * @param {string} path
 */
export function t(path) {
  var parts = path.split('.');
  /** @type {any} */
  var value = I18N[currentLocale];

  for (var i = 0; i < parts.length; i++) {
    if (!value || typeof value !== 'object') {
      return path;
    }

    value = value[parts[i]];
  }

  return typeof value === 'string' ? value : path;
}

/**
 * @param {number} value
 */
export function formatNumberByLocale(value) {
  return value.toLocaleString(getLocaleTag());
}

/**
 * Formata o número de downloads em uma forma mais legível (ex: 1.2k, 3.4M)
 * @param {number} count
 */
export function formatDownloads(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
  }

  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k';
  }

  return formatNumberByLocale(count);
}

function getPreferredLocale() {
  // Parâmetro ?lang= na URL tem prioridade (links compartilháveis e hreflang)
  var urlLocale = null;
  try {
    urlLocale = new URLSearchParams(window.location.search).get('lang');
  } catch (e) {
    // URL/URLSearchParams indisponível: segue para as demais preferências
  }

  if (urlLocale === 'pt' || urlLocale === 'en') {
    return /** @type {'pt' | 'en'} */ (urlLocale);
  }

  var savedLocale = window.localStorage.getItem(STORAGE_LOCALE_KEY);

  if (savedLocale === 'pt' || savedLocale === 'en') {
    return /** @type {'pt' | 'en'} */ (savedLocale);
  }

  var browserLocale = (
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    'pt-BR'
  ).toLowerCase();
  return browserLocale.indexOf('en') === 0 ? 'en' : 'pt';
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-html');
    if (key) {
      el.innerHTML = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key && el instanceof HTMLInputElement) {
      el.placeholder = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });

  document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-content');
    if (key) {
      el.setAttribute('content', t(key));
    }
  });

  document.title = t('meta.title');
}

function updateOgLocale() {
  var meta = document.querySelector('meta[property="og:locale"]');

  if (meta) {
    meta.setAttribute('content', OG_LOCALE[currentLocale]);
  }
}

// Mantém a URL alinhada ao idioma atual (pt = URL limpa, en = ?lang=en)
function updateUrlLang() {
  try {
    var url = new URL(window.location.href);

    if (currentLocale === 'en') {
      url.searchParams.set('lang', 'en');
    } else {
      url.searchParams.delete('lang');
    }

    window.history.replaceState(null, '', url);
  } catch (e) {
    // history/URL indisponível (ex: file://): idioma segue funcionando sem refletir na URL
  }
}

function updateLanguageSwitcher() {
  var ptBtn = document.getElementById('langPt');
  var enBtn = document.getElementById('langEn');

  if (ptBtn) {
    ptBtn.classList.toggle('active', currentLocale === 'pt');
    ptBtn.setAttribute('aria-pressed', String(currentLocale === 'pt'));
  }

  if (enBtn) {
    enBtn.classList.toggle('active', currentLocale === 'en');
    enBtn.setAttribute('aria-pressed', String(currentLocale === 'en'));
  }
}

function setupLanguageSwitcher() {
  var ptBtn = document.getElementById('langPt');
  var enBtn = document.getElementById('langEn');

  if (ptBtn && ptBtn.dataset.bound !== 'true') {
    ptBtn.addEventListener('click', function () {
      setLocale('pt');
    });
    ptBtn.dataset.bound = 'true';
  }

  if (enBtn && enBtn.dataset.bound !== 'true') {
    enBtn.addEventListener('click', function () {
      setLocale('en');
    });
    enBtn.dataset.bound = 'true';
  }
}

/**
 * @param {'pt' | 'en'} locale
 */
export function setLocale(locale) {
  currentLocale = locale;
  window.localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  document.documentElement.lang = HTML_LANG[locale];

  updateUrlLang();
  applyTranslations();
  updateOgLocale();
  updateLanguageSwitcher();

  // Notifica as seções (projetos, pacotes, extensões...) para re-renderizar
  subscribers.forEach(function (callback) {
    callback();
  });
}

export function initLocale() {
  currentLocale = getPreferredLocale();
  document.documentElement.lang = HTML_LANG[currentLocale];

  applyTranslations();
  updateOgLocale();
  updateLanguageSwitcher();
  setupLanguageSwitcher();
}
