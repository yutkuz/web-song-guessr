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
    const seed = Math.floor(Math.random() * SONG_CATALOG.length);
    const requestedIndex = Number(request.nextUrl.searchParams.get('index'));
    const item = SONG_CATALOG[Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < SONG_CATALOG.length ? requestedIndex : seed];
    return NextResponse.json(await resolveSong(item.title, item.artist), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Katalog şarkısı alınamadı:', error);
    return NextResponse.json({ error: 'Şarkı şu anda yüklenemiyor. Lütfen tekrar deneyin.' }, { status: 502 });
  }
}
