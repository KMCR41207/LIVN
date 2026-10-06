/**
 * PageCurtain — Premium Livaani page-transition
 *
 * Correct sequence:
 *   1. User clicks a link
 *   2. Curtain panels cover the screen immediately
 *   3. AFTER cover animation completes → route changes
 *   4. Curtain panels reveal the new page
 *
 * Implementation uses a navigation interceptor via context so ALL
 * navigation (Link, useNavigate, back/forward) goes through it.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Timing ────────────────────────────────────────────────────────────────
const COVER_DURATION   = 0.4;   // seconds panels take to cover
const REVEAL_DURATION  = 0.4;   // seconds panels take to reveal
const EASE             = [0.76, 0, 0.24, 1];

// ─── Theme ─────────────────────────────────────────────────────────────────
const PANEL_TOP    = 'linear-gradient(180deg, #1a1208 0%, #2c1f0a 100%)';
const PANEL_BOTTOM = 'linear-gradient(0deg,   #1a1208 0%, #2c1f0a 100%)';
const GOLD         = '#d4af37';

// ─── Context ────────────────────────────────────────────────────────────────
const CurtainContext = createContext(null);

export function useCurtainNavigate() {
  return useContext(CurtainContext);
}

// ─── Provider + Curtain UI ──────────────────────────────────────────────────
export function PageCurtainProvider({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [phase, setPhase] = useState('idle'); // idle | covering | revealing
  const pendingPath      = useRef(null);
  const timerRef         = useRef(null);
  // Flag: set to true only when curtainNavigate initiates a cover.
  // The reveal useEffect checks this before starting a reveal, so that
  // bare React Router navigations (back/forward, plain <Link>) don't
  // trigger a half-open reveal from nowhere.
  const coverInitiated   = useRef(false);

  // Intercept navigation: cover first, then navigate
  const curtainNavigate = useCallback((to, options) => {
    if (typeof to !== 'string') return;
    // Compare against the current pathname only (ignore search/hash for equality)
    if (to === location.pathname) return;

    clearTimeout(timerRef.current);
    pendingPath.current  = { to, options };
    coverInitiated.current = true;        // mark that WE initiated this transition
    setPhase('covering');

    // After cover animation completes → change route
    timerRef.current = setTimeout(() => {
      if (pendingPath.current) {
        const { to: dest, options: opts } = pendingPath.current;
        pendingPath.current = null;
        navigate(dest, opts);
      }
    }, COVER_DURATION * 1000 + 20);
  }, [navigate, location.pathname]);

  // When location changes → start reveal ONLY if we initiated a cover
  useEffect(() => {
    if (phase === 'covering') return; // still covering — wait for the timer above

    if (!coverInitiated.current) return; // navigation was NOT through curtainNavigate — skip
    coverInitiated.current = false;       // consume the flag

    setPhase('revealing');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPhase('idle'), REVEAL_DURATION * 1000 + 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isCovering  = phase === 'covering';
  const isRevealing = phase === 'revealing';
  const isVisible   = phase !== 'idle';

  return (
    <CurtainContext.Provider value={curtainNavigate}>
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="curtain"
            aria-hidden="true"
            style={{
              position:      'fixed',
              inset:         0,
              zIndex:        9999,
              pointerEvents: isVisible ? 'all' : 'none',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {/* Top panel */}
            <motion.div
              style={{
                position:        'absolute',
                top: 0, left: 0, right: 0,
                height:          '50%',
                background:      PANEL_TOP,
                transformOrigin: isCovering ? 'top' : 'top',
              }}
              initial={{ scaleY: isCovering ? 0 : 1 }}
              animate={{ scaleY: isCovering ? 1 : 0 }}
              transition={{ duration: isCovering ? COVER_DURATION : REVEAL_DURATION, ease: EASE }}
            />

            {/* Bottom panel */}
            <motion.div
              style={{
                position:        'absolute',
                bottom: 0, left: 0, right: 0,
                height:          '50%',
                background:      PANEL_BOTTOM,
                transformOrigin: isCovering ? 'bottom' : 'bottom',
                borderTop:       `1px solid ${GOLD}44`,
              }}
              initial={{ scaleY: isCovering ? 0 : 1 }}
              animate={{ scaleY: isCovering ? 1 : 0 }}
              transition={{ duration: isCovering ? COVER_DURATION : REVEAL_DURATION, ease: EASE, delay: 0.03 }}
            />

            {/* Wordmark — only while fully covered */}
            {isCovering && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: COVER_DURATION * 0.7 }}
                style={{
                  position:    'absolute',
                  top: '50%',  left: '50%',
                  transform:   'translate(-50%, -50%)',
                  fontFamily:  "'Cinzel', serif",
                  fontSize:    'clamp(1.1rem, 2.5vw, 1.6rem)',
                  fontWeight:  700,
                  letterSpacing: '0.3em',
                  color:       GOLD,
                  textTransform: 'uppercase',
                  userSelect:  'none',
                  textShadow:  `0 0 24px ${GOLD}55`,
                  zIndex:      1,
                }}
              >
                Livaani
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </CurtainContext.Provider>
  );
}

// ─── CurtainLink — drop-in replacement for react-router <Link> ───────────────
export function CurtainLink({ to, children, className, style, onClick, ...rest }) {
  const curtainNavigate = useCurtainNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    onClick?.();
    curtainNavigate(to);
  };

  return (
    <a href={to} className={className} style={style} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export default PageCurtainProvider;
