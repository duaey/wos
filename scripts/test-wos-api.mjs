/**
 * WOS resmi player API'sini tek dosyada test eder. Kurulum gerekmez.
 *
 * Kullanım:
 *   node scripts/test-wos-api.mjs <FID>
 * Örnek:
 *   node scripts/test-wos-api.mjs 33750731
 *
 * Çıktı: API'den dönen ham JSON (alan adlarını görmek için).
 */
import crypto from "node:crypto";

const SALT = process.env.WOS_API_SALT ?? "tB87#kPtkxqOS2";
const ENDPOINT = "https://wos-giftcode-api.centurygame.com/api/player";

const fid = process.argv[2];
if (!fid) {
  console.error("Kullanım: node scripts/test-wos-api.mjs <FID>");
  process.exit(1);
}

const time = String(Date.now());
const sortedParams = `fid=${fid}&time=${time}`;
const sign = crypto.createHash("md5").update(sortedParams + SALT).digest("hex");

const body = new URLSearchParams({ fid, time, sign });

console.log("İstek gönderiliyor:", ENDPOINT);
console.log("fid =", fid, "| sign =", sign);

try {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (wos-test)",
    },
    body,
  });

  console.log("\nHTTP durum:", res.status);
  const text = await res.text();
  try {
    console.log("Yanıt (JSON):");
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log("Yanıt (ham):");
    console.log(text);
  }
} catch (e) {
  console.error("\nİstek hatası:", e.message);
  console.error("(Ağ engeli veya yanlış imza olabilir)");
}
