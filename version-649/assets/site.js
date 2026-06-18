const hlsModuleUrl = './hls-vendor-dru42stk.js';
let hlsCtorPromise = null;

function getHlsConstructor() {
    if (!hlsCtorPromise) {
        hlsCtorPromise = import(hlsModuleUrl)
            .then((module) => module.H || module.default || null)
            .catch(() => null);
    }

    return hlsCtorPromise;
}

function setupMobileNavigation() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
    });
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
        const input = scope.querySelector('[data-search-input]');
        const category = scope.querySelector('[data-filter-category]');
        const type = scope.querySelector('[data-filter-type]');
        const year = scope.querySelector('[data-filter-year]');
        const reset = scope.querySelector('[data-reset-filters]');
        const count = scope.querySelector('[data-result-count]');
        const results = scope.parentElement ? scope.parentElement.querySelectorAll('[data-movie-card]') : [];

        const apply = () => {
            const query = normalize(input ? input.value : '');
            const categoryValue = normalize(category ? category.value : '');
            const typeValue = normalize(type ? type.value : '');
            const yearValue = normalize(year ? year.value : '');
            let visible = 0;

            results.forEach((card) => {
                const text = normalize(card.dataset.search);
                const cardCategory = normalize(card.dataset.category);
                const cardType = normalize(card.dataset.type);
                const cardYear = normalize(card.dataset.year);
                const matchesQuery = !query || text.includes(query);
                const matchesCategory = !categoryValue || cardCategory === categoryValue;
                const matchesType = !typeValue || cardType.includes(typeValue);
                const matchesYear = !yearValue || cardYear === yearValue;
                const shouldShow = matchesQuery && matchesCategory && matchesType && matchesYear;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        };

        [input, category, type, year].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', () => {
                [input, category, type, year].forEach((control) => {
                    if (control) {
                        control.value = '';
                    }
                });
                apply();
            });
        }

        apply();
    });
}

async function activatePlayer(shell) {
    const video = shell.querySelector('video[data-src]');

    if (!video) {
        return;
    }

    const source = video.dataset.src;

    if (!source) {
        return;
    }

    if (video.dataset.ready !== 'true') {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            const Hls = await getHlsConstructor();

            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                shell.hlsInstance = hls;
            } else {
                video.src = source;
            }
        }

        video.dataset.ready = 'true';
    }

    shell.classList.add('is-playing');

    try {
        await video.play();
    } catch (error) {
        video.controls = true;
    }
}

function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach((shell) => {
        const trigger = shell.querySelector('[data-play-trigger]');
        const video = shell.querySelector('video');

        if (trigger) {
            trigger.addEventListener('click', () => activatePlayer(shell));
        }

        if (video) {
            video.addEventListener('play', () => {
                shell.classList.add('is-playing');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileNavigation();
    setupFilters();
    setupPlayers();
});
