document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('.js-filter-page').forEach(function (section) {
    var input = section.querySelector('.js-filter-input');
    var typeSelect = section.querySelector('.js-filter-type');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.js-movie-card'));
    var status = section.querySelector('[data-filter-status]');

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value.trim() : '';
      var count = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var typeMatched = !type || text.indexOf(type.toLowerCase()) !== -1;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var visible = typeMatched && keywordMatched;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          count += 1;
        }
      });

      if (status) {
        status.textContent = '显示 ' + count + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
  });

  var searchInput = document.getElementById('site-search-input');
  var searchType = document.getElementById('site-search-type');
  var searchResults = document.getElementById('site-search-results');
  var searchStatus = document.getElementById('site-search-status');

  if (searchInput && searchResults && window.MOVIES_INDEX) {
    function movieCard(movie) {
      var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
        '  <div class="movie-card__poster" style="--poster: url(\'' + escapeHtml(movie.poster) + '\');">',
        '    <span class="movie-card__score">' + escapeHtml(movie.score) + '</span>',
        '    <span class="movie-card__play">▶</span>',
        '  </div>',
        '  <div class="movie-card__body">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p class="movie-card__meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="movie-card__line">' + escapeHtml(movie.oneLine || movie.genre) + '</p>',
        '    <div class="movie-card__tags">' + tagHtml + '</div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>'"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '\'': '&#39;',
          '"': '&quot;'
        }[char];
      });
    }

    function runSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var type = searchType ? searchType.value.trim().toLowerCase() : '';
      var results = window.MOVIES_INDEX.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var typeMatched = !type || text.indexOf(type) !== -1;
        return keywordMatched && typeMatched;
      }).slice(0, 96);

      searchResults.innerHTML = results.map(movieCard).join('');
      if (searchStatus) {
        searchStatus.textContent = '找到 ' + results.length + ' 条结果，最多显示前 96 条';
      }
    }

    searchInput.addEventListener('input', runSearch);
    if (searchType) {
      searchType.addEventListener('change', runSearch);
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset) {
      searchInput.value = preset;
    }
    runSearch();
  }
});
