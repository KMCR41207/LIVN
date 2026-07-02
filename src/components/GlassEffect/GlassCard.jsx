import { useRef, useCallback, useEffect } from 'react';
import './GlassCard.css';

/**
 * GlassCard — Self-contained luxury glass panel.
 * Uses CSS backdrop-filter + pseudo-element shimmer
 * with mouse-reactive specular highlight.
 *
 * Props:
 *  variant   : 'hero' | 'cta' | 'collection' | 'nav' | 'modal' | 'booking' | 'product' | 'panel'
 *  dark      : bool — use dark glass (for light backgrounds)
 *  padding   : string — CSS padding override
 *  className : extra classes
 *  children  : content
 */
const GlassCard = ({
  children,
  variant = 'hero',
  dark = false,
  padding,
  className = '',
  style = {},
  as: Tag = 'div',
  ...props
}) => {
  const cardRef = useRef(null);
  const rafRef  = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;

      // Tilt — very subtle 3D depth
      const tx = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * 3;
      const ty = ((e.clientX - rect.left - rect.width  / 2) / rect.width ) * -3;

      el.style.setProperty('--gx', `${x}%`);
      el.style.setProperty('--gy', `${y}%`);
      el.style.setProperty('--rx', `${tx}deg`);
      el.style.setProperty('--ry', `${ty}deg`);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    el.style.setProperty('--gx', '50%');
    el.style.setProperty('--gy', '30%');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Tag
      ref={cardRef}
      className={[
        'gc',
        `gc--${variant}`,
        dark ? 'gc--dark' : 'gc--light',
        className
      ].join(' ')}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--gx': '50%',
        '--gy': '30%',
        '--rx': '0deg',
        '--ry': '0deg',
        padding: padding || undefined,
        ...style
      }}
      {...props}
    >
      {/* Frosted background */}
      <span className="gc__frost"    aria-hidden="true" />
      {/* Specular shine */}
      <span className="gc__shine"    aria-hidden="true" />
      {/* Gold rim */}
      <span className="gc__rim"      aria-hidden="true" />
      {/* Content */}
      <span className="gc__content">{children}</span>
    </Tag>
  );
};

export default GlassCard;
