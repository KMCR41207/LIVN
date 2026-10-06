/**
 * PageCurtain — Premium Livaani page-transition component
 * Built with framer-motion (already installed).
 *
 * Sequence:
 *   1. Navigation fires → curtain panels slide IN (cover screen)
 *   2. React Router swaps the route
 *   3. Curtain panels slide OUT (reveal new page)
 *
 * Visual style: ivory/champagne silk panels — luxury editorial fashion
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DURATION   = 0.55;   // seconds per panel animation
const EASE_IN    = [0.76, 0, 0.24, 1];   // sharp easing in
const EASE_OUT   = [0.76, 0, 0.24, 1];

// Livaani design tokens
const PANEL_COLOR_TOP    = '#f4eee0';   // --color-bg-secondary (warm ivory)
const PANEL_COLOR_BOTTOM = '#fdfbf7';   // --color-bg-primary   (cream)
const ACCENT_COLOR       = '#d4af37';   // --color-gold-base

// ---------------------------------------------------------------------------
// Curtain overlay — two panels sliding vertically
// ---------------------------------------------------------------------------
const curtainVariants = {
  initial:  { scaleY: 0 },
  animate:  { scaleY: 1, transition: { duration: DURATION, ease: EASE_IN  } },
  exit:     { scaleY: 0, transition: { duration: DURATION, ease: EASE_OUT, delay: 0.05 } },
};

// ---------------------------------------------------------------------------
// Hook: detect route changes and drive curtain state
// ---------------------------------------------------------------------------
export function usePageCurtain() {
  const location  = useLocation();
  const prevPath  = useRef(location.pathname);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'covering' | 'covered' | 'revealing'

  useEffect(() => {
    const newPath = location.pathname;
    if (newPath === prevPath.current) return;
    prevPath.current = newPath;

    // A real route change happened — animate reveal only
    // (covering is handled by the Link/navigate interception below)
    setPhase('revealing');
    const t = setTimeout(() => setPhase('idle'), DURATION * 1000 + 100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return { phase, setPhase };
}

// ---------------------------------------------------------------------------
// PageCurtainProvider — wraps the app and wires to router
// ---------------------------------------------------------------------------
let _triggerCover = null;

/**
 * Call this from navigation handlers to trigger the cover phase
 * before the route actually changes.
 */
export function triggerCurtainCover() {
  if (_triggerCover) _triggerCover();
}

export function PageCurtain() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase]     = useState('idle'); // 'covering' | 'covered' | 'revealing' | 'idle'
  const location  = useLocation();
  const prevPath  = useRef(location.pathname);
  const timerRef  = useRef(null);

  // Register global trigger
  useEffect(() => {
    _triggerCover = () => {
      clearTimeout(timerRef.current);
      setVisible(true);
      setPhase('covering');
    };
    return () => { _triggerCover = null; };
  }, []);

  // When path changes → start reveal
  useEffect(() => {
    const newPath = location.pathname;
    if (newPath === prevPath.current) return;
    prevPath.current = newPath;

    // If curtain wasn't triggered (direct URL / back/forward), do quick reveal
    if (phase === 'idle') {
      setVisible(true);
      setPhase('covering');
      timerRef.current = setTimeout(() => setPhase('revealing'), DURATION * 1000 + 50);
    } else {
      // Normal flow: covering already happened, now reveal
      timerRef.current = setTimeout(() => setPhase('revealing'), 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // After reveal animation completes → hide curtain entirely
  useEffect(() => {
    if (phase === 'revealing') {
      timerRef.current = setTimeout(() => {
        setPhase('idle');
        setVisible(false);
      }, DURATION * 1000 + 200);
    }
  }, [phase]);

  if (!visible) return null;

  const showing  = phase === 'covering' || phase === 'covered';
  const scaleVal = showing ? 1 : 0;
  const originTop    = showing ? 'bottom' : 'top';
  const originBottom = showing ? 'top'    : 'bottom';

  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        pointerEvents: phase === 'idle' ? 'none' : 'all',
        display:    'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top panel */}
      <motion.div
        style={{
          flex:            '1',
          background:      PANEL_COLOR_TOP,
          transformOrigin: originTop,
          borderBottom:    `1px solid ${ACCENT_COLOR}33`,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: scaleVal }}
        transition={{ duration: DURATION, ease: EASE_IN }}
      />

      {/* Bottom panel */}
      <motion.div
        style={{
          flex:            '1',
          background:      PANEL_COLOR_BOTTOM,
          transformOrigin: originBottom,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: scaleVal }}
        transition={{ duration: DURATION, ease: EASE_IN, delay: 0.04 }}
      />

      {/* Centre wordmark — shown only while fully covered */}
      <AnimatePresence>
        {phase === 'covered' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              position:   'absolute',
              top: '50%', left: '50%',
              transform:  'translate(-50%, -50%)',
              fontFamily: "'Cinzel', serif",
              fontSize:   'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color:      '#2c2c2c',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            Livaani
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PageCurtain;
