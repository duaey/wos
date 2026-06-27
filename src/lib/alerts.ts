import { prisma } from "@/lib/db";
import { activityStatus, daysSince } from "@/lib/activity";

export interface Alert {
  level: "info" | "warning" | "success";
  text: string;
  memberId?: string;
}

/**
 * İttifak için otomatik uyarılar üretir:
 *  - Uzun süredir durgun (AFK) üyeler
 *  - Son 2 etkinliğe katılmayanlar
 *  - Fırın seviyesi atlayanlar (son 7 gün) → tebrik
 */
export async function getAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  const members = await prisma.member.findMany();

  // AFK uyarıları
  for (const m of members) {
    if (activityStatus({ lastChangeAt: m.lastChangeAt, now }) === "afk") {
      alerts.push({
        level: "warning",
        text: `${m.name} ${daysSince(m.lastChangeAt, now)} gündür durgun (AFK)`,
        memberId: m.id,
      });
    }
  }

  // Fırın seviyesi atlayanlar (son 7 gün)
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  for (const m of members) {
    const old = await prisma.snapshot.findFirst({
      where: { memberId: m.id, recordedAt: { lte: weekAgo } },
      orderBy: { recordedAt: "desc" },
    });
    if (old && m.furnaceLevel > old.furnaceLevel) {
      alerts.push({
        level: "success",
        text: `${m.name} fırın seviyesi atladı: ${old.furnaceLevel} → ${m.furnaceLevel} 🎉`,
        memberId: m.id,
      });
    }
  }

  // Son 2 etkinliğe katılmayanlar
  const recentEvents = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 2,
    include: { entries: true },
  });
  if (recentEvents.length >= 2) {
    const scoredNames = new Set<string>();
    for (const ev of recentEvents)
      for (const e of ev.entries) scoredNames.add(e.rawName.toLowerCase());
    for (const m of members) {
      if (!scoredNames.has(m.name.toLowerCase())) {
        alerts.push({
          level: "warning",
          text: `${m.name} son 2 etkinliğe katılmadı`,
          memberId: m.id,
        });
      }
    }
  }

  return alerts;
}
