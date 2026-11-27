'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type DesignMode = 'classic' | 'spotify' | 'arcade';

const DESIGN_STORAGE_KEY = 'song-guess-design-v2';

type DesignContextValue = {
  designMode: DesignMode;
  toggleDesign: () => void;
};

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [designMode, setDesignMode] = useState<DesignMode>('classic');

  useEffect(() => {
    const saved = window.localStorage.getItem(DESIGN_STORAGE_KEY);
    if (saved === 'spotify' || saved === 'classic' || saved === 'arcade') setDesignMode(saved);
  }, []);

  const value = useMemo(() => ({
    designMode,
    toggleDesign: () => setDesignMode((current) => {
      const next = current === 'classic' ? 'spotify' : current === 'spotify' ? 'arcade' : 'classic';
      window.localStorage.setItem(DESIGN_STORAGE_KEY, next);
      return next;
    }),
  }), [designMode]);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesignMode() {
  const context = useContext(DesignContext);
  if (!context) throw new Error('useDesignMode must be used inside DesignProvider');
  return context;
}

export function DesignShell({ children }: { children: React.ReactNode }) {
  const { designMode } = useDesignMode();
  return <div className={`design-shell min-h-screen flex flex-col ${designMode}-theme`}>{children}</div>;
}
