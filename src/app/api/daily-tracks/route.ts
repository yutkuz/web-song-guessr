import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';
import { SONG_CATALOG } from '@/constants/songs';

export const dynamic = 'force-dynamic';

interface DeezerTrackItem {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover?: string; cover_medium?: string };
}

interface DeezerSearchResponse { data?: DeezerTrackItem[]; error?: unknown; }

const normalize = (value: string) =>
  value.toLocaleLowerCase('tr-TR').replace(/[’']/g, '').replace(/[^a-z0-9çğıöşü ]/gi, ' ').replace(/\s+/g, ' ').trim();

async function resolveSong(title: string, artist: string): Promise<Track> {
  const query = encodeURIComponent(`${title} ${artist}`);
  const response = await fetch(`https://api.deezer.com/search?q=${query}&limit=10`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Deezer HTTP ${response.status}`);
  const data: DeezerSearchResponse = await response.json();
  const wantedTitle = normalize(title);
  const wantedArtist = normalize(artist.split(' / ')[0].replace(' ft.', ''));
  const match = (data.data ?? []).find((item) =>
    item.preview && normalize(item.title).includes(wantedTitle) && normalize(item.artist?.name || '').includes(wantedArtist)
  ) || (data.data ?? []).find((item) => item.preview);
  if (!match?.preview) throw new Error('Şarkı önizlemesi bulunamadı');
  return {
    id: match.id,
    title,
    artist,
    album: match.album?.title || '',
    albumCover: match.album?.cover_medium || match.album?.cover || '',
    previewUrl: match.preview,
  };
}

export async function GET(request: NextRequest) {
  try {
    const count = Number(request.nextUrl.searchParams.get('count'));
    const excludedIndexes = new Set(
      (request.nextUrl.searchParams.get('exclude') || '')
        .split(',')
        .map(Number)
        .filter((index) => Number.isInteger(index) && index >= 0),
    );
    const availableIndexes = [...SONG_CATALOG.keys()].filter((index) => !excludedIndexes.has(index));
    if (availableIndexes.length === 0) throw new Error('Kullanılabilir şarkı kalmadı');

    // Her istekte bağımsız bir şarkı seçilir. `exclude`, aynı oyun içindeki
    // önceki seçimlerin tekrar dönmesini engeller.
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    const indexes = count === 5
      ? availableIndexes.sort(() => Math.random() - 0.5).slice(0, 5)
      : [randomIndex];
    const tracks = await Promise.all(indexes.map((index) => {
      const item = SONG_CATALOG[index];
      return resolveSong(item.title, item.artist);
    }));
    const responseTracks = tracks.map((track, position) => ({
      ...track,
      catalogIndex: indexes[position],
    }));
    return NextResponse.json(count === 5 ? responseTracks : responseTracks[0], {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Katalog şarkısı alınamadı:', error);
    return NextResponse.json({ error: 'Şarkı şu anda yüklenemiyor. Lütfen tekrar deneyin.' }, { status: 502 });
  }
}
