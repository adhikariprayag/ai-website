import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const playerRef = useRef(null);

    // Song ID: 4oR9hq7QQKU
    const VIDEO_ID = '4oR9hq7QQKU';

    useEffect(() => {
        // Load YouTube IFrame Player API code asynchronously
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // This function will be called by the API when it's ready
        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: VIDEO_ID,
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'loop': 1,
                    'playlist': VIDEO_ID
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        return () => {
            // Cleanup matches
            if (playerRef.current) {
                // playerRef.current.destroy(); // leads to errors sometimes on unmount
            }
        }
    }, []);

    const onPlayerReady = (event) => {
        setIsReady(true);
        // Play video briefly to buffer then pause? No, wait for user.
        // event.target.setVolume(50);
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        }
    };

    const togglePlay = () => {
        if (!isReady || !playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    return (
        <div className="music-player">
            {/* Hidden Player Div */}
            <div id="youtube-player" style={{ display: 'none' }}></div>

            <button
                className={`play-button ${isPlaying ? 'playing' : ''}`}
                onClick={togglePlay}
                title={isPlaying ? "Pause Music" : "Play NCS Music"}
            >
                {isPlaying ? '⏸' : '🎵'}
            </button>

            {isPlaying && (
                <div className="equalizer">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;
