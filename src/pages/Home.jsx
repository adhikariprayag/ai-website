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
                <h1 className="hero-title"><span className="notranslate">Prayag</span> Adhikari</h1>
                <p className="hero-subtitle">Honors CS Student & Creative Developer</p>
            </div>

            <div className="feature-container">
                {/* About Section */}
                <div className="feature-section about-section">
                    <h2 className="feature-title">About Me</h2>
                    <p className="about-text">
                        Honors CS student (GPA: 3.60) with hands-on experience in peer tutoring, academic coaching, and student-facing communication roles. Multilingual communicator (English, Hindi, Nepali, Spanish) with a strong understanding of Caldwell's academic programs, course planning, and campus resources. Passionate about helping peers navigate their college experience and achieve academic success.
                    </p>
                </div>

                {/* Skills Section */}
                <div className="feature-section skills-section">
                    <h2 className="feature-title">Technical & Soft Skills</h2>
                    <div className="skills-grid">
                        <div className="skill-category">
                            <h3>Web & Design Tools</h3>
                            <div className="skill-tags">
                                {['Figma', 'Canva', 'Adobe Photoshop', 'Illustrator', 'InDesign', 'Adobe XD'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Web Development</h3>
                            <div className="skill-tags">
                                {['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'Bootstrap', 'SASS'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>UX/UI Design</h3>
                            <div className="skill-tags">
                                {['Wireframing', 'Prototyping', 'Visual Hierarchy', 'Mobile Responsiveness', 'Accessibility'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Platforms & Tools</h3>
                            <div className="skill-tags">
                                {['WordPress', 'Netlify', 'Render', 'Vercel', 'GitHub', 'Google Workspace'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Collaboration</h3>
                            <div className="skill-tags">
                                {['Communication', 'Creativity', 'Time Management', 'Marketing Support', 'Team Coordination'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Languages</h3>
                            <div className="skill-tags">
                                {['English (Fluent)', 'Hindi (Fluent)', 'Nepali (Native)', 'Spanish (Basic)'].map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
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
