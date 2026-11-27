'use client';

import { useState } from 'react';

export default function Header() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  return (
    <>
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">🎵</span>
            <span className="font-bold text-base sm:text-lg tracking-tight">Şarkıyı Tahmin Et</span>
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
