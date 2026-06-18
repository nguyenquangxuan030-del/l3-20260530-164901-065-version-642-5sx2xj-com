var hlsMap = new WeakMap();

async function prepareVideo(video, playUrl) {
  if (!video || !playUrl) {
    return;
  }

  if (hlsMap.has(video) || video.src) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = playUrl;
    return;
  }

  try {
    var module = await import('./hls-vendor-dru42stk.js');
    var Hls = module.H;

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(playUrl);
      hls.attachMedia(video);
      hlsMap.set(video, hls);
      return;
    }
  } catch (error) {
  }

  video.src = playUrl;
}

function startPlayer(panel) {
  var video = panel.querySelector('video');
  var cover = panel.querySelector('.player-cover');
  var errorText = panel.querySelector('.player-error');
  var playUrl = panel.getAttribute('data-play');

  if (!video || !playUrl) {
    return;
  }

  var begin = async function () {
    if (errorText) {
      errorText.hidden = true;
    }

    await prepareVideo(video, playUrl);
    video.controls = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (cover) {
        cover.classList.remove('is-hidden');
      }

      if (errorText) {
        errorText.hidden = false;
      }
    }
  };

  if (cover) {
    cover.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener('error', function () {
    if (errorText) {
      errorText.hidden = false;
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(startPlayer);
