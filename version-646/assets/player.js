(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var layer = document.getElementById("playLayer");
    if (!video || !layer) {
      return;
    }

    var url = video.getAttribute("data-play");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !url) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      layer.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          layer.classList.remove("is-hidden");
        });
      }
    }

    layer.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
