import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';

export const dynamic = 'force-dynamic';

const TURKISH_POP_PLAYLIST_URL =
  'https://api.deezer.com/playlist/16011992503/tracks?limit=100';

interface DeezerTrackItem {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover?: string; cover_medium?: string };
}

interface DeezerPlaylistResponse {
  data?: DeezerTrackItem[];
  error?: unknown;
}

function getTodayString(): string {
  const date = new Date();
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getDailySeed(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function toTrack(item: DeezerTrackItem): Track | null {
  if (!item.preview?.trim()) return null;
  return {
    id: item.id,
    title: item.title_short || item.title,
    artist: item.artist?.name || 'Bilinmeyen Sanatçı',
    album: item.album?.title || '',
    albumCover: item.album?.cover_medium || item.album?.cover || '',
    previewUrl: item.preview,
  };
}

async function fetchTurkishTracks(): Promise<Track[]> {
  const response = await fetch(TURKISH_POP_PLAYLIST_URL, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) throw new Error(`Deezer HTTP ${response.status}`);
  const data: DeezerPlaylistResponse = await response.json();
  if (data.error || !Array.isArray(data.data)) {
    throw new Error('Türkçe pop listesi geçersiz');
  }

  const tracks = data.data
    .map(toTrack)
    .filter((track): track is Track => track !== null);
  if (tracks.length === 0) throw new Error('Türkçe pop listesinde çalınabilir parça yok');
  return tracks;
}

export async function GET(request: NextRequest) {
  try {
    const tracks = await fetchTurkishTracks();
    const isRandom = request.nextUrl.searchParams.get('random') === 'true';
    const index = isRandom
      ? Math.floor(Math.random() * tracks.length)
      : getDailySeed(getTodayString()) % tracks.length;

    return NextResponse.json(tracks[index], {
      headers: { 'Cache-Control': isRandom ? 'no-store' : 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Türkçe şarkı listesi alınamadı:', error);
    return NextResponse.json(
      { error: 'Türkçe şarkı listesi şu anda alınamıyor. Lütfen tekrar deneyin.' },
      { status: 502 }
    );
  }
}
