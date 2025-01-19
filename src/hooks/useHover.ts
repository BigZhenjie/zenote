import { useState, useRef, useEffect } from 'react';

export function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const distanceFromLeft = event.clientX;
      setIsHovered(distanceFromLeft <= 50);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return [ref, isHovered] as const;
}
