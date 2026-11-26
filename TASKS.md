# 🎵 Web Song Guessr — Görev Planı

**Repo:** <https://github.com/yutkuz/web-song-guessr>
**Branch:** `main`
**Teknoloji:** Next.js (App Router) · TypeScript · Tailwind CSS
**Kural:** Sıfır gereksiz bağımlılık — yalnızca yerleşik Web API'leri (HTMLAudioElement, requestAnimationFrame, fetch, localStorage, navigator.clipboard)

---

## Klasör Yapısı (Hedef)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── unlimited/
│   │   └── page.tsx
│   └── api/
│       ├── search/
│       │   └── route.ts
│       └── daily-tracks/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── ProgressBar.tsx
│   ├── SearchAutocomplete.tsx
│   ├── GuessHistory.tsx
│   ├── GameControls.tsx
│   └── ResultScreen.tsx
├── hooks/
│   ├── useAudioPlayer.ts
│   └── useGameState.ts
├── services/
│   └── statistics.ts
├── types/
│   └── index.ts
└── constants/
    └── game.ts
```

---

## Görevler

### Kategori 1 — Proje İskeleti ve Yapılandırma

#### TASK-01: Next.js Proje Kurulumu
- **Dosyalar:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- **Kabul Kriterleri:**
  - [x] `npm install && npm run dev` hatasız çalışır
  - [x] Tailwind CSS sınıfları render edilir
  - [x] App Router aktif (`src/app/` dizini kullanılıyor)
  - [x] `src/components/`, `src/hooks/`, `src/services/`, `src/types/`, `src/constants/` dizinleri oluşturulmuş
  - [x] `.gitignore` dosyasında `node_modules/`, `.next/`, `.env*.local` var
- **Bağımlılıklar:** Yok
- **Durum:** [x] Tamamlandı

---

### Kategori 2 — Temel Veri Tipleri ve Sabitler

#### TASK-02: TypeScript Tip Tanımları ve Oyun Sabitleri
- **Dosyalar:** `src/types/index.ts`, `src/constants/game.ts`
- **Kabul Kriterleri:**
  - [x] `Track` interface'i: `id`, `title`, `artist`, `album`, `albumCover`, `previewUrl` alanları
  - [x] `Stage` type: aşama numarası ve süresi
  - [x] `GuessResult` type: `'correct' | 'wrong' | 'skipped' | 'pending'`
  - [x] `GameState` interface: `currentStage`, `guesses`, `status`, `track` vb.
  - [x] `GameStats` interface: `gamesPlayed`, `gamesWon`, `streak`, `maxStreak`, `distribution`
  - [x] `STAGE_DURATIONS` sabiti: `[1, 3, 10]`
  - [x] `MAX_STAGES` sabiti: `3`
  - [x] `PREVIEW_DURATION` sabiti: `30` (saniye)
  - [x] `DEBOUNCE_DELAY` sabiti: `300` (ms)
- **Bağımlılıklar:** TASK-01
- **Durum:** [x] Tamamlandı

---

### Kategori 3 — API Route'ları

#### TASK-03: Arama API Route Handler (`/api/search`)
- **Dosyalar:** `src/app/api/search/route.ts`
- **Kabul Kriterleri:**
  - [x] `GET /api/search?q=...` Deezer API'ye proxy yaparak sonuçları döner
  - [x] Yanıt `Track[]` formatında (tip tanımlarıyla uyumlu)
  - [x] Boş veya eksik `q` parametresinde uygun hata yanıtı (400)
  - [x] Deezer API hatası durumunda uygun hata yanıtı (502)
  - [x] Yalnızca `previewUrl`'si olan sonuçlar filtrelenir
  - [x] CORS bypass sağlanır (sunucu tarafında fetch)
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

#### TASK-04: Günlük Şarkı API Route Handler (`/api/daily-tracks`)
- **Dosyalar:** `src/app/api/daily-tracks/route.ts`
- **Kabul Kriterleri:**
  - [x] `GET /api/daily-tracks` günün tarihine göre deterministik şarkı döner
  - [x] Aynı gün içindeki tüm isteklerde aynı şarkı gelir
  - [x] Farklı günlerde farklı şarkı gelir
  - [x] Yanıt `Track` formatında
  - [x] Deezer chart/playlist'inden seçim yapılır
  - [x] `previewUrl`'si olmayan şarkılar atlanır
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

---

### Kategori 4 — localStorage İstatistik Servisi

#### TASK-05: İstatistik Servisi
- **Dosyalar:** `src/services/statistics.ts`
- **Kabul Kriterleri:**
  - [x] `getStats()`: localStorage'dan `GameStats` okur
  - [x] `saveGameResult()`: oyun sonucunu kaydeder (kazanma/kaybetme, aşama bilgisi)
  - [x] `resetStats()`: istatistikleri sıfırlar
  - [x] Streak (seri) hesaplaması doğru çalışır
  - [x] Dağılım (distribution) her aşama için kazanma sayısını tutar
  - [x] İlk kullanımda varsayılan değerlerle başlar
  - [x] Daily ve Unlimited modlar için ayrı istatistik anahtarları
  - [x] Tip güvenliği sağlanır (`GameStats` interface'i kullanılır)
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

---

### Kategori 5 — useAudioPlayer Hook

#### TASK-06: useAudioPlayer Hook
- **Dosyalar:** `src/hooks/useAudioPlayer.ts`
- **Kabul Kriterleri:**
  - [x] `HTMLAudioElement` kullanılır (Howler.js yasak)
  - [x] `play()` çağrıldığında ses her zaman `0.0s`'den başlar
  - [x] `requestAnimationFrame` döngüsü ile anlık pozisyon takibi
  - [x] Aktif aşamanın süre sınırına ulaşıldığında ses otomatik durur
  - [x] `timeupdate` eventi kullanılmaz, yalnızca `requestAnimationFrame`
  - [x] Component unmount olduğunda ses ve RAF döngüsü temizlenir
  - [x] Ses yalnızca kullanıcı etkileşimiyle başlar (autoplay yasağına uyum)
  - [x] Dışa açılan API: `play()`, `stop()`, `currentTime`, `isPlaying`, `loadTrack(url)`
  - [x] 30 saniyelik önizleme çalma desteği (doğru tahmin sonrası)
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

---

### Kategori 6 — UI Bileşenleri

#### TASK-07: Progress Bar Bileşeni
- **Dosyalar:** `src/components/ProgressBar.tsx`
- **Kabul Kriterleri:**
  - [x] Toplam 10 saniyelik çubuk
  - [x] 1s, 3s, 10s noktalarında görsel ayraçlar (divider)
  - [x] Aktif aşama vurgulanır
  - [x] Anlık dolum animasyonu (`currentTime` prop'u ile)
  - [x] Responsive tasarım (mobil ve masaüstü)
  - [x] CSS değişkenleri ile tema uyumu
  - [x] Tailwind CSS kullanılır
- **Bağımlılıklar:** TASK-02, TASK-06
- **Durum:** [x] Tamamlandı

#### TASK-08: Arama ve Otomatik Tamamlama Bileşeni
- **Dosyalar:** `src/components/SearchAutocomplete.tsx`
- **Kabul Kriterleri:**
  - [x] 300ms debounce ile arama (`setTimeout` / `clearTimeout`)
  - [x] `/api/search` endpoint'inden sonuç çeker
  - [x] Dropdown'da şarkı adı ve sanatçı gösterilir
  - [x] Klavye navigasyonu (↑ ↓ Enter Escape)
  - [x] Şarkı seçildiğinde `onSelect(track)` callback'i çağrılır
  - [x] Boş sonuçta "Sonuç bulunamadı" mesajı
  - [x] Loading durumu göstergesi
  - [x] Dış tıklamada dropdown kapanır
- **Bağımlılıklar:** TASK-02, TASK-03
- **Durum:** [x] Tamamlandı

#### TASK-09: Tahmin Listesi ve Aşama Göstergesi Bileşeni
- **Dosyalar:** `src/components/GuessHistory.tsx`
- **Kabul Kriterleri:**
  - [x] 3 aşamayı listeler
  - [x] Doğru tahmin → yeşil (🟩) gösterim
  - [x] Yanlış tahmin → kırmızı (🟥) gösterim + tahmin edilen şarkı adı
  - [x] Atlanan aşama → gri (⬜) gösterim
  - [x] Bekleyen aşama → nötr gösterim
  - [x] Tailwind CSS ile stillendirilmiş
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

#### TASK-10: Oyun Kontrol Butonları Bileşeni
- **Dosyalar:** `src/components/GameControls.tsx`
- **Kabul Kriterleri:**
  - [x] "Oynat" butonu → `onPlay()` callback
  - [x] "Atla" butonu → `onSkip()` callback
  - [x] "Tahmin Et" butonu → `onGuess()` callback
  - [x] Oyun durumuna göre buton aktif/pasif (disabled) durumları
  - [x] Oyun bittiyse butonlar gizlenir veya devre dışı kalır
  - [x] Kullanıcı dostu Türkçe etiketler
  - [x] Tailwind CSS ile stillendirilmiş
- **Bağımlılıklar:** TASK-02
- **Durum:** [x] Tamamlandı

---

### Kategori 7 — Layout ve Navigasyon

#### TASK-11: Layout, Header ve Navigasyon
- **Dosyalar:** `src/components/Header.tsx`, `src/app/layout.tsx` (güncelleme)
- **Kabul Kriterleri:**
  - [x] Uygulama başlığı: "Web Song Guessr" (veya Türkçe karşılığı)
  - [x] Günün Şarkısı / Sınırsız mod geçiş linkleri
  - [x] Aktif mod vurgulanır
  - [x] Responsive header (mobil hamburger menü veya kompakt tasarım)
  - [x] Layout'ta global font ve meta tag'ler
  - [x] Türkçe `lang="tr"` attribute
- **Bağımlılıklar:** TASK-01
- **Durum:** [x] Tamamlandı

---

### Kategori 8 — Sonuç Ekranı

#### TASK-12: Sonuç Ekranı Bileşeni
- **Dosyalar:** `src/components/ResultScreen.tsx`
- **Kabul Kriterleri:**
  - [x] Albüm kapağı görseli (`<img>` ile, `aspect-ratio` kullanımı)
  - [x] Şarkı adı ve sanatçı bilgisi
  - [x] Oyun istatistikleri (toplam oyun, kazanma oranı, seri)
  - [x] Emoji tablosu: 🟩 (doğru), 🟥 (yanlış), ⬜ (atlandı) formatında
  - [x] "Panoya Kopyala" butonu (`navigator.clipboard.writeText`)
  - [x] Doğru tahmin durumunda 30 saniyelik önizleme çalar
  - [x] Kazanma / kaybetme durumuna göre farklı mesajlar
  - [x] Tailwind CSS ile stillendirilmiş
- **Bağımlılıklar:** TASK-05, TASK-06
- **Durum:** [x] Tamamlandı

---

### Kategori 9 — Ana Oyun Sayfaları

#### TASK-13: useGameState Hook ve Ana Oyun Sayfası (Günün Şarkısı)
- **Dosyalar:** `src/hooks/useGameState.ts`, `src/app/page.tsx` (güncelleme)
- **Kabul Kriterleri:**
  - [x] `useGameState` hook: oyun durumu yönetimi (stage geçişi, tahmin, atlama, kazanma/kaybetme)
  - [x] Sayfa yüklendiğinde `/api/daily-tracks`'ten günlük şarkı çekilir
  - [x] Tüm bileşenler entegre edilir: ProgressBar, SearchAutocomplete, GuessHistory, GameControls, ResultScreen
  - [x] Oyun akışı: Oynat → (Tahmin Et | Atla) → Sonraki aşama veya sonuç
  - [x] Doğru tahmin → oyun kazanılır, sonuç ekranı gösterilir
  - [x] 3 aşama tükenirse → oyun kaybedilir, sonuç ekranı gösterilir
  - [x] Oyun sonucu `statistics` servisine kaydedilir
  - [x] Aynı gün tekrar girildiğinde daha önce oynandıysa sonuç gösterilir (localStorage)
- **Bağımlılıklar:** TASK-03, TASK-04, TASK-05, TASK-06, TASK-07, TASK-08, TASK-09, TASK-10, TASK-11, TASK-12
- **Durum:** [x] Tamamlandı

#### TASK-14: Sınırsız Mod Sayfası
- **Dosyalar:** `src/app/unlimited/page.tsx`
- **Kabul Kriterleri:**
  - [x] Rastgele şarkı seçimi (Deezer chart/playlist'inden)
  - [x] Oyun bileşenlerini yeniden kullanır (aynı UI)
  - [x] "Yeni Oyun" butonu ile sürekli oynanabilir
  - [x] Ayrı istatistik kaydı (`unlimited` anahtarı)
  - [x] Günün Şarkısı moduna dönüş linki
- **Bağımlılıklar:** TASK-13
- **Durum:** [x] Tamamlandı

---

### Kategori 10 — Tema ve Responsive Tasarım

#### TASK-15: Koyu Tema ve Responsive Düzenlemeler
- **Dosyalar:** `src/app/globals.css` (güncelleme), `tailwind.config.ts` (güncelleme), ilgili bileşenler
- **Kabul Kriterleri:**
  - [x] Koyu tema varsayılan (`dark` class veya `prefers-color-scheme`)
  - [x] CSS değişkenleri ile renk paleti tanımlı
  - [x] Mobil öncelikli responsive tasarım
  - [x] CSS Grid ve Flexbox kullanımı
  - [x] 320px'den 1440px'e kadar uyumlu görünüm
  - [x] Tailwind breakpoint'leri doğru kullanılıyor
  - [x] Tüm bileşenlerde tutarlı görsel dil
- **Bağımlılıklar:** TASK-13, TASK-14
- **Durum:** [x] Tamamlandı

---

### Kategori 11 — Entegrasyon ve Son Kontrol

#### TASK-16: Entegrasyon Testi ve Hata Düzeltme
- **Dosyalar:** Çeşitli (mevcut dosyalarda düzeltmeler)
- **Kabul Kriterleri:**
  - [x] Tam oyun akışı çalışır: Günün Şarkısı modu baştan sona
  - [x] Tam oyun akışı çalışır: Sınırsız mod baştan sona
  - [x] Ses doğru çalıyor: 0.0s'den başlıyor, aşama sınırında duruyor
  - [x] Progress bar ses ile senkronize
  - [x] Arama ve otomatik tamamlama çalışıyor
  - [x] İstatistikler localStorage'da doğru kaydediliyor
  - [x] Emoji paylaşımı ve panoya kopyalama çalışıyor
  - [x] `npm run build` hatasız tamamlanır
  - [x] Konsolda hata yok
  - [x] Yasaklı bağımlılık yok (`package.json` kontrolü)
  - [x] Tüm metinler Türkçe
- **Bağımlılıklar:** TASK-15
- **Durum:** [x] Tamamlandı

---

## Bağımlılık Grafiği

```
TASK-01 (Proje Kurulumu)
├── TASK-02 (Tipler & Sabitler)
│   ├── TASK-03 (Search API)         ─┐
│   ├── TASK-04 (Daily Tracks API)   ─┤
│   ├── TASK-05 (Statistics Service) ─┤
│   ├── TASK-06 (useAudioPlayer)     ─┤
│   │   └── TASK-07 (ProgressBar)    ─┤
│   ├── TASK-08 (SearchAutocomplete) ─┤ → TASK-03'e de bağlı
│   ├── TASK-09 (GuessHistory)       ─┤
│   └── TASK-10 (GameControls)       ─┤
├── TASK-11 (Header & Layout)        ─┤
│                                     │
├── TASK-12 (ResultScreen)           ─┤ → TASK-05, TASK-06'ya bağlı
│                                     │
└───────────────────────────────────── TASK-13 (Ana Sayfa & useGameState) → Tümüne bağlı
                                       └── TASK-14 (Sınırsız Mod)
                                            └── TASK-15 (Tema & Responsive)
                                                 └── TASK-16 (Entegrasyon Testi)
```

---

## Paralel Çalışma Fırsatları

| Dalga | Görevler | Açıklama |
|-------|----------|----------|
| 1 | TASK-01 | Proje kurulumu (tek başına) |
| 2 | TASK-02 | Tipler ve sabitler |
| 3 | TASK-03, TASK-04, TASK-05, TASK-06, TASK-09, TASK-10, TASK-11 | Birbirinden bağımsız — paralel atanabilir |
| 4 | TASK-07, TASK-08, TASK-12 | TASK-06 ve TASK-03 sonrasında |
| 5 | TASK-13 | Tüm bileşenler hazır olduktan sonra |
| 6 | TASK-14 | TASK-13 sonrasında |
| 7 | TASK-15 | Tüm sayfalar hazır olduktan sonra |
| 8 | TASK-16 | Son kontrol |
