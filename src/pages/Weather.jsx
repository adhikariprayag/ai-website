import React, { useState, useEffect } from 'react';
import './Weather.css';

const Weather = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch weather data");
                    }

                    const data = await response.json();
                    setWeather(data.current_weather);
                } catch (err) {
                    setError("Failed to fetch weather data. Please try again later.");
                    console.error("Weather API error:", err);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError("Unable to retrieve your location. Please allow location access.");
                setLoading(false);
            }
        );
    }, []);

    // Helper to interpret WMO Weather interpretation codes (WW)
    const getWeatherDescription = (code) => {
        const codes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            95: 'Thunderstorm',
        };
        return codes[code] || 'Unknown';
    };

    if (loading) return (
        <div className="page-content animate-fade-in">
            <div className="weather-container">
                <div className="weather-loading">Loading weather data...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="page-content animate-fade-in">
            <div className="weather-container">
                <div className="weather-error">{error}</div>
            </div>
        </div>
    );

    return (
        <div className="page-content animate-fade-in">
            <div className="weather-container">
                <div className="weather-card">
                    <div className="weather-header">
                        <h1>Current Weather</h1>
                        <p>{getWeatherDescription(weather.weathercode)}</p>
                    </div>

                    <div className="temperature-display">
                        {Math.round(weather.temperature)}°C
                    </div>

                    <div className="weather-details">
                        <div className="detail-item">
                            <span className="detail-label">Wind Speed</span>
                            <span className="detail-value">{weather.windspeed} km/h</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Wind Direction</span>
                            <span className="detail-value">{weather.winddirection}°</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Weather;
