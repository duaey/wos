import { prisma } from "@/lib/db";
import { fetchPlayers } from "@/lib/wos-api";

export interface PollResult {
  checked: number;
  updated: number;
  changed: number;
  failed: string[];
}

/**
 * Tüm üyeleri WOS API'sinden günceller. Güç veya fırın değiştiyse
 * yeni bir Snapshot kaydeder ve lastChangeAt'i tazeler (aktiflik için).
 */
export async function pollAllMembers(): Promise<PollResult> {
  const members = await prisma.member.findMany({
    select: { id: true, wosUid: true, power: true, furnaceLevel: true },
  });

  const result: PollResult = { checked: members.length, updated: 0, changed: 0, failed: [] };
  if (members.length === 0) return result;

  const fetched = await fetchPlayers(members.map((m) => m.wosUid));
  const now = new Date();

  for (const m of members) {
    const p = fetched.get(m.wosUid);
    if (!p) {
      result.failed.push(m.wosUid);
      continue;
    }

    const changed = p.power !== m.power || p.furnaceLevel !== m.furnaceLevel;

    await prisma.member.update({
      where: { id: m.id },
      data: {
        name: p.nickname,
        power: p.power,
        furnaceLevel: p.furnaceLevel,
        ...(changed ? { lastChangeAt: now } : {}),
        snapshots: {
          create: { power: p.power, furnaceLevel: p.furnaceLevel, recordedAt: now },
        },
      },
    });

    result.updated++;
    if (changed) result.changed++;
  }

  return result;
}
