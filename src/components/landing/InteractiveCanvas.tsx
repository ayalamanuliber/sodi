"use client";

import { useEffect, useRef } from "react";

export function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 200 };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;
      baseX: number;
      baseY: number;
      density: number;

      constructor(x: number, y: number, dx: number, dy: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = dx;
        this.directionY = dy;
        this.size = size;
        this.color = color;
        this.baseX = x;
        this.baseY = y;
        this.density = Math.random() * 20 + 1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }

      update() {
        if (this.x > canvas!.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas!.height || this.y < 0) this.directionY = -this.directionY;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * this.density * 0.5;
          this.y -= (dy / distance) * force * this.density * 0.5;
        } else {
          if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
          if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
        }

        this.x += this.directionX * 0.3;
        this.y += this.directionY * 0.3;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const divider = window.innerWidth < 768 ? 25000 : 18000;
      const count = (canvas!.width * canvas!.height) / divider;
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const x = Math.random() * canvas!.width;
        const y = Math.random() * canvas!.height;
        const dx = (Math.random() - 0.5) * 0.4;
        const dy = (Math.random() - 0.5) * 0.4;
        const color = Math.random() > 0.85 ? "rgba(0,255,163,0.5)" : "rgba(255,255,255,0.15)";
        particles.push(new Particle(x, y, dx, dy, size, color));
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dist =
            (particles[a].x - particles[b].x) ** 2 + (particles[a].y - particles[b].y) ** 2;
          const threshold = (canvas!.width / 8) * (canvas!.height / 8);
          if (dist < threshold) {
            ctx!.strokeStyle = `rgba(255,255,255,${(1 - dist / 15000) * 0.08})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => p.update());
      connect();
    };

    const resize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      init();
    };

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-screen"
    />
  );
}
