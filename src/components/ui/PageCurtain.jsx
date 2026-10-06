/**
 * PageCurtain — Premium Livaani page-transition
 * Single elegant sweep: panels slide down over screen, then slide back up.
 * Total duration ~600ms. Triggers once per route change.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DURATION  = 0.45;  // seconds for each panel move
const EASE      = [0.76, 0, 0.24, 1];

// Livaani design tokens
const COLOR_A = '#f4eee0'; // warm ivory
const COLOR_B = '#fdfbf7'; // cream
const GOLD    = '#d4af37';

export function PageCurtain() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [active, setActive]   = useState(false);
  const timerRef              = useRef(null);

  useEffect(() => {
    const next = location.pathname;
    if (next === prevPath.current) return;
    prevPath.current = next;

    // Clear any running timer
    clearTimeout(timerRef.current);

    // Show curtain
    setActive(true);

    // After cover + hold + reveal duration, hide
    // cover: DURATION, hold: 0.1s, reveal: DURATION
    timerRef.current = setTimeout(() => {
      setActive(false);
    }, (DURATION * 2 + 0.15) * 1000);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="curtain"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column',
          }}
          // Whole container fades in/out to avoid abrupt cut
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, delay: DURATION } }}
        >
          {/* Top panel — slides down from top */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '50%',
              background: COLOR_A,
              transformOrigin: 'top',
              borderBottom: `1px solid ${GOLD}44`,
            }}
            initial={{ scaleY: 0 }}
            animate={{
              scaleY: [0, 1, 1, 0],
              transition: {
                duration: DURATION * 2 + 0.15,
                times: [0, 0.42, 0.58, 1],
                ease: EASE,
              },
            }}
          />

          {/* Bottom panel — slides up from bottom */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '50%',
              background: COLOR_B,
              transformOrigin: 'bottom',
            }}
            initial={{ scaleY: 0 }}
            animate={{
              scaleY: [0, 1, 1, 0],
              transition: {
                duration: DURATION * 2 + 0.15,
                times: [0, 0.42, 0.58, 1],
                ease: EASE,
                delay: 0.03,
              },
            }}
          />

          {/* Livaani wordmark — visible only while fully covered */}
          <motion.span
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: 700,
              letterSpacing: '0.3em',
              color: '#2c2c2c',
              textTransform: 'uppercase',
              userSelect: 'none',
              zIndex: 1,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0, 1, 1, 0],
              transition: {
                duration: DURATION * 2 + 0.15,
                times: [0, 0.38, 0.48, 0.58, 0.72],
              },
            }}
          >
            Livaani
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageCurtain;
