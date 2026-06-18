(function () {
    var dataElement = document.getElementById("playback-data");
    var video = document.querySelector("[data-video]");
    var playButton = document.querySelector("[data-play-button]");
    var toggleButton = document.querySelector("[data-toggle-button]");
    var muteButton = document.querySelector("[data-mute-button]");
    var fullButton = document.querySelector("[data-full-button]");
    var stage = document.querySelector("[data-video-stage]");

    if (!dataElement || !video) {
        return;
    }

    var config = JSON.parse(dataElement.textContent || "{}");
    var playbackUrl = config.url || "";
    var initialized = false;
    var hlsInstance = null;

    function initialize() {
        if (initialized || !playbackUrl) {
            return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playbackUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playbackUrl;
        } else {
            video.src = playbackUrl;
        }
    }

    function updateButtons() {
        var playing = !video.paused && !video.ended;

        if (toggleButton) {
            toggleButton.textContent = playing ? "Ⅱ" : "▶";
        }

        if (playButton) {
            playButton.classList.toggle("is-hidden", playing);
        }

        if (muteButton) {
            muteButton.textContent = video.muted ? "静" : "声";
        }
    }

    function playMovie() {
        initialize();

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }

        updateButtons();
    }

    function togglePlay() {
        initialize();

        if (video.paused || video.ended) {
            playMovie();
        } else {
            video.pause();
        }

        updateButtons();
    }

    if (playButton) {
        playButton.addEventListener("click", playMovie);
    }

    if (toggleButton) {
        toggleButton.addEventListener("click", togglePlay);
    }

    if (video) {
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", updateButtons);
        video.addEventListener("pause", updateButtons);
        video.addEventListener("ended", updateButtons);
    }

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            updateButtons();
        });
    }

    if (fullButton && stage) {
        fullButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (stage.requestFullscreen) {
                stage.requestFullscreen();
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });

    updateButtons();
})();
