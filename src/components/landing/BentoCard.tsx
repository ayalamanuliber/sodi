"use client";

import { useRef } from "react";

export function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`bento-card ${className}`}>
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}
