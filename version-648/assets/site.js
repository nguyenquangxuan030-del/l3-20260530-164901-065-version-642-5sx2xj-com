(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
        menuButton.addEventListener("click", function () {
            menuPanel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length > 1) {
        var activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterScopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    filterScopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var categorySelect = scope.querySelector("[data-category-select]");
        var typeSelect = scope.querySelector("[data-type-select]");
        var yearSelect = scope.querySelector("[data-year-select]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-empty]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var category = normalize(categorySelect ? categorySelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" "));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
                var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
                var matchYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
                var show = matchKeyword && matchCategory && matchType && matchYear;

                card.hidden = !show;

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
})();
