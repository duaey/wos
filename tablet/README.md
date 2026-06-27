# WOS Tablet Gözcü (AutoX.js)

Tablette WOS oyununda gezip chat / etkinlik / üye ekranlarının görüntüsünü alır
ve `duaey/wos` backend'ine yükler. Sunucu görüntüleri Vision AI (`duaey/gpt`) ile
yapılandırılmış veriye çevirir.

> ⚠️ **Risk:** Erişilebilirlik otomasyonu + ekran yakalama oyunun kullanım
> şartlarına aykırıdır; gözcü hesap **ban yiyebilir**. Güç/fırın takibi (resmi
> API) bundan etkilenmez ve güvenlidir. Riski kabul ederek kullan.

## Kurulum

1. **AutoX.js** (veya Auto.js Pro) kur — tablete APK olarak.
2. AutoX.js içinde **Erişilebilirlik servisini** aç (Ayarlar → Erişilebilirlik).
3. Bu klasördeki `config.js` ve `wos-watcher.js` dosyalarını tabletteki
   AutoX.js script klasörüne kopyala (genelde `/sdcard/脚本/` veya seçtiğin klasör).
4. `config.js`'i düzenle:
   - `serverUrl` → wos backend adresi (tabletin eriştiği IP)
   - `ingestSecret` → wos `.env` içindeki `INGEST_SECRET` ile aynı
   - `loopIntervalMs`, hangi ekranların okunacağı vb.

## Template görüntüleri (navigasyon için)

Script, menülerde gezmek için ikon görüntülerini ekranda arar (sabit koordinat
yerine — arayüz kayınca daha dayanıklı). Bunları **kendi tabletinde** oluştur:

1. WOS'u aç, ilgili butonun göründüğü ekrana gel.
2. AutoX.js ile ekran görüntüsü al, butonun etrafından küçük bir kare kırp.
3. `/sdcard/wos-templates/` altına şu adlarla kaydet:
   - `chat-icon.png` — ana ekrandaki sohbet/chat butonu
   - `alliance-icon.png` — ittifak butonu
   - `members-icon.png` — ittifak içindeki üye listesi butonu
   - `events-icon.png` — etkinlik butonu (skor okunacaksa)

Eşleşme zayıfsa `config.js` içindeki `matchThreshold` değerini düşür (örn 0.6).

## Çalıştırma

1. WOS'u aç ve ittifağa girmiş gözcü hesapla giriş yap.
2. AutoX.js'te `wos-watcher.js`'i çalıştır.
3. İlk açılışta **ekran yakalama izni** ister — onayla.
4. Script periyodik olarak gezer, görüntü alır, yükler.

## FLAG_SECURE testi (önemli)

Bazı oyunlar ekran yakalamayı engeller (siyah görüntü). Script ilk turda bunu
kontrol eder; siyah dönüyorsa log'a uyarı yazar. Bu durumda ekran yakalama
çalışmaz ve **harici kamera yedek planına** geçmek gerekir (eski telefon/webcam
ile ekranı dışarıdan fotoğraflayıp aynı `/api/ingest`'e yüklemek).

## Sorun giderme

- **"Template ekranda bulunamadı"** → template görüntüsünü yeniden kırp, eşik düşür.
- **Yükleme HTTP hatası** → `serverUrl` ve `ingestSecret` doğru mu, tablet sunucuya erişiyor mu kontrol et.
- **Tıklamalar çalışmıyor** → Erişilebilirlik servisi açık mı?
