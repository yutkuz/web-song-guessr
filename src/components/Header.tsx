"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsInfoOpen(false);
      }
    };

    if (isInfoOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInfoOpen]);

  return (
    <>
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Başlık */}
          <Link
            href="/"
            className="flex items-center gap-2 group select-none py-1"
          >
            <span className="text-xl sm:text-2xl transition-transform duration-200 group-hover:scale-110">
              🎵
            </span>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Web Song Guessr
            </span>
          </Link>

          {/* Navigasyon & Yardım */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="flex items-center bg-neutral-950/60 p-1 rounded-xl border border-neutral-800 text-xs sm:text-sm font-medium">
              <Link
                href="/"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all ${
                  pathname === "/"
                    ? "bg-neutral-800 text-emerald-400 font-semibold shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                }`}
              >
                Günün Şarkısı
              </Link>
              <Link
                href="/unlimited"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all ${
                  pathname === "/unlimited"
                    ? "bg-neutral-800 text-emerald-400 font-semibold shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                }`}
              >
                Sınırsız
              </Link>
            </nav>

            {/* Nasıl Oynanır Butonu */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              aria-label="Nasıl Oynanır?"
              title="Nasıl Oynanır?"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="font-bold text-sm sm:text-base">?</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nasıl Oynanır Modalı */}
      {isInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-to-play-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setIsInfoOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-neutral-100 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlığı ve Kapat Butonu */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2
                id="how-to-play-title"
                className="text-lg font-bold flex items-center gap-2"
              >
                <span className="text-xl">❓</span> Nasıl Oynanır?
              </h2>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                aria-label="Kapat"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Oyun Kuralları */}
            <div className="space-y-3.5 text-sm leading-relaxed text-neutral-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  1
                </span>
                <p>
                  1. Şarkının ilk saniyesini dinle ve tahmin et.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  2
                </span>
                <p>
                  2. Yanlış tahmin veya pas geçişte süre artar: 1s → 3s → 10s (toplam 3 aşama).
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  3
                </span>
                <p>
                  3. En az denemede doğru şarkıyı bulmaya çalış!
                </p>
              </div>

              <div className="text-xs text-neutral-400 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/50">
                💡 <strong className="text-neutral-300">İpucu:</strong> Günün Şarkısı modu her gün bir şarkı sunar. Daha fazla pratik yapmak için <strong>Sınırsız</strong> modunu seçebilirsiniz!
              </div>
            </div>

            {/* Aksiyon Butonu */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold transition-colors text-sm cursor-pointer"
            >
              Anladım, Başla!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
