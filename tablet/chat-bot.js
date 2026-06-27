/**
 * WOS Oyun İçi AI Chat Botu — AutoX.js / Auto.js
 * ===============================================
 * Eski ADB tabanlı botun ADB'siz (erişilebilirlik) sürümü.
 *
 * Döngü:
 *   chat ekranını fotoğrafla → backend /api/chatbot'a yükle
 *   → backend Vision ile mesajları okur, tetikleyiciyi içeren YENİ mention'ları
 *     bulur, Claude ile ittifak verisini kullanarak cevap üretir
 *   → dönen cevapları chat kutusuna yaz + gönder
 *
 * ADB KULLANMAZ → eski botun sürekli yediği ADB ban'ı bu vektörde yok.
 * (Yine de erişilebilirlik otomasyonu %100 risksiz değildir.)
 *
 * Gerekli template'ler (/sdcard/wos-templates/):
 *   chat-icon.png, chat-input.png, send-button.png
 */

var cfg = require("./config.js");

function log(m) {
  console.log("[" + new Date().toLocaleTimeString() + "] " + m);
}
function sleep(ms) {
  java.lang.Thread.sleep(ms);
}

function ensureCapture() {
  if (!requestScreenCapture(false)) {
    toast("Ekran yakalama izni reddedildi");
    exit();
  }
}

// --- cevaplanan mention hash'leri (tekrarı önlemek için) ---
function loadAnswered() {
  try {
    if (files.exists(cfg.chatBot.answeredFile)) {
      return JSON.parse(files.read(cfg.chatBot.answeredFile));
    }
  } catch (e) {}
  return [];
}
function saveAnswered(arr) {
  // son 300 hash yeterli
  var trimmed = arr.slice(-300);
  files.write(cfg.chatBot.answeredFile, JSON.stringify(trimmed));
}

function grabBase64() {
  var img = captureScreen();
  var b64 = images.toBase64(img, "png", 100);
  img.recycle();
  return b64;
}

function tapTemplate(name) {
  var path = cfg.templateDir + "/" + name + ".png";
  if (!files.exists(path)) {
    log("Template yok: " + name);
    return null;
  }
  var screen = captureScreen();
  var tpl = images.read(path);
  var p = images.findImage(screen, tpl, { threshold: cfg.matchThreshold });
  tpl.recycle();
  screen.recycle();
  if (p) {
    click(p.x + 10, p.y + 10);
    sleep(1200);
    return p;
  }
  return null;
}

/** Chat kutusuna metni yazar ve gönderir. */
function sendChat(text) {
  // mesaj kutusunu aç
  if (!tapTemplate("chat-input")) {
    log("chat-input bulunamadı, mesaj yazılamadı");
    return false;
  }
  sleep(800);
  // EditText bul ve metni yaz (erişilebilirlik — ADB değil)
  var box = className("android.widget.EditText").findOnce();
  if (box) {
    box.setText(text);
  } else {
    // yedek: panoya koy + yapıştır
    setClip(text);
    sleep(400);
    longClick(device.width / 2, device.height - 100);
    sleep(800);
  }
  sleep(800);
  // gönder
  if (!tapTemplate("send-button")) {
    log("send-button bulunamadı");
    return false;
  }
  sleep(1000);
  return true;
}

function openChat() {
  app.launchPackage(cfg.wosPackage);
  sleep(cfg.stepDelayMs * 2);
  return tapTemplate("chat-icon") !== null;
}

function oneCycle(answered) {
  if (!openChat()) {
    log("Chat açılamadı");
    return answered;
  }
  sleep(cfg.stepDelayMs);

  var b64 = grabBase64();
  var res = http.postJson(
    cfg.serverUrl + "/api/chatbot",
    { image: b64, answered: answered },
    { headers: { Authorization: "Bearer " + cfg.ingestSecret } }
  );

  if (res.statusCode !== 200) {
    log("chatbot HTTP " + res.statusCode);
    return answered;
  }

  var data = res.body.json();
  var replies = data.replies || [];
  if (replies.length === 0) {
    log("Yeni mention yok");
    return answered;
  }

  for (var i = 0; i < replies.length; i++) {
    var r = replies[i];
    log("Cevap → " + r.to + ": " + r.text.substring(0, 40));
    if (sendChat(r.text)) {
      answered.push(r.hash);
    }
    sleep(1500);
  }
  saveAnswered(answered);
  return answered;
}

function main() {
  if (!cfg.chatBot.enabled) {
    log("chatBot kapalı (config.js)");
    exit();
  }
  ensureCapture();
  log("WOS Chat Botu başladı. Aralık: " + cfg.chatBot.pollMs / 1000 + " sn");
  var answered = loadAnswered();
  while (true) {
    try {
      answered = oneCycle(answered);
    } catch (e) {
      log("Döngü hatası: " + e);
    }
    sleep(cfg.chatBot.pollMs);
  }
}

main();
