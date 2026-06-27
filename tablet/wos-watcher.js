/**
 * WOS Tablet Gözcü — AutoX.js / Auto.js scripti
 * =================================================
 * Tablette WOS oyununda gezer, chat / etkinlik / üye ekranlarının
 * görüntüsünü alır ve duaey/wos backend'ine (/api/ingest) yükler.
 *
 * Gereksinimler:
 *   - AutoX.js (veya Auto.js Pro) kurulu
 *   - Erişilebilirlik servisi açık (gezinme/tıklama için)
 *   - Ekran yakalama izni (MediaProjection)
 *
 * Kurulum ve template oluşturma için tablet/README.md'ye bak.
 *
 * ⚠️ Bu otomasyon oyunun kullanım şartları açısından risk taşır;
 *    gözcü hesap ban yiyebilir. Güç/fırın takibi (resmi API) güvenlidir.
 */

var cfg = require("./config.js");

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------

function log(msg) {
  console.log("[" + new Date().toLocaleTimeString() + "] " + msg);
}

function sleep(ms) {
  java.lang.Thread.sleep(ms);
}

/** Ekran yakalama iznini ister (script başında bir kez). */
function ensureCapture() {
  if (!requestScreenCapture(false)) {
    toast("Ekran yakalama izni reddedildi");
    exit();
  }
}

/**
 * captureScreen() siyah dönüyor mu? (FLAG_SECURE testi)
 * Oyun ekran yakalamayı engelliyorsa kamera yedek planına geçmek gerekir.
 */
function isBlack(img) {
  if (!img) return true;
  var w = img.getWidth();
  var h = img.getHeight();
  var pts = [
    [w * 0.5, h * 0.5],
    [w * 0.25, h * 0.25],
    [w * 0.75, h * 0.75],
  ];
  for (var i = 0; i < pts.length; i++) {
    var c = images.pixel(img, Math.floor(pts[i][0]), Math.floor(pts[i][1]));
    // Tamamen siyah değilse ekran yakalama çalışıyor demektir
    if (colors.red(c) > 8 || colors.green(c) > 8 || colors.blue(c) > 8) return false;
  }
  return true;
}

/** Ekranı yakalar, base64 (png) döner. */
function grabBase64() {
  var img = captureScreen();
  var b64 = images.toBase64(img, "png", 100);
  img.recycle();
  return b64;
}

/** Görüntüyü ilgili kind ile backend'e yükler. */
function upload(kind, base64) {
  var res = http.postJson(
    cfg.serverUrl + "/api/ingest",
    { kind: kind, image: base64 },
    { headers: { Authorization: "Bearer " + cfg.ingestSecret } }
  );
  if (res.statusCode >= 200 && res.statusCode < 300) {
    log(kind + " yüklendi: " + res.body.string());
    return true;
  }
  log(kind + " yükleme hatası: HTTP " + res.statusCode);
  return false;
}

/** Bir template ikonunu ekranda bulup tıklar. Bulamazsa false. */
function tapTemplate(name) {
  var path = cfg.templateDir + "/" + name + ".png";
  if (!files.exists(path)) {
    log("Template yok: " + path);
    return false;
  }
  var screen = captureScreen();
  var tpl = images.read(path);
  var p = images.findImage(screen, tpl, { threshold: cfg.matchThreshold });
  tpl.recycle();
  screen.recycle();
  if (p) {
    click(p.x + 10, p.y + 10);
    sleep(cfg.stepDelayMs);
    return true;
  }
  log("Template ekranda bulunamadı: " + name);
  return false;
}

/** Ana ekrana dönmek için geri tuşuna birkaç kez bas. */
function goHome() {
  for (var i = 0; i < 3; i++) {
    back();
    sleep(800);
  }
}

// ---------------------------------------------------------------------------
// Ekran akışları
// ---------------------------------------------------------------------------

/** Chat ekranını açar ve yükler. */
function doChat() {
  log("Chat akışı...");
  // "chat-icon" template'i ana ekrandaki sohbet butonunu işaret etmeli
  if (tapTemplate("chat-icon")) {
    sleep(cfg.stepDelayMs);
    upload("chat", grabBase64());
  }
  goHome();
}

/** İttifak üye listesini açar ve online durumu için yükler. */
function doOnline() {
  log("Online akışı...");
  if (tapTemplate("alliance-icon")) {
    if (tapTemplate("members-icon")) {
      sleep(cfg.stepDelayMs);
      upload("online", grabBase64());
    }
  }
  goHome();
}

/** Etkinlik skor tablosu — manuel tetik dışında varsayılan kapalı. */
function doScores() {
  log("Skor akışı...");
  if (tapTemplate("events-icon")) {
    sleep(cfg.stepDelayMs);
    upload("scores", grabBase64());
  }
  goHome();
}

// ---------------------------------------------------------------------------
// Ana döngü
// ---------------------------------------------------------------------------

function oneRound() {
  // WOS'u öne getir
  app.launchPackage(cfg.wosPackage);
  sleep(cfg.stepDelayMs * 2);

  // FLAG_SECURE kontrolü
  var test = captureScreen();
  if (isBlack(test)) {
    test.recycle();
    log("⚠️ Ekran yakalama SİYAH dönüyor (FLAG_SECURE?). Kamera yedek planı gerekli.");
    toast("WOS ekran yakalamayı engelliyor olabilir");
    return;
  }
  test.recycle();

  if (cfg.capture.chat) doChat();
  if (cfg.capture.online) doOnline();
  if (cfg.capture.scores) doScores();

  log("Tur bitti.");
}

function main() {
  ensureCapture();
  log("WOS Gözcü başladı. Aralık: " + cfg.loopIntervalMs / 60000 + " dk");
  while (true) {
    try {
      oneRound();
    } catch (e) {
      log("Tur hatası: " + e);
    }
    sleep(cfg.loopIntervalMs);
  }
}

main();
