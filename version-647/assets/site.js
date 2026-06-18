(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.textContent = opened ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(input) {
    var grid = input.closest('section') ? input.closest('section').querySelector('[data-card-grid]') : document.querySelector('[data-card-grid]');
    var status = input.parentElement ? input.parentElement.querySelector('[data-filter-status]') : null;
    if (!grid) {
      return;
    }
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(grid.children);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '') + ' ' + card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (status) {
      status.textContent = visible ? '' : '未找到匹配的剧集';
    }
  }

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input.hasAttribute('data-query-input')) {
      input.value = query;
    }
    input.addEventListener('input', function () {
      applyFilter(input);
    });
    applyFilter(input);
  });
})();
