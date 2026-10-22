/* ============================================
   Tooark — Abas dos registros de pacotes
   (padrão WAI-ARIA Tabs, ativação automática)
   ============================================ */

/**
 * @param {HTMLElement[]} tabs
 * @param {HTMLElement} selectedTab
 * @param {boolean} moveFocus
 */
function selectTab(tabs, selectedTab, moveFocus) {
  tabs.forEach(function (tab) {
    var isSelected = tab === selectedTab;
    var panelId = tab.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;

    tab.classList.toggle('active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;

    if (panel) {
      panel.hidden = !isSelected;
    }
  });

  if (moveFocus) {
    selectedTab.focus();
  }
}

/**
 * @param {HTMLElement} tablist
 */
function setupTablist(tablist) {
  var tabs = /** @type {HTMLElement[]} */ (
    Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'))
  );

  // Verifica se a lista de abas já foi vinculada, para evitar múltiplos listeners
  if (tabs.length === 0 || tablist.dataset.bound === 'true') {
    return;
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      selectTab(tabs, tab, false);
    });

    // Navegação por teclado: setas alternam entre as abas, Home/End vão para a primeira/última
    tab.addEventListener('keydown', function (event) {
      var targetIndex = -1;

      if (event.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        targetIndex = 0;
      } else if (event.key === 'End') {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== -1) {
        event.preventDefault();
        selectTab(tabs, tabs[targetIndex], true);
      }
    });
  });

  tablist.dataset.bound = 'true';
}

export function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach(function (tablist) {
    setupTablist(/** @type {HTMLElement} */ (tablist));
  });
}
