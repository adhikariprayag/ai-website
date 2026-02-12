import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                setLocationError("Unable to retrieve your location. Please allow location access.");
                console.error("Location error:", error);
            }
        );
    }, []);

    return (
        <div className="page-content animate-fade-in">
            <div className="hero-section">
                <h1 className="hero-title">Creative Developer <br /> & Designer</h1>
                <p className="hero-subtitle">Building digital experiences that matter.</p>
            </div>

            <div className="feature-container">
                {/* Animal Video Section */}
                <div className="feature-section">
                    <h2 className="feature-title">Meme here ;)</h2>
                    <div className="video-wrapper">
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/J---aiyznGQ"
                            title="Keyboard Cat"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* Google Map Section */}
                <div className="feature-section">
                    <h2 className="feature-title">Your Location 📍</h2>
                    {locationError ? (
                        <div className="location-error">
                            <p>{locationError}</p>
                        </div>
                    ) : location ? (
                        <div className="map-wrapper">
                            <iframe
                                title="User Location"
                                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                                loading="lazy"
                            ></iframe>
                        </div>
                    ) : (
                        <div className="loading-location">
                            <p>Locating you...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
