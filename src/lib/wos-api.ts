import crypto from "crypto";

/**
 * Whiteout Survival resmi (yarı-açık) player API istemcisi.
 *
 * Endpoint imzalı istek bekler:
 *   sign = md5( "fid=<fid>&time=<time>" + SALT )
 * parametreler alfabetik sırada birleştirilir, sona SALT eklenir.
 *
 * SALT açık kaynak topluluk botlarından (Reloisback / whiteout-project) gelir.
 * Bu ortamın ağ politikası bu host'u engelliyor olabilir; canlı doğrulama
 * deploy ortamında yapılmalıdır.
 */

const ENDPOINT = "https://wos-giftcode-api.centurygame.com/api/player";
const SALT = process.env.WOS_API_SALT ?? "tB87#kPtkxqOS2";

export interface WosPlayer {
  fid: string;
  nickname: string;
  furnaceLevel: number; // stove_lv
  power: bigint;
  allianceTag: string | null;
  avatarUrl: string | null;
  kid: number | null; // sunucu (state) no
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
        "User-Agent": "Mozilla/5.0 (wos-alliance-tracker)",
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

  // API zarfı: { code, data: { fid, nickname, stove_lv, ... }, msg }
  const d = json?.data;
  if (!d || (json.code !== 0 && json.code !== undefined && d.fid == null)) {
    return null;
  }

  const powerRaw = d.power ?? d.total_power ?? d.stove_power ?? 0;

  return {
    fid: String(d.fid ?? fid),
    nickname: String(d.nickname ?? d.name ?? "?"),
    furnaceLevel: Number(d.stove_lv ?? d.furnace_lv ?? 0),
    power: BigInt(Math.trunc(Number(powerRaw)) || 0),
    allianceTag: d.alliance ?? d.alliance_tag ?? null,
    avatarUrl: d.avatar_image ?? d.avatar ?? null,
    kid: d.kid != null ? Number(d.kid) : null,
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
