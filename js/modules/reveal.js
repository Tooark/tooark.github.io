/* ============================================
   Tooark — Efeito de reveal ao rolar a página
   ============================================ */

/** @type {IntersectionObserver | null} */
var revealObserver = null;

export function initReveal() {
  var classNames =
    '.project-card, .category-card, .service-card, .package-card, .contributor-card, .sponsor-card';
  var elements = document.querySelectorAll(classNames);

  // Adiciona a classe 'reveal' a todos os elementos que devem ter o efeito de revelação
  elements.forEach(function (el) {
    el.classList.add('reveal');
  });

  // Mantém um único observer ativo para evitar múltiplos observers concorrentes a cada renderização
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
  }

  elements.forEach(function (el) {
    var safeEl = /** @type {HTMLElement} */ (el);

    if (safeEl.dataset.revealObserved !== 'true' && revealObserver) {
      revealObserver.observe(safeEl);
      safeEl.dataset.revealObserved = 'true';
    }
  });
}
