import { prisma } from "@/lib/db";
import { activityStatus, type ActivityStatus } from "@/lib/activity";

export interface MemberRow {
  id: string;
  name: string;
  wosUid: string;
  furnaceLevel: number;
  furnaceDelta7d: number; // son 7 gündeki fırın seviyesi değişimi
  status: ActivityStatus;
  lastChangeAt: Date;
}

/** Üye satırlarını 7 günlük fırın değişimi ve aktiflik durumuyla döner. */
export async function getMemberRows(): Promise<MemberRow[]> {
  const members = await prisma.member.findMany({
    orderBy: [{ furnaceLevel: "desc" }, { name: "asc" }],
  });
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const now = new Date();

  const rows: MemberRow[] = [];
  for (const m of members) {
    const old = await prisma.snapshot.findFirst({
      where: { memberId: m.id, recordedAt: { lte: weekAgo } },
      orderBy: { recordedAt: "desc" },
    });
    const base = old?.furnaceLevel ?? m.furnaceLevel;
    rows.push({
      id: m.id,
      name: m.name,
      wosUid: m.wosUid,
      furnaceLevel: m.furnaceLevel,
      furnaceDelta7d: m.furnaceLevel - base,
      status: activityStatus({ lastChangeAt: m.lastChangeAt, now }),
      lastChangeAt: m.lastChangeAt,
    });
  }
  return rows;
}

export interface DashboardStats {
  memberCount: number;
  avgFurnace: number;
  active: number;
  slow: number;
  afk: number;
  recentlyLeveled: MemberRow[]; // son 7 günde fırın atlayanlar
  topStalled: MemberRow[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await getMemberRows();
  const avgFurnace =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + r.furnaceLevel, 0) / rows.length);

  return {
    memberCount: rows.length,
    avgFurnace,
    active: rows.filter((r) => r.status === "active").length,
    slow: rows.filter((r) => r.status === "slow").length,
    afk: rows.filter((r) => r.status === "afk").length,
    recentlyLeveled: rows
      .filter((r) => r.furnaceDelta7d > 0)
      .sort((a, b) => b.furnaceDelta7d - a.furnaceDelta7d)
      .slice(0, 3),
    topStalled: [...rows]
      .filter((r) => r.status === "afk")
      .sort((a, b) => a.lastChangeAt.getTime() - b.lastChangeAt.getTime())
      .slice(0, 3),
  };
}
