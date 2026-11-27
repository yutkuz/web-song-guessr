'use client';

import { useState } from 'react';

export default function Header() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  return (
    <>
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16">
          <a href="https://github.com/yutkuz/web-song-guessr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neutral-300 transition-colors hover:text-white" aria-label="yutkuz GitHub profili">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
            <span className="text-sm font-semibold">yutkuz</span>
          </a>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-white">
            <span className="text-2xl">🎵</span>
            <span className="whitespace-nowrap font-bold text-base tracking-tight sm:text-lg">Şarkıyı Tahmin Et</span>
          </div>
          <button type="button" onClick={() => setIsInfoOpen(true)} aria-label="Nasıl Oynanır?" className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold">?</button>
        </div>
      </header>
      {isInfoOpen && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/75" onClick={() => setIsInfoOpen(false)}>
        <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 space-y-4" onClick={(event) => event.stopPropagation()}>
          <div className="flex justify-between items-center"><h2 className="text-lg font-bold">Nasıl Oynanır?</h2><button onClick={() => setIsInfoOpen(false)} aria-label="Kapat">✕</button></div>
          <p className="text-sm text-neutral-300">Şarkının kısa önizlemesini dinle, arama kutusundan tahminini seç ve üç hakkını kullanmadan doğru parçayı bul.</p>
          <button onClick={() => setIsInfoOpen(false)} className="w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-neutral-950">Anladım</button>
        </div>
      </div>}
    </>
  );
}
