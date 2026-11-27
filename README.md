# Şarkıyı Tahmin Et

Şarkıyı Tahmin Et, **50 popüler Türkçe şarkıyı** dinleyerek tahmin etmeye çalıştığın basit bir web oyunudur. Her oyunda 5 farklı şarkı sırayla gelir. Her şarkı için 3 tahmin hakkın vardır ve ses süresi aşamalı olarak artar.

Şarkı listesi sabit tutulmuştur; ileride yeni şarkılar kolayca eklenebilir.

## Gereksinimler

- Node.js 18 veya daha yeni bir sürüm
- npm

## Bilgisayarda çalıştırma

1. Projeyi bilgisayarına indir veya klonla:

   ```bash
   git clone https://github.com/yutkuz/web-song-guessr.git
   cd web-song-guessr
   ```

2. Bağımlılıkları yükle:

   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlat:

   ```bash
   npm run dev
   ```

4. Tarayıcıdan [http://localhost:3000](http://localhost:3000) adresini aç.

## Windows'ta kolay başlatma

Windows kullanıyorsan `baslat.bat` dosyasına çift tıklayabilirsin. Dosya gerekli bağımlılıkları kontrol eder, geliştirme sunucusunu başlatır ve oyunu tarayıcıda açar.

## Kullanılan teknolojiler

- Next.js
- React
- TypeScript
- Tailwind CSS
- Deezer önizleme API'si

Oyundaki şarkı önizlemeleri ve albüm kapakları Deezer API üzerinden alınır. Şarkı adları ve sanatçılar ise projedeki Türkçe şarkı kataloğundan seçilir.

## Şarkı ekleme

Şarkı kataloğu `src/constants/songs.ts` dosyasındadır. Yeni bir şarkı eklemek için katalogdaki listeye şarkı adı, sanatçı, yıl ve tür bilgilerini eklemek yeterlidir.
