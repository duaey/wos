/**
 * WOS Tablet Gözcü — yapılandırma.
 * Bu dosyayı kendi kurulumuna göre düzenle.
 */
module.exports = {
  // duaey/wos backend adresi (tabletin erişebildiği IP/host)
  serverUrl: "http://192.168.1.10:3000",

  // wos .env içindeki INGEST_SECRET ile AYNI olmalı
  ingestSecret: "degistir-bunu-uzun-bir-anahtar",

  // WOS uygulamasının paket adı
  wosPackage: "com.gof.global",

  // Döngü aralığı (ms). Vision AI maliyeti için makul tut (örn 10-15 dk).
  loopIntervalMs: 12 * 60 * 1000,

  // Her adım arası bekleme (oyun animasyonları için)
  stepDelayMs: 2500,

  // Hangi ekranlar okunsun
  capture: {
    chat: true,
    scores: false, // sadece etkinlik bitiminde elle aç
    online: true,
  },

  // Template eşleştirme eşiği (0-1). Düşürürsen daha toleranslı.
  matchThreshold: 0.7,

  // Template görüntüleri /sdcard/wos-templates/ altında olmalı.
  // Bunları kendi tabletinde ekran görüntüsünden kırparak oluştur (README'ye bak).
  templateDir: "/sdcard/wos-templates",

  // ---- Oyun içi AI chat botu (chat-bot.js) ----
  chatBot: {
    enabled: true,
    // Bot bu kelimeyi içeren mesajlara cevap verir (genelde botun oyun adı).
    // wos .env içindeki BOT_TRIGGER ile aynı mantık.
    pollMs: 90 * 1000, // chat'e ne sıklıkta bakılsın
    // Cevaplanan mention hash'lerinin saklandığı dosya (tekrarı önler)
    answeredFile: "/sdcard/wos-bot-answered.json",
    // Gerekli template'ler: chat-input.png (mesaj kutusu), send-button.png (gönder)
  },
};
