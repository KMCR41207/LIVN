/**
 * PageCurtain — simple, bulletproof page transition
 * State: idle → covering → revealing → idle
 * Never gets stuck — always cleans up via setTimeout
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const COVER_MS   = 380;
const REVEAL_MS  = 380;
const EASE       = [0.76, 0, 0.24, 1];
const PANEL_BG   = 'linear-gradient(180deg, #1a1208 0%, #2c1f0a 100%)';
const GOLD       = '#d4af37';

const CurtainCtx = createContext(null);
export const useCurtainNavigate = () => useContext(CurtainCtx);

export function PageCurtainProvider({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prevPath  = useRef(location.pathname);
  const timer1    = useRef(null);
  const timer2    = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | covering | revealing

  const clearTimers = () => {
    clearTimeout(timer1.current);
    clearTimeout(timer2.current);
  };

  const curtainNavigate = useCallback((to) => {
    if (!to || to === location.pathname) return;

    clearTimers();
    setPhase('covering');

    // After cover animation → navigate
    timer1.current = setTimeout(() => {
      prevPath.current = to;
      navigate(to);

      // After route mounts → reveal
      timer2.current = setTimeout(() => {
        setPhase('revealing');

        // After reveal → idle
        timer1.current = setTimeout(() => {
          setPhase('idle');
        }, REVEAL_MS + 50);
      }, 60);
    }, COVER_MS + 20);
  }, [navigate, location.pathname]);

  // Safety net: if location changes without curtainNavigate (back/forward/direct URL)
  // just do a quick reveal from idle
  useEffect(() => {
    const next = location.pathname;
    if (next === prevPath.current) return;
    prevPath.current = next;

    // If already animating, don't interfere
    if (phase !== 'idle') return;

    // Quick reveal for browser navigation
    clearTimers();
    setPhase('covering');
    timer1.current = setTimeout(() => {
      setPhase('revealing');
      timer2.current = setTimeout(() => setPhase('idle'), REVEAL_MS + 50);
    }, COVER_MS + 20);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  const isCovering  = phase === 'covering';
  const isRevealing = phase === 'revealing';
  const visible     = phase !== 'idle';

  return (
    <CurtainCtx.Provider value={curtainNavigate}>
      {children}

      {visible && (
        <div
          aria-hidden="true"
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        9999,
            pointerEvents: 'all',
          }}
        >
          {/* Top panel */}
          <motion.div
            key={`top-${phase}`}
            style={{
              position:        'absolute',
              top: 0, left: 0, right: 0,
              height:          '50%',
              background:      PANEL_BG,
              transformOrigin: 'top',
              borderBottom:    `1px solid ${GOLD}55`,
            }}
            initial={{ scaleY: isCovering ? 0 : 1 }}
            animate={{ scaleY: isRevealing ? 0 : 1 }}
            transition={{ duration: (isCovering ? COVER_MS : REVEAL_MS) / 1000, ease: EASE }}
          />

          {/* Bottom panel */}
          <motion.div
            key={`bot-${phase}`}
            style={{
              position:        'absolute',
              bottom: 0, left: 0, right: 0,
              height:          '50%',
              background:      PANEL_BG,
              transformOrigin: 'bottom',
            }}
            initial={{ scaleY: isCovering ? 0 : 1 }}
            animate={{ scaleY: isRevealing ? 0 : 1 }}
            transition={{ duration: (isCovering ? COVER_MS : REVEAL_MS) / 1000, ease: EASE, delay: 0.03 }}
          />

          {/* Wordmark — while covering */}
          {isCovering && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.25 }}
              style={{
                position:      'absolute',
                top: '50%', left: '50%',
                transform:     'translate(-50%, -50%)',
                fontFamily:    "'Cinzel', serif",
                fontSize:      'clamp(1rem, 2.5vw, 1.5rem)',
                fontWeight:    700,
                letterSpacing: '0.35em',
                color:         GOLD,
                textTransform: 'uppercase',
                userSelect:    'none',
                zIndex:        1,
                textShadow:    `0 0 20px ${GOLD}44`,
                whiteSpace:    'nowrap',
              }}
            >
              Livaani
            </motion.span>
          )}
        </div>
      )}
    </CurtainCtx.Provider>
  );
}

export default PageCurtainProvider;

// CurtainLink — drop-in <a> replacement that uses curtain navigation
export function CurtainLink({ to, children, className, style, onClick, ...rest }) {
  const curtainNavigate = useCurtainNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    onClick?.();
    if (curtainNavigate) curtainNavigate(to);
  };
  return (
    <a href={to} className={className} style={style} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
