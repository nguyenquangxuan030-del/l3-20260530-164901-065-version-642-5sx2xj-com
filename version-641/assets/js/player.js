(function () {
    function initMoviePlayer(videoId, m3u8Url, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var initialized = false;
        var hls = null;

        if (!video || !cover || !m3u8Url) {
            return;
        }

        function attachStream() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = m3u8Url;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(m3u8Url);
                hls.attachMedia(video);
                return Promise.resolve();
            }

            video.src = m3u8Url;
            return Promise.resolve();
        }

        function playVideo() {
            cover.classList.add("is-hidden");
            attachStream().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            });
        }

        cover.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
