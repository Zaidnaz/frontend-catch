"use client";

import { useState, useEffect, useRef } from "react";

const WORDS = ["DATA", "IS", "THE", "NEW", "CURRENCY"];

export default function InteractiveCubes() {
  return (
    <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center py-20 overflow-hidden perspective-container">
      {/* Container for the words */}
      <div className="flex flex-col gap-8 sm:gap-10 z-10">
        {WORDS.map((word, rowIndex) => (
          <div key={rowIndex} className="flex gap-6 sm:gap-8 justify-center">
            {word.split("").map((letter, charIndex) => (
              <FloatingCube 
                key={`${rowIndex}-${charIndex}`} 
                letter={letter} 
              />
            ))}
          </div>
        ))}
      </div>

      {/* Global Styles for this component */}
      <style jsx global>{`
        .perspective-container {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

// --- INDIVIDUAL CUBE COMPONENT ---
function FloatingCube({ letter }: { letter: string }) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  
  // FIX: Start with 0s to avoid Hydration Mismatch
  const [delay, setDelay] = useState("0s");

  useEffect(() => {
    // 1. Set Random Delay ONLY on Client Side
    setDelay(Math.random() * -5 + "s");

    // 2. Mouse tracking logic specific to THIS cube
    const handleMouseMove = (e: MouseEvent) => {
      if (!cubeRef.current) return;

      const rect = cubeRef.current.getBoundingClientRect();
      const cubeCenterX = rect.left + rect.width / 2;
      const cubeCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - cubeCenterX;
      const deltaY = e.clientY - cubeCenterY;

      // Limit max rotation to 45 degrees
      const rotateY = Math.max(-45, Math.min(45, deltaX / 10)); 
      const rotateX = Math.max(-45, Math.min(45, -deltaY / 10));

      cubeRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const triggerFlash = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
  };

  const faceStyle = `absolute inset-0 border border-brand/30 flex items-center justify-center transition-colors duration-300`;
  
  const frontStyle = isFlashing 
    ? "bg-brand text-black shadow-[0_0_40px_#10B981] border-brand" 
    : "bg-surface/90 text-white group-hover:border-brand/60";

  const sideStyle = isFlashing 
    ? "bg-brand/50 border-brand" 
    : "bg-[#050505]/95";

  return (
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 group cursor-pointer" style={{ animation: `float 6s ease-in-out infinite`, animationDelay: delay }}>
      <div
        ref={cubeRef}
        onClick={triggerFlash}
        className="w-full h-full transform-3d transition-transform duration-100 ease-out will-change-transform"
      >
        {/* Front */}
        <div className={`face front ${faceStyle} ${frontStyle} font-bold text-xl sm:text-3xl select-none`}>
          {letter}
        </div>
        
        {/* Back */}
        <div className={`face back ${faceStyle} ${sideStyle}`} />
        
        {/* Right */}
        <div className={`face right ${faceStyle} ${sideStyle}`} />
        
        {/* Left */}
        <div className={`face left ${faceStyle} ${sideStyle}`} />
        
        {/* Top */}
        <div className={`face top ${faceStyle} ${sideStyle}`} />
        
        {/* Bottom */}
        <div className={`face bottom ${faceStyle} ${sideStyle}`} />
      </div>

      <style jsx>{`
        .transform-3d {
          transform-style: preserve-3d;
        }
        .face {
          backface-visibility: hidden; /* Hides insides for cleaner look */
        }

        /* Mobile Sizes */
        .front  { transform: translateZ(24px); }
        .back   { transform: rotateY(180deg) translateZ(24px); }
        .right  { transform: rotateY(90deg) translateZ(24px); }
        .left   { transform: rotateY(-90deg) translateZ(24px); }
        .top    { transform: rotateX(90deg) translateZ(24px); }
        .bottom { transform: rotateX(-90deg) translateZ(24px); }

        /* Desktop Sizes */
        @media (min-width: 640px) {
          .front  { transform: translateZ(32px); }
          .back   { transform: rotateY(180deg) translateZ(32px); }
          .right  { transform: rotateY(90deg) translateZ(32px); }
          .left   { transform: rotateY(-90deg) translateZ(32px); }
          .top    { transform: rotateX(90deg) translateZ(32px); }
          .bottom { transform: rotateX(-90deg) translateZ(32px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}