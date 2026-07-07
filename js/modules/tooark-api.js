/* ============================================
   Tooark — Cliente da API da Tooark (api.tooark.com)
   ============================================ */

import { TOOARK_API } from './config.js';

/** @type {Promise<any[]> | null} */
var tooarkProjectsPromise = null;

/**
 * Busca os projetos na API da Tooark uma única vez e compartilha o resultado entre as seções
 * @returns {Promise<any[]>}
 */
export function getTooarkProjects() {
  if (!tooarkProjectsPromise) {
    tooarkProjectsPromise = fetch(TOOARK_API)
      .then(function (response) {
        // Verifica se a resposta da API foi bem-sucedida, caso contrário, lança um erro para ser tratado posteriormente
        if (!response.ok) {
          throw new Error('Falha ao carregar dados da API Tooark');
        }

        return response.json();
      })
      .then(function (payload) {
        return Array.isArray(payload.projects) ? payload.projects : [];
      });
  }

  return tooarkProjectsPromise;
}
