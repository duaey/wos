/**
 * FLAG_SECURE Testi — AutoX.js / Auto.js
 * =======================================
 * WOS ekran görüntüsü almaya izin veriyor mu test eder.
 * Hiçbir sunucu/internet gerekmez.
 *
 * KULLANIM:
 *   1. WOS'u aç, CHAT ekranına gel (mesajların göründüğü yer).
 *   2. AutoX.js'e geç ve bu scripti çalıştır.
 *   3. Ekran yakalama izni isteyince ONAYLA.
 *   4. Sonucu oku.
 *
 * SONUÇ:
 *   "✅ EKRAN OK"  -> screenshot çalışıyor, tablet planı uygulanabilir.
 *   "❌ SİYAH"     -> oyun ekran yakalamayı engelliyor (FLAG_SECURE);
 *                    kamera yöntemine geçmek gerekir.
 */

if (!requestScreenCapture(false)) {
  toast("Ekran yakalama izni reddedildi");
  exit();
}

// İzin sonrası kısa bekleme
sleep(1500);

var img = captureScreen();

function isBlack(image) {
  if (!image) return true;
  var w = image.getWidth();
  var h = image.getHeight();
  var pts = [
    [w * 0.5, h * 0.5],
    [w * 0.25, h * 0.3],
    [w * 0.75, h * 0.7],
    [w * 0.5, h * 0.15],
  ];
  for (var i = 0; i < pts.length; i++) {
    var c = images.pixel(image, Math.floor(pts[i][0]), Math.floor(pts[i][1]));
    if (colors.red(c) > 8 || colors.green(c) > 8 || colors.blue(c) > 8) {
      return false; // renkli piksel var -> siyah değil
    }
  }
  return true;
}

// Kanıt için bir kopya da kaydet (gözle bakabilmen için)
try {
  images.save(img, "/sdcard/wos-screentest.png");
} catch (e) {}

if (isBlack(img)) {
  toast("❌ SİYAH — oyun ekran yakalamayı engelliyor");
  console.show();
  console.error("SONUÇ: ❌ SİYAH");
  console.error("Oyun FLAG_SECURE kullanıyor. Ekran görüntüsü alınamıyor.");
  console.error("Kamera yöntemine geçmek gerekir.");
} else {
  toast("✅ EKRAN OK — screenshot çalışıyor");
  console.show();
  console.log("SONUÇ: ✅ EKRAN OK");
  console.log("Ekran yakalama çalışıyor. Tablet planı uygulanabilir.");
  console.log("Kanıt: /sdcard/wos-screentest.png");
}

img.recycle();
