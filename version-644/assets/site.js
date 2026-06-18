(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activateHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateHero(current + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matches(card, filters) {
    var text = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));

    if (filters.q && text.indexOf(filters.q) === -1) {
      return false;
    }

    if (filters.region && normalize(card.getAttribute('data-region')).indexOf(filters.region) === -1 && text.indexOf(filters.region) === -1) {
      return false;
    }

    if (filters.type && normalize(card.getAttribute('data-type')).indexOf(filters.type) === -1 && text.indexOf(filters.type) === -1) {
      return false;
    }

    if (filters.year && normalize(card.getAttribute('data-year')).indexOf(filters.year) === -1) {
      return false;
    }

    if (filters.genre && text.indexOf(filters.genre) === -1) {
      return false;
    }

    return true;
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
    var scope = form.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    ['q', 'region', 'type', 'year', 'genre'].forEach(function (name) {
      var field = form.elements[name];
      var value = params.get(name);

      if (field && value) {
        field.value = value;
      }
    });

    function applyFilter() {
      var filters = {
        q: normalize(form.elements.q && form.elements.q.value),
        region: normalize(form.elements.region && form.elements.region.value),
        type: normalize(form.elements.type && form.elements.type.value),
        year: normalize(form.elements.year && form.elements.year.value),
        genre: normalize(form.elements.genre && form.elements.genre.value)
      };
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card, filters);
        card.classList.toggle('is-hidden-card', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(form.elements).forEach(function (field) {
      field.addEventListener('input', applyFilter);
      field.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
})();
