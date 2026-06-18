(function () {
    window.initMoviePlayer = function (streamUrl, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var ready = false;
        var hlsInstance = null;
        var loadingHls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function loadHls() {
            if (window.Hls) {
                return Promise.resolve(window.Hls);
            }

            if (loadingHls) {
                return loadingHls;
            }

            loadingHls = new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
                script.async = true;
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });

            return loadingHls;
        }

        function prepare() {
            if (ready) {
                return Promise.resolve();
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            return loadHls().then(function (HlsClass) {
                if (HlsClass && HlsClass.isSupported()) {
                    hlsInstance = new HlsClass({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = streamUrl;
            }).catch(function () {
                video.src = streamUrl;
            });
        }

        function start() {
            prepare().then(function () {
                button.classList.add("is-hidden");
                video.controls = true;
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            });
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        prepare();
    };
})();
