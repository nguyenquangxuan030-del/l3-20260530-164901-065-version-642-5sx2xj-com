import { H as Hls } from './hls-vendor.js';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-video-message]');

    if (!video || !playButton) {
      return;
    }

    playButton.addEventListener('click', function () {
      startPlayback(video, player, message);
    });
  });
});

function startPlayback(video, player, message) {
  var source = video.dataset.videoSrc;

  if (!source) {
    setMessage(message, '未找到播放源');
    return;
  }

  player.classList.add('is-loading');

  if (video.dataset.ready !== 'true') {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.ready = 'true';
        playVideo(video, player, message);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage(message, '网络加载异常，正在重试播放源');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage(message, '媒体解码异常，正在尝试恢复');
          hls.recoverMediaError();
        } else {
          setMessage(message, '播放源暂时无法加载');
          hls.destroy();
        }
      });
      video._hls = hls;
      return;
    } else {
      setMessage(message, '当前浏览器不支持 HLS 播放');
      player.classList.remove('is-loading');
      return;
    }
  }

  playVideo(video, player, message);
}

function playVideo(video, player, message) {
  var promise = video.play();
  player.classList.remove('is-loading');
  player.classList.add('is-playing');
  setMessage(message, '');

  if (promise && typeof promise.catch === 'function') {
    promise.catch(function () {
      setMessage(message, '浏览器阻止了自动播放，请再次点击播放按钮');
      player.classList.remove('is-playing');
    });
  }
}

function setMessage(message, text) {
  if (message) {
    message.textContent = text || '';
  }
}
