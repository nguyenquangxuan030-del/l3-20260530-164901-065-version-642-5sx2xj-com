(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function activateHero(index) {
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activateHero(dotIndex);
            });
        });

        window.setInterval(function () {
            activateHero(current + 1);
        }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var searchInput = document.querySelector("[data-card-search]");
    var genreSelect = document.querySelector("[data-card-genre]");
    var yearSelect = document.querySelector("[data-card-year]");
    var sortSelect = document.querySelector("[data-card-sort]");
    var grid = document.querySelector("[data-card-grid]");
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyUrlQuery() {
        if (!searchInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query) {
            searchInput.value = query;
        }
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInput && searchInput.value);
        var genre = normalize(genreSelect && genreSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre
            ].join(" "));

            var genreMatch = !genre || normalize(card.dataset.genre).indexOf(genre) > -1;
            var yearMatch = !year || normalize(card.dataset.year) === year;
            var queryMatch = !query || haystack.indexOf(query) > -1;
            var visible = genreMatch && yearMatch && queryMatch;

            card.classList.toggle("is-hidden", !visible);

            if (visible) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", shown === 0);
        }
    }

    function applySort() {
        if (!grid || !sortSelect) {
            return;
        }

        var mode = sortSelect.value;
        var ordered = cards.slice().sort(function (a, b) {
            if (mode === "year") {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }

            if (mode === "title") {
                return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
            }

            return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });

        ordered.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    [searchInput, genreSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            applySort();
            applyFilters();
        });
    }

    applyUrlQuery();
    applySort();
    applyFilters();
})();

function initializePlayer(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    var started = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function start() {
        if (!started) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            video.controls = true;
            started = true;
        }

        if (layer) {
            layer.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (!started || video.paused) {
            start();
        }
    });

    video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
        }
    });
}
