import crypto from "crypto";

/**
 * Whiteout Survival resmi (yarı-açık) player API istemcisi.
 *
 * Doğrulanmış davranış (GitHub Actions üzerinden gerçek FID ile test edildi):
 *   - İmza: sign = md5("fid=<fid>&time=<time>" + SALT), time = ms
 *   - İSTEK TARAYICI BAŞLIKLARI GEREKTİRİR (Origin/Referer/User-Agent),
 *     aksi halde edge 403 "Unauthorized request" döner.
 *   - Dönen veri: { code, data: { fid, nickname, kid, stove_lv, avatar_image,
 *     total_recharge_amount }, msg }
 *
 * ⚠️ API GÜÇ (power) VERMEZ. Sadece fırın seviyesi (stove_lv), isim, sunucu
 * (kid) ve avatar gelir. Güç/öldürme/skor verisi ancak ekran görüntüsü
 * (Vision AI) yoluyla elde edilir.
 */

const ENDPOINT = "https://wos-giftcode-api.centurygame.com/api/player";
const SALT = process.env.WOS_API_SALT ?? "tB87#kPtkxqOS2";

export interface WosPlayer {
  fid: string;
  nickname: string;
  furnaceLevel: number; // stove_lv
  kid: number | null; // sunucu (state) no
  avatarUrl: string | null;
  raw: unknown;
}

function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto
    .createHash("md5")
    .update(sorted + SALT)
    .digest("hex");
}

/**
 * Tek bir oyuncunun güncel verisini çeker.
 * Hata durumunda null döner (üye ID hatalı / API erişilemez).
 */
export async function fetchPlayer(fid: string): Promise<WosPlayer | null> {
  const time = String(Date.now());
  const params = { fid, time };
  const body = new URLSearchParams({ ...params, sign: sign(params) });

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Origin: "https://wos-giftcode.centurygame.com",
        Referer: "https://wos-giftcode.centurygame.com/",
        Accept: "application/json, text/plain, */*",
      },
      body,
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let json: any;
  try {
    json = await res.json();
  } catch {
    return null;
  }

  const d = json?.data;
  if (!d || d.fid == null) return null;

  return {
    fid: String(d.fid),
    nickname: String(d.nickname ?? "?"),
    furnaceLevel: Number(d.stove_lv ?? 0),
    kid: d.kid != null ? Number(d.kid) : null,
    avatarUrl: d.avatar_image ?? null,
    raw: d,
  };
}

/** Birden çok oyuncuyu sırayla (rate-limit dostu) çeker. */
export async function fetchPlayers(
  fids: string[],
  delayMs = 600
): Promise<Map<string, WosPlayer | null>> {
  const out = new Map<string, WosPlayer | null>();
  for (const fid of fids) {
    out.set(fid, await fetchPlayer(fid));
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}
