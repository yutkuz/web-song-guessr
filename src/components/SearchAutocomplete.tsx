'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '@/types';
import { DEBOUNCE_DELAY } from '@/constants/game';

export interface SearchAutocompleteProps {
  onSelect: (track: Track) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchAutocomplete({
  onSelect,
  disabled = false,
  placeholder = 'Şarkı veya sanatçı adı ara...',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const skipNextSearchRef = useRef<boolean>(false);

  // Şarkı seçildiğinde çalışır
  const handleSelect = useCallback(
    (track: Track) => {
      skipNextSearchRef.current = true;
      setQuery(`${track.artist} - ${track.title}`);
      setIsOpen(false);
      setSelectedIndex(-1);
      onSelect(track);
    },
    [onSelect]
  );

  // Arama inputunu temizleme
  const handleClear = () => {
    if (disabled) return;
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // 300ms Debounce ve AbortController ile arama işlemi
  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      return;
    }

    // Şarkı seçildiğinde oluşan query değişiminde yeni arama yapma
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim();

    // En az 2 karakter girilmediyse arama yapma ve state'i sıfırla
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Arama servisi hatası: ${response.status}`);
        }

        const data: Track[] = await response.json();
        setResults(Array.isArray(data) ? data : []);
        setHasSearched(true);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // Önceki istek iptal edildi
        }
        console.error('Arama hatası:', err);
        setResults([]);
        setHasSearched(true);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, disabled]);

  // Dış tıklama kontrolü (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Klavye navigasyonunda seçili öğeyi görünür alana kaydırma
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement | undefined;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  // Klavye navigasyonu (ArrowDown, ArrowUp, Enter, Escape, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        if (results.length > 0 || query.trim().length >= 2) {
          setIsOpen(true);
        }
        return;
      }
      if (results.length > 0) {
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        if (results.length > 0 || query.trim().length >= 2) {
          setIsOpen(true);
        }
        return;
      }
      if (results.length > 0) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
      }
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Input odaklandığında sonuç varsa dropdown'ı açma
  const handleFocus = () => {
    if (!disabled && query.trim().length >= 2 && (results.length > 0 || hasSearched)) {
      setIsOpen(true);
    }
  };

  // Albüm kapağı yükleme hatası durumunda fallback
  const handleImageError = (trackId: number) => {
    setImageErrors((prev) => ({ ...prev, [trackId]: true }));
  };

  const showDropdown = isOpen && !disabled && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Arama Input Alanı */}
      <div className="relative flex items-center w-full">
        {/* Sol Büyüteç İkonu */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Ana Arama Girişi */}
        <input
          ref={inputRef}
          type="text"
          id="search-autocomplete-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="search-autocomplete-listbox"
          aria-activedescendant={
            selectedIndex >= 0
              ? `search-autocomplete-option-${selectedIndex}`
              : undefined
          }
          aria-label="Şarkı veya sanatçı arama"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`w-full pl-11 pr-10 py-3.5 text-sm sm:text-base rounded-2xl font-normal transition-all duration-200 outline-none ${
            disabled
              ? 'bg-neutral-900/60 border border-neutral-800 text-neutral-500 placeholder-neutral-600 cursor-not-allowed opacity-60'
              : 'bg-[#0b0b14]/90 border border-white/10 text-neutral-100 placeholder-neutral-500 focus:border-indigo-400/70 focus:ring-4 focus:ring-indigo-500/10'
          }`}
        />

        {/* Sağ Durum İkonu: Spinner veya Temizle Butonu */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <div
              className="text-emerald-400 p-1"
              aria-label="Yükleniyor"
              role="status"
            >
              <svg
                className="motion-safe:animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : query && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              aria-label="Aramayı temizle"
              tabIndex={-1}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Otomatik Tamamlama Dropdown Listesi */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-2 max-h-72 sm:max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#141421]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Yükleniyor Durumu (İlk arama sırasında) */}
          {isLoading && results.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2.5 text-neutral-400 text-sm">
              <svg
                className="motion-safe:animate-spin w-4 h-4 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Şarkılar aranıyor...</span>
            </div>
          )}

          {/* Sonuç Bulunamadı Durumu */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="p-4 text-center text-sm">
              <p className="text-neutral-300 font-medium">Sonuç bulunamadı</p>
              <p className="text-xs text-neutral-500 mt-1">
                &ldquo;{query}&rdquo; ile eşleşen bir şarkı veya sanatçı bulunamadı.
              </p>
            </div>
          )}

          {/* Şarkı Sonuçları Listesi */}
          {results.length > 0 && (
            <ul
              ref={listRef}
              id="search-autocomplete-listbox"
              role="listbox"
              aria-label="Şarkı arama sonuçları"
              className="divide-y divide-neutral-800/80 py-1"
            >
              {results.map((track, index) => {
                const isSelected = selectedIndex === index;
                const hasCover =
                  Boolean(track.albumCover) && !imageErrors[track.id];

                return (
                  <li
                    key={track.id}
                    id={`search-autocomplete-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(track)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer select-none transition-colors ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-100 border-l-2 border-emerald-400 pl-3'
                        : 'text-neutral-200 hover:bg-neutral-800/60'
                    }`}
                  >
                    {/* Albüm Kapağı veya Fallback Müzik İkonu */}
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700/50 flex items-center justify-center">
                      {hasCover ? (
                        <img
                          src={track.albumCover}
                          alt={`${track.artist} - ${track.title}`}
                          width={40}
                          height={40}
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(track.id)}
                          loading="lazy"
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-neutral-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 2.21 0 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      )}
                    </div>

                    {/* Şarkı Başlığı ve Sanatçı Adı */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-100 truncate">
                        {track.title}
                      </div>
                      <div className="text-xs text-neutral-400 truncate mt-0.5">
                        {track.artist}
                        {track.album ? (
                          <span className="text-neutral-600"> • {track.album}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Seçili İndikatör / Klavye İpucu */}
                    {isSelected && (
                      <span className="text-[11px] font-mono text-emerald-400/90 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Enter ↵
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
