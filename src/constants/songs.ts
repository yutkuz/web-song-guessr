export interface SongCatalogItem {
  title: string;
  artist: string;
  year: number;
  genre: string;
}

const SONG_ROWS = [
  ['Şımarık', 'Tarkan', 1997, 'Pop'], ['Gülpembe', 'Barış Manço', 1981, 'Anadolu Rock'],
  ['Tutuklu', 'Sezen Aksu', 1998, 'Pop'], ['Batsın Bu Dünya', 'Orhan Gencebay', 1975, 'Arabesk'],
  ['Sevdan Olmasa', 'Erol Evgin', 1978, 'Pop'], ['Bir Teselli Ver', 'Orhan Gencebay', 1969, 'Arabesk'],
  ['Dağlar Dağlar', 'Barış Manço', 1970, 'Anadolu Rock'], ['Fırat', 'Müslüm Gürses', 1991, 'Arabesk'],
  ['Seninle Olmak Var Ya', 'Metin Özülkü', 1990, 'Pop'], ['Yalnızlık Senfonisi', 'Sezen Aksu', 1991, 'Pop'],
  ['Sarı Çizmeli Mehmet Ağa', 'Barış Manço', 1979, 'Anadolu Rock'], ['Gesi Bağları', 'Selda Bağcan', 1976, 'Türk Halk Müziği / Rock'],
  ['Islak Islak', 'Cem Karaca', 1992, 'Anadolu Rock'], ['Tamirci Çırağı', 'Cem Karaca', 1975, 'Anadolu Rock'],
  ['Resimdeki Gözyaşları', 'Cem Karaca', 1968, 'Anadolu Rock'], ['Kuzu Kuzu', 'Tarkan', 2001, 'Pop'],
  ['Bandıra Bandıra', 'Yonca Evcimik', 1994, "90'lar Pop"], ['Abone', 'Yonca Evcimik', 1991, "90'lar Pop"],
  ['Hadi Bakalım', 'Sezen Aksu', 1991, "90'lar Pop"], ['Karabiberim', 'Serdar Ortaç', 1994, "90'lar Pop"],
  ['Sana Değer', 'Yıldız Tilbe', 1994, 'Pop / Arabesk'], ['Delikanlım', 'Yıldız Tilbe', 1994, 'Pop'],
  ['Ele Güne Karşı', 'MFÖ', 1984, 'Pop / Rock'], ['Ali Desidero', 'MFÖ', 1990, 'Pop / Rock'],
  ['Sarı Laleler', 'MFÖ', 2006, 'Pop / Rock'], ['Akdeniz Akşamları', 'Haluk Levent', 1993, 'Anadolu Rock'],
  ['Elfida', 'Haluk Levent', 2004, 'Anadolu Rock'], ['Nilüfer', 'Müslüm Gürses', 2006, 'Rock / Arabesk Cover'],
  ['Paramparça', 'Teoman', 2000, 'Rock'], ["İstanbul'da Sonbahar", 'Teoman', 2001, 'Rock'],
  ['Cambaz', 'Mor ve Ötesi', 2004, 'Rock'], ['Bir Derdim Var', 'Mor ve Ötesi', 2004, 'Rock'],
  ['Senden Daha Güzel', 'Duman', 2009, 'Rock'], ['Her Şeyi Yak', 'Duman', 2002, 'Rock'],
  ['Seni Kendime Sakladım', 'Duman', 2005, 'Rock'], ['Çakkıdı', 'Kenan Doğulu', 2006, 'Pop'],
  ['Tutamıyorum Zamanı', 'Müslüm Gürses', 2000, 'Arabesk'], ['Vazgeçtim', 'Yıldız Tilbe', 1995, 'Pop / Arabesk'],
  ['Unutamadım', 'Kahtalı Mıçe / İbrahim Tatlıses', 1985, 'Arabesk / Fantezi'], ['Mavi Mavi', 'İbrahim Tatlıses', 1985, 'Arabesk / Fantezi'],
  ['Domates Biber Patlıcan', 'Barış Manço', 1989, 'Pop / Rock'], ['Aşkın Olayım', 'Simge', 2018, 'Modern Pop'],
  ['Cevapsız Çınlama', 'Emrah Karaduman ft. Aleyna Tilki', 2016, 'Modern Pop'], ['Yalan', 'Candan Erçetin', 1997, 'Pop'],
  ['Elbette', 'Candan Erçetin', 2000, 'Pop'], ['Gemiler', 'Teoman', 1998, 'Rock'],
  ['Beni Benden Alırsan', 'İbrahim Tatlıses', 1996, 'Arabesk / Fantezi'], ['Keskin Bıçak', 'Sezen Aksu', 2000, 'Pop'],
  ['Uzun İnce Bir Yoldayım', 'Aşık Veysel', 1970, 'Türk Halk Müziği'], ['Mihriban', 'Musa Eroğlu', 1986, 'Türk Halk Müziği'],
] as const;

export const SONG_CATALOG: SongCatalogItem[] = SONG_ROWS.map(([title, artist, year, genre]) => ({ title, artist, year, genre }));
