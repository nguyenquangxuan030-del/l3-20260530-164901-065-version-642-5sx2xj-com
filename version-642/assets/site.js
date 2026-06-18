const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initHeader() {
  const header = $("[data-site-header]");
  const menuButton = $("[data-menu-toggle]");
  const mobileNav = $("[data-mobile-nav]");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
  }
}

function initHero() {
  const hero = $("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = $$("[data-hero-slide]", hero);
  const dots = $$("[data-hero-dot]", hero);
  const prev = $("[data-hero-prev]", hero);
  const next = $("[data-hero-next]", hero);
  let current = 0;
  let timer = null;

  const activate = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };

  const schedule = () => {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(() => {
      activate(current + 1);
    }, 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      activate(index);
      schedule();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      activate(current - 1);
      schedule();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      activate(current + 1);
      schedule();
    });
  }

  activate(0);
  schedule();
}

function initFilters() {
  $$("[data-filter-root]").forEach((root) => {
    const search = $("[data-filter-search]", root);
    const type = $("[data-filter-type]", root);
    const year = $("[data-filter-year]", root);
    const reset = $("[data-filter-reset]", root);
    const cards = $$("[data-movie-card]", root);

    const apply = () => {
      const query = normalize(search ? search.value : "");
      const selectedType = normalize(type ? type.value : "");
      const selectedYear = normalize(year ? year.value : "");

      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(" "));
        const matchesQuery = !query || text.includes(query);
        const matchesType = !selectedType || normalize(card.dataset.type) === selectedType;
        const matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;

        card.classList.toggle("is-hidden", !(matchesQuery && matchesType && matchesYear));
      });
    };

    if (search) {
      search.addEventListener("input", apply);
    }

    if (type) {
      type.addEventListener("change", apply);
    }

    if (year) {
      year.addEventListener("change", apply);
    }

    if (reset) {
      reset.addEventListener("click", () => {
        if (search) {
          search.value = "";
        }

        if (type) {
          type.value = "";
        }

        if (year) {
          year.value = "";
        }

        apply();
      });
    }

    apply();
  });
}

async function loadHls() {
  try {
    const module = await import("./hls-vendor.js");
    return module.H;
  } catch (error) {
    return null;
  }
}

function initPlayers() {
  $$("[data-player]").forEach((player) => {
    const video = $("video", player);
    const button = $("[data-play-button]", player);
    const message = $("[data-player-message]", player);
    let prepared = false;
    let hlsInstance = null;

    if (!video || !button) {
      return;
    }

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const prepare = async () => {
      if (prepared) {
        return;
      }

      const source = video.dataset.src;

      if (!source) {
        setMessage("当前播放地址不可用。");
        return;
      }

      prepared = true;
      setMessage("正在加载影片…");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      const Hls = await loadHls();

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    };

    const play = async () => {
      player.classList.add("is-playing");
      await prepare();

      try {
        await video.play();
        setMessage("");
      } catch (error) {
        player.classList.remove("is-playing");
        setMessage("播放加载受浏览器策略影响，请再次点击播放按钮。");
      }
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      play();
    });

    player.addEventListener("click", (event) => {
      if (event.target.closest("a") || event.target.closest("video")) {
        return;
      }

      play();
    });

    video.addEventListener("play", () => {
      player.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });

    video.addEventListener("error", () => {
      setMessage("影片加载失败，请稍后重试。");
    });

    window.addEventListener("pagehide", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initHero();
  initFilters();
  initPlayers();
});
