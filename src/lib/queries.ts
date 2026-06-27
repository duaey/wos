import { prisma } from "@/lib/db";
import { activityStatus, type ActivityStatus } from "@/lib/activity";

export interface MemberRow {
  id: string;
  name: string;
  wosUid: string;
  power: bigint;
  furnaceLevel: number;
  delta7d: bigint; // son 7 gündeki güç değişimi
  status: ActivityStatus;
  lastChangeAt: Date;
}

/** Üye satırlarını 7 günlük güç değişimi ve aktiflik durumuyla döner. */
export async function getMemberRows(): Promise<MemberRow[]> {
  const members = await prisma.member.findMany({ orderBy: { power: "desc" } });
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const now = new Date();

  const rows: MemberRow[] = [];
  for (const m of members) {
    const old = await prisma.snapshot.findFirst({
      where: { memberId: m.id, recordedAt: { lte: weekAgo } },
      orderBy: { recordedAt: "desc" },
    });
    const base = old?.power ?? m.power;
    rows.push({
      id: m.id,
      name: m.name,
      wosUid: m.wosUid,
      power: m.power,
      furnaceLevel: m.furnaceLevel,
      delta7d: m.power - base,
      status: activityStatus({ lastChangeAt: m.lastChangeAt, now }),
      lastChangeAt: m.lastChangeAt,
    });
  }
  return rows;
}

export interface DashboardStats {
  memberCount: number;
  totalPower: bigint;
  active: number;
  slow: number;
  afk: number;
  topGainers: MemberRow[];
  topStalled: MemberRow[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await getMemberRows();
  const totalPower = rows.reduce((s, r) => s + r.power, BigInt(0));
  const sortedByGain = [...rows].sort((a, b) => Number(b.delta7d - a.delta7d));
  return {
    memberCount: rows.length,
    totalPower,
    active: rows.filter((r) => r.status === "active").length,
    slow: rows.filter((r) => r.status === "slow").length,
    afk: rows.filter((r) => r.status === "afk").length,
    topGainers: sortedByGain.slice(0, 3),
    topStalled: [...rows]
      .filter((r) => r.status === "afk")
      .sort((a, b) => a.lastChangeAt.getTime() - b.lastChangeAt.getTime())
      .slice(0, 3),
  };
}
