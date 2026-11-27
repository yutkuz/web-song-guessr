import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';

interface DeezerTrackItem {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover?: string; cover_medium?: string };
}

interface DeezerSearchResponse { data?: DeezerTrackItem[]; error?: unknown; }

const TURKISH_ARTISTS = new Set([
  'Tarkan', 'Sezen Aksu', 'Barış Manço', 'Cem Karaca', 'Mor ve Ötesi', 'Duman', 'Teoman',
  'Şebnem Ferah', 'Mabel Matiz', 'Kenan Doğulu', 'Sertab Erener', 'Hadise', 'Gülşen',
  'Demet Akalın', 'Edis', 'Simge', 'Yalın', 'Buray', 'Emre Aydın', 'Murat Boz', 'Sıla',
  'Bengü', 'Hande Yener', 'Ajda Pekkan', 'Nilüfer', 'İbrahim Tatlıses', 'Müslüm Gürses',
  'Yıldız Tilbe', 'Derya Uluğ', 'Ebru Yaşar', 'Sibel Can', 'Serdar Ortaç', 'Murat Dalkılıç',
  'Mustafa Ceceli', 'Gökhan Türkmen', 'İrem Derici', 'Aleyna Tilki', 'Melike Şahin',
  'Semicenk', 'Reynmen', 'Burak Bulut', 'BLOK3', 'Lvbel C5', 'Motive', 'Uzi', 'Ezhel',
  'Ceza', 'Sagopa Kajmer', 'Gazapizm', 'Ben Fero', 'Kaan Boşnak', 'Can Bonomo', 'Manga',
  'Pinhani', 'Yüzyüzeyken Konuşuruz', 'Adamlar', 'Kalben', 'Melek Mosso', 'Merve Özbey',
  'Tuğba Yurt', 'Zakkum', 'İlyas Yalçıntaş', 'Funda Arar', 'Feridun Düzağaç',
  'Orhan Gencebay', 'Erol Evgin', 'Metin Özülkü', 'Selda Bağcan', 'Yonca Evcimik', 'MFÖ',
  'Haluk Levent', 'Candan Erçetin', 'Kahtalı Mıçe', 'Emrah Karaduman', 'Aşık Veysel',
  'Musa Eroğlu', 'Athena',
]);

const VERSION_MARKERS = /\b(remix|remaster(?:ed)?|live|acoustic|unplugged|karaoke|instrumental|radio edit|edit|version|versiyon|cover|feat\.?|ft\.?|düet|duet)\b/i;

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    if (!query) return NextResponse.json({ error: 'Arama sorgusu gerekli' }, { status: 400 });

    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=25`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.json({ error: 'Müzik servisine bağlanılamadı' }, { status: 502 });

    const data: DeezerSearchResponse = await response.json();
    if (!Array.isArray(data.data)) return NextResponse.json({ error: 'Müzik servisi geçersiz yanıt verdi' }, { status: 502 });

    const playable = data.data.filter((item) => item.preview && item.artist?.name && !VERSION_MARKERS.test(item.title));
    const TurkishResults = playable.filter((item) => TURKISH_ARTISTS.has(item.artist?.name || ''));
    const candidates = TurkishResults.length > 0 ? TurkishResults : playable;
    const tracks: Track[] = candidates.map((item) => ({
      id: item.id,
      title: item.title_short || item.title,
      artist: item.artist?.name || 'Bilinmeyen Sanatçı',
      album: item.album?.title || '',
      albumCover: item.album?.cover_medium || item.album?.cover || '',
      previewUrl: item.preview || '',
    }));
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Deezer search API error:', error);
    return NextResponse.json({ error: 'Müzik servisine bağlanılamadı' }, { status: 502 });
  }
}
