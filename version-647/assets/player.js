(function () {
  function loadVideo(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');
    var stream = shell.getAttribute('data-stream');
    var Hls = window.Hls;

    if (!video || !stream) {
      return;
    }

    function begin() {
      shell.classList.add('is-playing');

      if (video.getAttribute('data-ready') === '1') {
        video.play().catch(function () {});
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }

  document.querySelectorAll('.player-shell').forEach(loadVideo);
})();
