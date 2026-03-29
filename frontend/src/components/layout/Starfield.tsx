"use client";

import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random(),
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#e8f4fd'; // Star color

      stars.forEach((star) => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move star up
        star.y -= star.speed;
        
        // Twinkle slightly
        star.opacity += (Math.random() - 0.5) * 0.1;
        if (star.opacity < 0.1) star.opacity = 0.1;
        if (star.opacity > 1) star.opacity = 1;

        // Reset if out of bounds
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none opacity-50 block bg-[#020408]"
    />
  );
}
