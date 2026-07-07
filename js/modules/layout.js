/* ============================================
   Tooark — Layout base: header, menu móvel e footer
   ============================================ */

function initHeaderScroll() {
  var header = document.getElementById('header');

  // Verifica se o elemento do header existe antes de adicionar o listener de scroll
  if (!header) {
    return;
  }

  // Adiciona um listener de scroll para alterar a classe do header com base na posição de rolagem
  window.addEventListener(
    'scroll',
    function () {
      var scrollY = window.scrollY;

      // Adiciona ou remove a classe com base na posição de rolagem
      if (scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    },
    { passive: true },
  );
}

function initMobileNav() {
  var nav = document.getElementById('nav');
  var navClose = document.getElementById('navClose');
  var navToggle = document.getElementById('navToggle');

  // Verifica se os elementos de navegação e toggle existem antes de adicionar o listener de clique
  if (!nav || !navToggle) {
    return;
  }

  var navEl = nav;
  var navToggleEl = navToggle;

  // Função para fechar o menu móvel
  function closeMobileMenu() {
    navEl.classList.remove('open');
    navToggleEl.classList.remove('active');
    navToggleEl.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Adiciona um listener de clique para alternar a visibilidade da navegação móvel
  navToggleEl.addEventListener('click', function () {
    var isOpen = navEl.classList.toggle('open');

    navToggleEl.classList.toggle('active');
    navToggleEl.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Verifica se o elemento de fechamento da navegação existe
  if (navClose) {
    navClose.addEventListener('click', closeMobileMenu);
  }

  // Navegação móvel, fecha o menu ao clicar em um link
  navEl.querySelectorAll('.header__link').forEach(function (link) {
    // Adiciona um listener de clique para cada link de navegação para fechar o menu móvel
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });
}

function initFooterYear() {
  var year = document.getElementById('year');

  // Verifica se o elemento do ano existe antes de definir seu conteúdo
  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }
}

export function initLayout() {
  initHeaderScroll();
  initMobileNav();
  initFooterYear();
}
