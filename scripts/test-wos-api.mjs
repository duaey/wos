/**
 * WOS resmi player API'sini test eder — birden çok başlık/biçim varyantı dener.
 * Kurulum gerekmez.
 *
 * Kullanım:  node scripts/test-wos-api.mjs <FID>
 */
import crypto from "node:crypto";

const SALT = process.env.WOS_API_SALT ?? "tB87#kPtkxqOS2";
const ENDPOINT = "https://wos-giftcode-api.centurygame.com/api/player";

const fid = process.argv[2];
if (!fid) {
  console.error("Kullanım: node scripts/test-wos-api.mjs <FID>");
  process.exit(1);
}

function sign(fid, time) {
  return crypto.createHash("md5").update(`fid=${fid}&time=${time}${SALT}`).digest("hex");
}

async function attempt(label, { headers, timeMs }) {
  const time = String(timeMs ? Date.now() : Math.floor(Date.now() / 1000));
  const body = new URLSearchParams({ fid, time, sign: sign(fid, time) });
  console.log(`\n===== ${label} =====`);
  console.log("time =", time);
  try {
    const res = await fetch(ENDPOINT, { method: "POST", headers, body });
    console.log("HTTP", res.status);
    const text = await res.text();
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      console.log("ham:", text.slice(0, 300));
    }
  } catch (e) {
    console.log("hata:", e.message);
  }
}

const FORM = "application/x-www-form-urlencoded";

await attempt("A: minimal (ms)", {
  timeMs: true,
  headers: { "Content-Type": FORM },
});

await attempt("B: tarayıcı UA + Origin/Referer (ms)", {
  timeMs: true,
  headers: {
    "Content-Type": FORM,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Origin: "https://wos-giftcode.centurygame.com",
    Referer: "https://wos-giftcode.centurygame.com/",
    Accept: "application/json, text/plain, */*",
  },
});

await attempt("C: tarayıcı başlıkları (saniye)", {
  timeMs: false,
  headers: {
    "Content-Type": FORM,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Origin: "https://wos-giftcode.centurygame.com",
    Referer: "https://wos-giftcode.centurygame.com/",
    Accept: "application/json, text/plain, */*",
  },
});
