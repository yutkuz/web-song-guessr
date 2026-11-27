import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';

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

interface DeezerSearchResponse {
  data?: DeezerTrackItem[];
  error?: unknown;
}

// Tahmin havuzu yalnızca Türkçe müzik sanatçılarından oluşur.
const TURKISH_ARTISTS = new Set([
  'Tarkan', 'Sezen Aksu', 'Barış Manço', 'Cem Karaca', 'Athena', 'Mor ve Ötesi',
  'Duman', 'Teoman', 'Şebnem Ferah', 'Mabel Matiz', 'Kenan Doğulu', 'Sertab Erener',
  'Hadise', 'Gülşen', 'Demet Akalın', 'Edis', 'Simge', 'Yalın', 'Buray', 'Emre Aydın',
  'Murat Boz', 'Oğuzhan Koç', 'Sıla', 'Bengü', 'Hande Yener', 'Ajda Pekkan',
  'Nilüfer', 'Athena', 'İbrahim Tatlıses', 'Müslüm Gürses', 'Yıldız Tilbe',
  'Derya Uluğ', 'Ebru Yaşar', 'Sibel Can', 'Serdar Ortaç', 'Murat Dalkılıç',
  'Mustafa Ceceli', 'Gökhan Türkmen', 'İrem Derici', 'Aleyna Tilki', 'Melike Şahin',
  'Semicenk', 'Reynmen', 'Burak Bulut', 'Kubilay Karça', 'BLOK3', 'Lvbel C5',
  'Motive', 'Uzi', 'Ezhel', 'Ceza', 'Sagopa Kajmer', 'Gazapizm', 'Ben Fero',
  'Kaan Boşnak', 'Can Bonomo', 'Manga', 'Pinhani', 'Yüzyüzeyken Konuşuruz',
  'Adamlar', 'Büyük Ev Ablukada', 'Kalben', 'Melek Mosso', 'Merve Özbey',
  'Tuğba Yurt', 'Zakkum', 'İlyas Yalçıntaş', 'Funda Arar', 'Feridun Düzağaç',
]);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json(
        { error: 'Arama sorgusu gerekli' },
        { status: 400 }
      );
    }

    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=15`;
    const response = await fetch(deezerUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Müzik servisine bağlanılamadı' },
        { status: 502 }
      );
    }

    const data: DeezerSearchResponse = await response.json();

    if (data.error || !Array.isArray(data.data)) {
      return NextResponse.json(
        { error: 'Müzik servisine bağlanılamadı' },
        { status: 502 }
      );
    }

    const tracks: Track[] = data.data
      .filter((item): item is DeezerTrackItem & { preview: string } =>
        Boolean(
          item.preview &&
            item.preview.trim() !== '' &&
            item.artist?.name &&
            TURKISH_ARTISTS.has(item.artist.name)
        )
      )
      .map((item) => ({
        id: item.id,
        title: item.title_short || item.title,
        artist: item.artist?.name || 'Bilinmeyen Sanatçı',
        album: item.album?.title || '',
        albumCover: item.album?.cover_medium || item.album?.cover || '',
        previewUrl: item.preview,
      }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Deezer search API error:', error);
    return NextResponse.json(
      { error: 'Müzik servisine bağlanılamadı' },
      { status: 502 }
    );
  }
}
