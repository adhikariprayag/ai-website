import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CursorParticles.css';

const CursorParticles = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const createParticle = (x, y) => {
            const size = Math.random() * 5 + 2;
            const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
            const speedX = (Math.random() - 0.5) * 2;
            const speedY = (Math.random() - 0.5) * 2;
            const life = 1;

            return { x, y, size, color, speedX, speedY, life };
        };

        const updateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    i--;
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(updateParticles);
        };

        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            for (let i = 0; i < 5; i++) {
                particles.current.push(createParticle(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        updateParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="cursor-canvas" />;
};

export default CursorParticles;
