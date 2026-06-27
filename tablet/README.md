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

## Oyun içi AI chat botu (chat-bot.js)

Eski ADB tabanlı botun **ADB'siz** sürümü — etiketlenince Claude ile cevaplar.
ADB ban vektörünü ortadan kaldırır (erişilebilirlik kullanır, ADB değil).

**Nasıl çalışır:** chat'i fotoğraflar → backend `/api/chatbot` Vision ile okur,
tetikleyici kelimeyi içeren yeni mention'ları bulur, Claude ile (ittifak verisini
kullanarak) cevap üretir → script cevabı chat kutusuna yazıp gönderir.

**Kurulum:**
1. `wos` `.env` içinde `BOT_TRIGGER` ayarla (botun cevap vereceği kelime, genelde
   botun oyun içi adı).
2. `config.js` → `chatBot.enabled: true`, `pollMs` (cevap sıklığı).
3. Ek template'ler oluştur: `chat-input.png` (mesaj yazma kutusu), `send-button.png`
   (gönder butonu) — `chat-icon.png` zaten gerekli.
4. AutoX.js'te `chat-bot.js`'i çalıştır.

**Gerçekçi beklenti:** Cevaplar anlık değil, döngüde gelir (ör. 90 sn'de bir
kontrol → soru en geç ~1.5 dk sonra cevaplanır). Tetikleyiciyi içermeyen
mesajlar atlanır; aynı mention iki kez cevaplanmaz (hash dosyası).

## Sorun giderme

- **"Template ekranda bulunamadı"** → template görüntüsünü yeniden kırp, eşik düşür.
- **Yükleme HTTP hatası** → `serverUrl` ve `ingestSecret` doğru mu, tablet sunucuya erişiyor mu kontrol et.
- **Tıklamalar çalışmıyor** → Erişilebilirlik servisi açık mı?
