(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startTimer() {
                if (slides.length <= 1) {
                    return;
                }
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    showSlide(index);
                    startTimer();
                });
            });

            showSlide(0);
            startTimer();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var queryInput = scope.querySelector("[data-filter-query]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var resetButton = scope.querySelector("[data-filter-reset]");

            selects.forEach(function (select) {
                var field = select.getAttribute("data-filter-field");
                var values = [];
                cards.forEach(function (card) {
                    var value = card.getAttribute("data-" + field);
                    if (value && values.indexOf(value) === -1) {
                        values.push(value);
                    }
                });
                values.sort(function (a, b) {
                    return b.localeCompare(a, "zh-CN", { numeric: true });
                });
                values.forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            });

            function applyFilter() {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var activeFilters = selects.map(function (select) {
                    return {
                        field: select.getAttribute("data-filter-field"),
                        value: select.value
                    };
                });

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-keywords")
                    ].join(" ").toLowerCase();
                    var queryMatched = !query || haystack.indexOf(query) !== -1;
                    var filtersMatched = activeFilters.every(function (filter) {
                        return !filter.value || card.getAttribute("data-" + filter.field) === filter.value;
                    });
                    card.classList.toggle("is-filtered", !(queryMatched && filtersMatched));
                });
            }

            if (queryInput) {
                queryInput.addEventListener("input", applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilter);
            });
            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    if (queryInput) {
                        queryInput.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    applyFilter();
                });
            }
        });
    });
})();
