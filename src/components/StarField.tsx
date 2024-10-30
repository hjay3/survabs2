import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  size: number;
  brightness: number;
  speed: number;
}

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const stars: Star[] = [];
    const numStars = 400;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStar = (): Star => ({
      x: Math.random() * canvas.width - centerX,
      y: Math.random() * canvas.height - centerY,
      z: Math.random() * 1500 + 500,
      px: 0,
      py: 0,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 0.5 + 0.5,
    });

    for (let i = 0; i < numStars; i++) {
      stars.push(createStar());
    }

    const draw = (timestamp: number) => {
      time = timestamp * 0.0001;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Update star position
        star.z -= star.speed * 2;
        
        if (star.z <= 0) {
          Object.assign(star, createStar());
          star.z = 1500;
        }

        // Calculate projected position
        const scale = 800 / star.z;
        const x = star.x * scale + centerX;
        const y = star.y * scale + centerY;

        // Store previous position for trails
        if (!star.px || !star.py) {
          star.px = x;
          star.py = y;
        }

        // Calculate star properties based on depth
        const depth = Math.max(0, Math.min(1, (1500 - star.z) / 1500));
        const alpha = depth * star.brightness;
        const size = star.size * depth;

        // Draw star trail
        ctx.beginPath();
        ctx.moveTo(star.px, star.py);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(255, 255, ${Math.floor(200 + depth * 55)}, ${alpha * 0.5})`;
        ctx.lineWidth = size * 0.5;
        ctx.stroke();

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, ${Math.floor(200 + depth * 55)}, ${alpha})`;
        ctx.fill();

        // Add subtle glow
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Update previous position
        star.px = x;
        star.py = y;
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 0,
      }}
    />
  );
};