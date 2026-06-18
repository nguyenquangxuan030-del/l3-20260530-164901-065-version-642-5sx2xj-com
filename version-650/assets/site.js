(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navButton && nav) {
        navButton.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    if (slides.length > 1) {
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-year-filter]");
    var filterButton = document.querySelector("[data-filter-button]");
    var emptyResult = document.querySelector("[data-empty-result]");

    function runFilter() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (!cards.length) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = filterSelect ? filterSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;

            if (matchedKeyword && matchedYear) {
                card.style.display = "";
                visible += 1;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyResult) {
            emptyResult.style.display = visible ? "none" : "block";
        }
    }

    if (filterInput) {
        filterInput.addEventListener("input", runFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", runFilter);
    }

    if (filterButton) {
        filterButton.addEventListener("click", runFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && filterInput) {
        filterInput.value = query;
        runFilter();
    }
})();
