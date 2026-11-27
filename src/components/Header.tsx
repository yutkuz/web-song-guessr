'use client';

import { useEffect, useRef, useState } from 'react';
import { useDesignMode } from '@/components/DesignProvider';

export default function Header() {
  const { designMode, toggleDesign } = useDesignMode();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isInfoOpen && !dialog.open) dialog.showModal();
    if (!isInfoOpen && dialog.open) dialog.close();
  }, [isInfoOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080d]/75 backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16">
          <a href="https://github.com/yutkuz/web-song-guessr" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-neutral-400 transition-colors hover:text-white" aria-label="yutkuz GitHub profili">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
            <span className="text-xs font-semibold tracking-wide">yutkuz</span>
          </a>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-emerald-300 text-lg text-[#08080d] shadow-lg shadow-indigo-500/20">♪</span>
            <span className="whitespace-nowrap font-black tracking-tight sm:text-lg">Şarkıyı <span className="text-gradient">Tahmin Et</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDesign}
              aria-label={`Sonraki tasarıma geç (${designMode === 'classic' ? 'Spotify' : designMode === 'spotify' ? 'Arcade' : 'Klasik'})`}
              className="design-switch inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300 transition hover:text-white"
            >
              <span>TIKLA</span>
            </button>
            <button type="button" onClick={() => setIsInfoOpen(true)} aria-label="Nasıl Oynanır?" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[.06] font-bold text-neutral-300 transition hover:border-indigo-400/50 hover:bg-indigo-400/10 hover:text-white">?</button>
          </div>
        </div>
      </header>
      <dialog
        ref={dialogRef}
        aria-labelledby="how-to-play-title"
        onCancel={() => setIsInfoOpen(false)}
        onClose={() => setIsInfoOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsInfoOpen(false);
        }}
        className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl backdrop:bg-black/75"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="how-to-play-title" className="text-lg font-bold">Nasıl Oynanır?</h2>
            <button type="button" onClick={() => setIsInfoOpen(false)} aria-label="Kapat">✕</button>
          </div>
          <p className="text-sm text-neutral-300">Şarkının kısa önizlemesini dinle, arama kutusundan tahminini seç ve üç hakkını kullanmadan doğru parçayı bul.</p>
          <button type="button" onClick={() => setIsInfoOpen(false)} className="w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-neutral-950">Anladım</button>
        </div>
      </dialog>
    </>
  );
}
