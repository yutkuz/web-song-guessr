import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';

export const dynamic = 'force-dynamic';

const DEEZER_CHART_URL = 'https://api.deezer.com/chart/0/tracks?limit=100';

interface DeezerArtist {
  id?: number;
  name?: string;
}

interface DeezerAlbum {
  id?: number;
  title?: string;
  cover?: string;
  cover_medium?: string;
}

interface DeezerTrackItem {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  artist?: DeezerArtist;
  album?: DeezerAlbum;
}

interface DeezerChartResponse {
  data?: DeezerTrackItem[];
  error?: unknown;
}

/**
 * Deezer API erişilemez, zaman aşımına uğrar veya rate limit ile karşılaşırsa
 * oyunun kesintisiz devam etmesini sağlayan 15 parçalık yerleşik yedek parça listesi.
 */
const FALLBACK_TRACKS: Track[] = [
  {
    id: 4091937401,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night At The Opera',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/0b56f4eee05fa1ea753c5654b2cdb70c/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/5/f/9/0/5f9a6a2ea1876e6d07c4b7feefa99951.mp3?hdnea=exp=1795717530~acl=/api/1/1/5/f/9/0/5f9a6a2ea1876e6d07c4b7feefa99951.mp3*~data=user_id=0,application_id=42~hmac=60c0131a92500ee9c362333326d4d1b7ae188e03fa03581febc67470a7c7da7c',
  },
  {
    id: 66609426,
    title: 'Get Lucky',
    artist: 'Daft Punk',
    album: 'Get Lucky (Radio Edit - feat. Pharrell Williams and Nile Rodgers)',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/bc49adb87758e0c8c4e508a9c5cce85d/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3?hdnea=exp=1795717530~acl=/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3*~data=user_id=0,application_id=42~hmac=2e84fa363b8d6ce9c896e67ce413f418dd1a6a29e2b9f2140a69eec0ab0cda37',
  },
  {
    id: 4603408,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: "Michael Jackson's This Is It",
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/a0ad67d1beb761f2cb9f8b60e5bcf07a/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3?hdnea=exp=1795717530~acl=/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3*~data=user_id=0,application_id=42~hmac=ca8d5c9b46d5e4d2ca76b91ecaf4b8598880b7b02de14c295cea5e20b60cb62c',
  },
  {
    id: 8086126,
    title: 'Rolling in the Deep',
    artist: 'Adele',
    album: '21',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/dc1ce848d830ecc93521be5a78350364/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/d/8/7/0/d87d2d1789c1b4d96992d8079a29360b.mp3?hdnea=exp=1795717530~acl=/api/1/1/d/8/7/0/d87d2d1789c1b4d96992d8079a29360b.mp3*~data=user_id=0,application_id=42~hmac=29306447775495995e82d2dde8d62a72a56c36dea7a790f17844a20aa251af93',
  },
  {
    id: 908604612,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/1/b/2/0/1b27825bf63c36edcdc7fac9f920214e.mp3?hdnea=exp=1795717530~acl=/api/1/1/1/b/2/0/1b27825bf63c36edcdc7fac9f920214e.mp3*~data=user_id=0,application_id=42~hmac=b2bf0f233ac5044232aa3e4e1a351d15f12ad7864e823df2c64a27a797b51b10',
  },
  {
    id: 3157972,
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva La Vida or Death and All His Friends',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/eede3cd0dc3a5a87c7a5b1085b022e2d/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/e/2/5/0/e25fade11767fd539ad651da72103237.mp3?hdnea=exp=1795717530~acl=/api/1/1/e/2/5/0/e25fade11767fd539ad651da72103237.mp3*~data=user_id=0,application_id=42~hmac=c0c5b2e16d5e4ffdfcd1c09c267a0d258a02ad1c4d66c0098c64d37854edc01b',
  },
  {
    id: 1109731,
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: 'Curtain Call: The Hits',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/e2b36a9fda865cb2e9ed1476b6291a7d/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/d/0/d/0/d0de8f4ff3151508065c431afc37bca6.mp3?hdnea=exp=1795717530~acl=/api/1/1/d/0/d/0/d0de8f4ff3151508065c431afc37bca6.mp3*~data=user_id=0,application_id=42~hmac=c5ce2bbd78790a1cfdb410461c27e82890006e5ffc127c070a9c60080ead8953',
  },
  {
    id: 528330441,
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/247b228179aea3b083eef43522b78b45/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/c/b/e/0/cbe9e3bf5b7fb4c15dc76f53c2221559.mp3?hdnea=exp=1795717530~acl=/api/1/1/c/b/e/0/cbe9e3bf5b7fb4c15dc76f53c2221559.mp3*~data=user_id=0,application_id=42~hmac=e2555be8e4e5a82a4bf2e00f81150d610a912bc023ca12641218808a2cdd9c30',
  },
  {
    id: 1124841682,
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/f8364f090ba04f1b19b381ec0390f3e4/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/9/c/5/0/9c570bc806fc277bb73ba024e956d057.mp3?hdnea=exp=1795717530~acl=/api/1/1/9/c/5/0/9c570bc806fc277bb73ba024e956d057.mp3*~data=user_id=0,application_id=42~hmac=c45ef039f3dd586f253d2a4375f50d0e28c32f8e1ce67558ceb2594f775dee7a',
  },
  {
    id: 139470659,
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Shape of You',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/107c2b43f10c249077c1f7618563bb63/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/f/1/b/0/f1becf66c6264a6a0306fc47d47690b0.mp3?hdnea=exp=1795717530~acl=/api/1/1/f/1/b/0/f1becf66c6264a6a0306fc47d47690b0.mp3*~data=user_id=0,application_id=42~hmac=30dfc2ed0463cd759371aeb0a76b0ee972f772c5d127943ca2be0613eea9659b',
  },
  {
    id: 13791930,
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind (Remastered)',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/f0282817b697279e56df13909962a54a/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/3/4/b/0/34bad352aa1aa0f8eecbbc9c27a40eaf.mp3?hdnea=exp=1795717530~acl=/api/1/1/3/4/b/0/34bad352aa1aa0f8eecbbc9c27a40eaf.mp3*~data=user_id=0,application_id=42~hmac=7b022e2f277d0772c6cba1a792f369b0e6fc6423af0df62d7477beb66fb92170',
  },
  {
    id: 655095912,
    title: 'bad guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/6630083f454d48eadb6a9b53f035d734/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/b/5/2/0/b528e07441caa4883c8d1c4b746bf47c.mp3?hdnea=exp=1795717530~acl=/api/1/1/b/5/2/0/b528e07441caa4883c8d1c4b746bf47c.mp3*~data=user_id=0,application_id=42~hmac=ce19d711acf2dc1956aeda60d1a002a753f4aa05c84e6f8560676ada73294578',
  },
  {
    id: 518458172,
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: 'Appetite For Destruction (Super Deluxe Edition)',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3?hdnea=exp=1795717530~acl=/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3*~data=user_id=0,application_id=42~hmac=615b2f44b3ff1b4f8e681526ab0bda98157a2b09c9dc2dba7014ec6cc9b7791b',
  },
  {
    id: 92720046,
    title: 'Back In Black',
    artist: 'AC/DC',
    album: 'Back In Black',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/41041b14873956eff0459c8ea2c296a8/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/8/2/b/0/82be918b42c3d26093b20d01e97e4a03.mp3?hdnea=exp=1795717530~acl=/api/1/1/8/2/b/0/82be918b42c3d26093b20d01e97e4a03.mp3*~data=user_id=0,application_id=42~hmac=317a4bc046b699959d91ff4db9b89af9e29e40ccb851dbf8df6d34db25a20331',
  },
  {
    id: 89077547,
    title: 'Blank Space',
    artist: 'Taylor Swift',
    album: '1989 (Deluxe)',
    albumCover: 'https://cdn-images.dzcdn.net/images/cover/68b4e986958b17f05b062ffa8d7ae114/250x250-000000-80-0-0.jpg',
    previewUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/b/b/7/0/bb7f65683e286ea3014c0fbd26bfaa5b.mp3?hdnea=exp=1795717530~acl=/api/1/1/b/b/7/0/bb7f65683e286ea3014c0fbd26bfaa5b.mp3*~data=user_id=0,application_id=42~hmac=7f5b092abd7f51783376bd7dd996a71788c5a90ed334e72251f31a80e1d8ce71',
  },
];

