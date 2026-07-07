/* ============================================
   Tooark — Utilitários compartilhados
   ============================================ */

/**
 * @param {string | null | undefined} value
 */
export function normalizeText(value) {
  return (value || '').toLowerCase().trim();
}

/**
 * Lê o primeiro valor numérico presente em um dos campos informados
 * @param {any} obj
 * @param {string[]} keys
 * @returns {number | null}
 */
export function pickNumber(obj, keys) {
  // Verifica se o objeto é válido antes de tentar ler os campos
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (typeof value === 'number' && isFinite(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Lê o primeiro valor de texto não vazio presente em um dos campos informados
 * @param {any} obj
 * @param {string[]} keys
 * @returns {string}
 */
export function pickString(obj, keys) {
  // Verifica se o objeto é válido antes de tentar ler os campos
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (typeof value === 'string' && value !== '') {
      return value;
    }
  }

  return '';
}

/**
 * Seleciona a tag mais específica no formato x.x.x dentre as tags da imagem,
 * ignorando digests sha256 e a tag "latest"
 * @param {string[] | undefined} tags
 * @param {string} fallback
 * @returns {string}
 */
export function pickSemverTag(tags, fallback) {
  var list = Array.isArray(tags) ? tags : [];
  var best = '';

  list.forEach(function (tag) {
    // Considera apenas tags de versão (ex: 1, 1.4, 1.4.0) e mantém a mais específica
    if (
      /^\d+(\.\d+)*$/.test(tag) &&
      (best === '' || tag.split('.').length > best.split('.').length)
    ) {
      best = tag;
    }
  });

  if (best) {
    return best;
  }

  // Digest sha256 não é uma versão legível para exibição no card
  if (fallback && fallback.indexOf('sha256:') !== 0) {
    return fallback;
  }

  return '';
}
