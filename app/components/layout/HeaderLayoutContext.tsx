import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {cn} from '~/lib/cn';

const SCROLL_TOP_THRESHOLD = 8;
/** Ignore small scroll deltas so hide/show does not flicker (trackpad / overscroll). */
const SCROLL_DIRECTION_DELTA = 10;

export type HeaderLayoutContextValue = {
  /** Bar slid out of view (scroll down). */
  hidden: boolean;
  /** Past threshold: compact height + glass styling. */
  compact: boolean;
  reduceMotion: boolean;
};

const HeaderLayoutContext = createContext<HeaderLayoutContextValue | null>(null);

export function useHeaderLayout(): HeaderLayoutContextValue {
  const ctx = useContext(HeaderLayoutContext);
  if (ctx) return ctx;
  return {hidden: false, compact: false, reduceMotion: false};
}

function useHeaderLayoutState(): HeaderLayoutContextValue {
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const lastY = lastYRef.current;
        const delta = y - lastY;

        setCompact(y > SCROLL_TOP_THRESHOLD);

        if (y <= SCROLL_TOP_THRESHOLD) {
          setHidden(false);
        } else if (delta < -SCROLL_DIRECTION_DELTA) {
          setHidden(false);
        } else if (delta > SCROLL_DIRECTION_DELTA) {
          setHidden(true);
        }

        lastYRef.current = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return useMemo(
    () => ({hidden, compact, reduceMotion}),
    [hidden, compact, reduceMotion],
  );
}

export function HeaderLayoutProvider({children}: {children: React.ReactNode}) {
  const value = useHeaderLayoutState();
  return (
    <HeaderLayoutContext.Provider value={value}>
      {children}
    </HeaderLayoutContext.Provider>
  );
}

export function HeaderSpacer() {
  const {hidden, compact, reduceMotion} = useHeaderLayout();
  return (
    <div
      aria-hidden
      className={cn(
        'shrink-0 overflow-hidden',
        hidden
          ? 'h-0'
          : compact
            ? 'h-[var(--header-height-compact)]'
            : 'h-[var(--header-height)]',
        !reduceMotion &&
          'transition-[height] duration-200 ease-out motion-reduce:transition-none',
      )}
    />
  );
}