/**
 * YYYY-MM-DD formatında UTC gün dizesini döndürür.
 * UTC bazlı tarih, tüm istemciler ve sunucu bölgeleri arasında tutarlı gün dönüşümü sağlar.
 */
function getTodayString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * String'i (örn. '2026-11-26') deterministik 32-bit tamsayı tohumuna (seed) dönüştürür (FNV-1a algoritması).
 */
function getDailySeed(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deezer Chart API'sinden popüler şarkıları çeker.
 * Başarısızlık durumunda otomatik olarak FALLBACK_TRACKS havuzuna düşer.
 */
async function fetchTrackPool(): Promise<Track[]> {
  try {
    const response = await fetch(DEEZER_CHART_URL, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`Deezer chart isteği başarısız oldu (durum: ${response.status}), yedek liste kullanılıyor.`);
      return FALLBACK_TRACKS;
    }

    const data: DeezerChartResponse = await response.json();

    if (data.error || !Array.isArray(data.data) || data.data.length === 0) {
      console.warn('Deezer chart verisi geçersiz veya boş, yedek liste kullanılıyor.');
      return FALLBACK_TRACKS;
    }

    const validTracks: Track[] = data.data
      .filter((item): item is DeezerTrackItem & { preview: string } =>
        Boolean(item.preview && item.preview.trim() !== '')
      )
      .map((item) => ({
        id: item.id,
        title: item.title_short || item.title,
        artist: item.artist?.name || 'Bilinmeyen Sanatçı',
        album: item.album?.title || '',
        albumCover: item.album?.cover_medium || item.album?.cover || '',
        previewUrl: item.preview,
      }));

    if (validTracks.length === 0) {
      console.warn('Deezer şarkılarında geçerli önizleme (preview) bulunamadı, yedek liste kullanılıyor.');
      return FALLBACK_TRACKS;
    }

    // Sıralama dalgalanmalarına karşı havuzu ID bazında sıralayarak gün içindeki determinizmi koruyoruz
    validTracks.sort((a, b) => a.id - b.id);

    return validTracks;
  } catch (error) {
    console.error('Deezer chart çekilirken hata oluştu, yedek liste kullanılıyor:', error);
    return FALLBACK_TRACKS;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isRandom = searchParams.get('random') === 'true';
    const pool = await fetchTrackPool();

    // Sınırsız / Unlimited mod için rastgele şarkı seçimi
    if (isRandom) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedTrack = pool[randomIndex] || FALLBACK_TRACKS[0];
      return NextResponse.json(selectedTrack, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Günün Şarkısı modu: Tarih bazlı deterministik seçim
    const targetDate = searchParams.get('date')?.trim() || getTodayString();
    const seed = getDailySeed(targetDate);
    const selectedIndex = seed % pool.length;
    const selectedTrack = pool[selectedIndex] || FALLBACK_TRACKS[0];

    return NextResponse.json(selectedTrack);
  } catch (error) {
    console.error('daily-tracks API handler beklenmeyen hata:', error);
    // Hata durumunda asla 500 dönmeyip deterministik fallback şarkısı sunulur
    const fallbackSeed = getDailySeed(getTodayString());
    const fallbackTrack = FALLBACK_TRACKS[fallbackSeed % FALLBACK_TRACKS.length];
    return NextResponse.json(fallbackTrack);
  }
}
