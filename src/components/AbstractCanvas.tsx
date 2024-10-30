import React, { useEffect, useRef } from 'react';
import { Rectangle } from '../types/types';

interface AbstractCanvasProps {
  onAnimationChange: () => void;
}

export const AbstractCanvas: React.FC<AbstractCanvasProps> = ({ onAnimationChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true })!;
    let time = 0;
    let lastChange = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const rectangles: Rectangle[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseWidth: Math.random() * 120 + 40,
      baseHeight: Math.random() * 120 + 40,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0002 + Math.random() * 0.0004,
      hueOffset: Math.random() * 360,
      saturation: 60 + Math.random() * 20,
      brightness: 30 + Math.random() * 20,
      brownianX: 0,
      brownianY: 0,
      targetBrownianX: 0,
      targetBrownianY: 0,
      lastBrownianUpdate: 0,
      widthPhase: Math.random() * Math.PI * 2,
      heightPhase: Math.random() * Math.PI * 2,
      widthFreq: 0.0001 + Math.random() * 0.0002,
      heightFreq: 0.0002 + Math.random() * 0.0002,
    }));

    const createEnergyBeam = () => {
      const segments = 2 + Math.floor(Math.random() * 3);
      const points = [];
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      let direction = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < segments; i++) {
        points.push({ x, y });
        const length = 100 + Math.random() * 150;
        
        switch (direction) {
          case 0: x += length; break;
          case 1: y += length; break;
          case 2: x -= length; break;
          case 3: y -= length; break;
        }
        
        direction = (direction + (Math.random() < 0.5 ? 1 : 3)) % 4;
      }
      
      return { 
        points,
        hue: Math.random() * 360,
        birth: time,
        width: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.001
      };
    };

    let energyBeams: any[] = [];
    let particleTrails: any[] = [];

    const createParticleTrail = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      hue: Math.random() * 360,
      birth: time,
      speed: 0.5 + Math.random() * 1,
      angle: Math.random() * Math.PI * 2,
      life: 2000 + Math.random() * 2000
    });

    const updateRectangle = (rect: Rectangle) => {
      if (time - rect.lastBrownianUpdate > 3000) {
        rect.targetBrownianX = (Math.random() - 0.5) * 30;
        rect.targetBrownianY = (Math.random() - 0.5) * 30;
        rect.lastBrownianUpdate = time;
      }

      rect.brownianX += (rect.targetBrownianX - rect.brownianX) * 0.002;
      rect.brownianY += (rect.targetBrownianY - rect.brownianY) * 0.002;

      const widthScale = Math.sin(time * rect.widthFreq + rect.widthPhase) * 0.2 + 0.8;
      const heightScale = Math.sin(time * rect.heightFreq + rect.heightPhase) * 0.2 + 0.8;
      const baseScale = Math.sin(time * rect.speed + rect.phase) * 0.15 + 0.85;

      const currentWidth = rect.baseWidth * widthScale * baseScale;
      const currentHeight = rect.baseHeight * heightScale * baseScale;
      const hue = (time * 0.01 + rect.hueOffset) % 360;

      const gradient = ctx.createRadialGradient(
        rect.x + rect.brownianX, rect.y + rect.brownianY, 0,
        rect.x + rect.brownianX, rect.y + rect.brownianY, currentWidth
      );

      gradient.addColorStop(0, `hsla(${hue}, ${rect.saturation}%, ${rect.brightness}%, 0.15)`);
      gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, ${rect.saturation}%, ${rect.brightness}%, 0.02)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(
        rect.x + rect.brownianX,
        rect.y + rect.brownianY,
        currentWidth / 2,
        currentHeight / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    };

    const drawEnergyBeam = (beam: any) => {
      const age = time - beam.birth;
      const lifespan = 2000;
      const normalizedAge = age / lifespan;
      const pulseEffect = Math.sin(normalizedAge * Math.PI * 8 + beam.pulsePhase) * 0.4 + 0.6;
      const alpha = Math.max(0, (1 - normalizedAge)) * beam.alpha * pulseEffect;
      
      ctx.beginPath();
      ctx.moveTo(beam.points[0].x, beam.points[0].y);
      
      for (let i = 1; i < beam.points.length; i++) {
        ctx.lineTo(beam.points[i].x, beam.points[i].y);
      }
      
      ctx.strokeStyle = `hsla(${beam.hue}, 90%, 65%, ${alpha})`;
      ctx.lineWidth = beam.width * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Inner glow
      ctx.strokeStyle = `hsla(${beam.hue}, 95%, 85%, ${alpha * 0.5})`;
      ctx.lineWidth = beam.width;
      ctx.stroke();

      // Outer glow
      ctx.strokeStyle = `hsla(${beam.hue}, 80%, 45%, ${alpha * 0.2})`;
      ctx.lineWidth = beam.width * 4;
      ctx.stroke();
    };

    const updateParticleTrail = (particle: any) => {
      const age = time - particle.birth;
      const normalizedAge = age / particle.life;
      const alpha = Math.max(0, 1 - normalizedAge);
      
      particle.x += Math.cos(particle.angle) * particle.speed;
      particle.y += Math.sin(particle.angle) * particle.speed;
      
      ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${alpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (timestamp: number) => {
      time = timestamp;
      
      if (timestamp - lastChange > 5000) {
        lastChange = timestamp;
        onAnimationChange();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'screen';

      rectangles.forEach(updateRectangle);

      if (Math.random() < 0.03) {
        energyBeams.push(createEnergyBeam());
      }

      if (Math.random() < 0.1) {
        particleTrails.push(createParticleTrail());
      }

      energyBeams = energyBeams.filter(beam => time - beam.birth < 2000);
      particleTrails = particleTrails.filter(p => time - p.birth < p.life);
      
      particleTrails.forEach(updateParticleTrail);
      energyBeams.forEach(drawEnergyBeam);

      ctx.globalCompositeOperation = 'source-over';
      
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
  }, [onAnimationChange]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        zIndex: 1,
      }}
    />
  );
};