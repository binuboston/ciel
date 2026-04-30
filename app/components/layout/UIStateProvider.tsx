import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lightweight global UI state for which drawer is open. Replaces the legacy
 * Aside.Provider. Centralized so Header buttons, AddToCart, and any other
 * surface can imperatively open the cart, menu, or search.
 */

export type UIDrawer = 'cart' | 'menu' | 'search' | null;

interface UIState {
  drawer: UIDrawer;
  open: (drawer: Exclude<UIDrawer, null>) => void;
  close: () => void;
  toggle: (drawer: Exclude<UIDrawer, null>) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIStateProvider({children}: {children: ReactNode}) {
  const [drawer, setDrawer] = useState<UIDrawer>(null);

  const open = useCallback<UIState['open']>((d) => setDrawer(d), []);
  const close = useCallback(() => setDrawer(null), []);
  const toggle = useCallback<UIState['toggle']>(
    (d) => setDrawer((prev) => (prev === d ? null : d)),
    [],
  );

  const value = useMemo(() => ({drawer, open, close, toggle}), [
    drawer,
    open,
    close,
    toggle,
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIState(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUIState must be used within UIStateProvider');
  }
  return ctx;
}
