import { prisma } from "@/lib/db";
import { activityStatus, statusLabel } from "@/lib/activity";
import { furnaceLabel } from "@/lib/format";

/**
 * Chat asistanına verilecek kısa ittifak verisi özeti.
 * "kim AFK", "X'in fırın seviyesi" gibi soruları cevaplayabilmesi için.
 */
export async function buildAllianceContext(): Promise<string> {
  const members = await prisma.member
    .findMany({ orderBy: { furnaceLevel: "desc" } })
    .catch(() => []);
  if (members.length === 0) return "Kayıtlı üye yok.";

  const now = new Date();
  const lines = members.map((m) => {
    const st = statusLabel(activityStatus({ lastChangeAt: m.lastChangeAt, now }));
    return `- ${m.name}: ${furnaceLabel(m.furnaceLevel)}, ${st}`;
  });

  const recentEvent = await prisma.event
    .findFirst({
      orderBy: { createdAt: "desc" },
      include: { entries: { orderBy: { points: "desc" }, take: 5 } },
    })
    .catch(() => null);

  let eventText = "";
  if (recentEvent) {
    const top = recentEvent.entries
      .map((e, i) => `${i + 1}. ${e.rawName} (${e.points})`)
      .join(", ");
    eventText = `\nSon etkinlik "${recentEvent.name}" ilk 5: ${top}`;
  }

  return `İttifak üyeleri (${members.length}):\n${lines.join("\n")}${eventText}`;
}
