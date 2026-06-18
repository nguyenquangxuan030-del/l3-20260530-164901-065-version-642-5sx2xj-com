(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.textContent = open ? "×" : "☰";
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    var input = filterRoot.querySelector("[data-filter-input]");
    var year = filterRoot.querySelector("[data-filter-year]");
    var type = filterRoot.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(
      filterRoot.querySelectorAll("[data-card]"),
    );
    var empty = filterRoot.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear =
          !selectedYear || card.getAttribute("data-year") === selectedYear;
        var okType =
          !selectedType || card.getAttribute("data-type") === selectedType;
        var ok = okKeyword && okYear && okType;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (year) {
      year.addEventListener("change", applyFilter);
    }
    if (type) {
      type.addEventListener("change", applyFilter);
    }
    applyFilter();
  }
})();
