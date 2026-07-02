import { useRef, useEffect, useCallback } from 'react';
import './LuxuryGlass.css';

/**
 * LuxuryGlass — CSS-based premium frosted glass component.
 * Uses backdrop-filter + custom GLSL-inspired CSS effects with mouse interaction.
 * Graceful fallback for browsers without backdrop-filter support.
 */
const LuxuryGlass = ({
  children,
  className = '',
  intensity = 'medium',  // 'light' | 'medium' | 'heavy'
  goldEdge = true,
  interactive = true,
  style = {},
  as: Tag = 'div',
  ...props
}) => {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      mouseRef.current = { x, y };
      // Subtle highlight shift based on mouse position
      const hx = (x - 0.5) * 12;
      const hy = (y - 0.5) * 8;
      ref.current.style.setProperty('--glass-shine-x', `${50 + hx}%`);
      ref.current.style.setProperty('--glass-shine-y', `${30 + hy}%`);
      ref.current.style.setProperty('--glass-tilt-x', `${hy * 0.4}deg`);
      ref.current.style.setProperty('--glass-tilt-y', `${-hx * 0.4}deg`);
    });
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    // Smooth reset
    ref.current.style.setProperty('--glass-shine-x', '50%');
    ref.current.style.setProperty('--glass-shine-y', '30%');
    ref.current.style.setProperty('--glass-tilt-x', '0deg');
    ref.current.style.setProperty('--glass-tilt-y', '0deg');
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const intensityClass = {
    light: 'glass-light',
    medium: 'glass-medium',
    heavy: 'glass-heavy',
  }[intensity] || 'glass-medium';

  return (
    <Tag
      ref={ref}
      className={`luxury-glass ${intensityClass} ${goldEdge ? 'glass-gold-edge' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--glass-shine-x': '50%',
        '--glass-shine-y': '30%',
        '--glass-tilt-x': '0deg',
        '--glass-tilt-y': '0deg',
        ...style
      }}
      {...props}
    >
      {/* Refraction layer */}
      <div className="glass-refraction" aria-hidden="true" />
      {/* Shine highlight layer */}
      <div className="glass-shine" aria-hidden="true" />
      {/* Edge glow */}
      <div className="glass-edge-glow" aria-hidden="true" />
      {/* Content */}
      <div className="glass-content">
        {children}
      </div>
    </Tag>
  );
};

export default LuxuryGlass;
