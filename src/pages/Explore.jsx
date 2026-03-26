import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { getMusicForCountry } from '../services/culturalMusic';
import './Explore.css';

const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info, error });
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', background: '#8b0000', padding: '2rem', height: '100vh', width: '100vw', overflow: 'auto', zIndex: 9999, position: 'fixed', top: 0, left: 0, fontFamily: 'monospace' }}>
          <h2>Fatal React Crash</h2>
          <p style={{fontSize: '1.2rem'}}>{this.state.error?.toString()}</p>
          <pre style={{whiteSpace: 'pre-wrap', marginTop: '1rem', background: 'rgba(0,0,0,0.5)', padding: '1rem'}}>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Explore = () => {
    const globeEl = useRef();
    const audioRef = useRef(null);

    const [countries, setCountries] = useState({ features: [] });
    const [activeCountry, setActiveCountry] = useState(null);
    const [hoverD, setHoverD] = useState(null); // RESTORED HOVER STATE
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingMusic, setIsLoadingMusic] = useState(false);
    
    // Track List State
    const [trackList, setTrackList] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [hasClicked, setHasClicked] = useState(false);

    // Audio Scrubber State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(30);

    const currentTrack = trackList[currentTrackIndex];

    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600
    });

    useEffect(() => {
        const handleResize = () => {
             setDimensions({
                 width: window.innerWidth,
                 height: window.innerHeight
             });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => console.error("Error loading GeoJSON", err));
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;

            const scene = globeEl.current.scene();
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
        }
    }, [countries]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    const handlePolygonClick = async (polygon) => {
        const countryName = polygon.properties.ADMIN;
        setActiveCountry(countryName);
        setHasClicked(true);
        setIsLoadingMusic(true);
        setIsPlaying(false);
        setCurrentTime(0);

        if (audioRef.current) audioRef.current.pause();

        const tracks = await getMusicForCountry(countryName);
        setTrackList(tracks);
        setCurrentTrackIndex(0);
        setIsLoadingMusic(false);

        if (tracks.length > 0) {
            playTrack(tracks[0]);
        }
    };

    const playTrack = (track) => {
        setCurrentTime(0);
        if (audioRef.current && track.previewUrl) {
            audioRef.current.src = track.previewUrl;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current && currentTrack?.previewUrl) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        if (currentTrackIndex < trackList.length - 1) {
            const nextIdx = currentTrackIndex + 1;
            setCurrentTrackIndex(nextIdx);
            playTrack(trackList[nextIdx]);
        }
    };

    const prevTrack = () => {
        if (currentTrackIndex > 0) {
            const prevIdx = currentTrackIndex - 1;
            setCurrentTrackIndex(prevIdx);
            playTrack(trackList[prevIdx]);
        }
    };

    const handleAudioEnded = () => {
        if (currentTrackIndex < trackList.length - 1) {
            nextTrack();
        } else {
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleScrub = (e) => {
        const newTime = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Memoize the polygon hover logic to prevent lag spikes
    const getPolygonColor = useCallback((d) => {
        if (d === hoverD) return 'rgba(255, 255, 255, 0.6)';
        if (d.properties.ADMIN === activeCountry) return 'rgba(0, 255, 128, 0.8)';
        return 'rgba(200, 200, 200, 0.1)';
    }, [activeCountry, hoverD]);

    const getPolygonAltitude = useCallback((d) => {
        return d === hoverD ? 0.12 : 0.06;
    }, [hoverD]);

    return (
        <ErrorBoundary>
        <div className="explore-container">
            <div className="explore-header">
                <h1>Explore the World</h1>
                <p>Click any country to discover its music instantly.</p>
            </div>

            <audio 
                ref={audioRef} 
                onEnded={handleAudioEnded}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                style={{ display: 'none' }}
                preload="auto"
            />

            <div className="globe-wrapper">
                <Globe
                    ref={globeEl}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    polygonsData={countries.features}
                    polygonAltitude={getPolygonAltitude}
                    polygonCapColor={getPolygonColor}
                    polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
                    polygonStrokeColor={() => '#111'}
                    onPolygonHover={setHoverD}
                    onPolygonClick={handlePolygonClick}
                    width={dimensions.width}
                    height={dimensions.height}
                />
            </div>

            {hasClicked && (
                <div className="global-music-player">
                    {isLoadingMusic && <div className="loading-spinner">Fetching tracks...</div>}
                    
                    {!isLoadingMusic && currentTrack && (
                        <>
                            {currentTrack.art ? (
                                <img src={currentTrack.art} alt="Album Art" className={`player-art ${isPlaying ? '' : 'paused'}`} />
                            ) : (
                                <div className={`player-art ${isPlaying ? '' : 'paused'}`} style={{background: '#0055ff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem'}}>🎵</div>
                            )}
                            
                            <div className="player-body">
                                <div className="player-info">
                                    <div className="track-title">{currentTrack.title}</div>
                                    <div className="track-artist">{currentTrack.artist}</div>
                                </div>
                                
                                <div className="player-scrubber">
                                    <span className="time">{duration === Infinity ? 'LIVE' : formatTime(currentTime)}</span>
                                    <input 
                                        type="range" 
                                        className="progress-slider"
                                        min="0" 
                                        max={duration === Infinity ? 100 : (duration || 30)} 
                                        step="0.1"
                                        value={duration === Infinity ? 100 : currentTime} 
                                        onChange={handleScrub} 
                                        disabled={!currentTrack.previewUrl || duration === Infinity}
                                    />
                                    <span className="time">{duration === Infinity ? '∞' : formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="player-controls">
                                <button className="ctrl-btn" onClick={prevTrack} disabled={currentTrackIndex === 0}>⏮</button>
                                <button className="play-pause-btn" onClick={togglePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
                                <button className="ctrl-btn" onClick={nextTrack} disabled={currentTrackIndex === trackList.length - 1}>⏭</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Bottom Right Country Name Display */}
            {activeCountry && (
                <div className="bottom-right-country">
                    <h2>{activeCountry}</h2>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
};

export default Explore;
