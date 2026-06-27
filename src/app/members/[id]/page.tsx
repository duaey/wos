import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPower, furnaceLabel } from "@/lib/format";
import { activityStatus, statusLabel, daysSince } from "@/lib/activity";
import PowerChart from "./PowerChart";

export const dynamic = "force-dynamic";

export default async function MemberDetail({ params }: { params: { id: string } }) {
  const member = await prisma.member
    .findUnique({
      where: { id: params.id },
      include: {
        snapshots: { orderBy: { recordedAt: "asc" }, take: 200 },
        eventEntries: { include: { event: true }, orderBy: { createdAt: "desc" }, take: 20 },
      },
    })
    .catch(() => null);

  if (!member) notFound();

  const chart = member.snapshots.map((s) => ({
    date: s.recordedAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    power: Number(s.power),
  }));

  const status = activityStatus({ lastChangeAt: member.lastChangeAt });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/members">← Üyeler</Link>
        <h1 className="mt-2 text-2xl font-bold">{member.name}</h1>
        <p className="text-sm text-slate-400">UID: {member.wosUid}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Güç" value={formatPower(member.power)} />
        <Stat label="Fırın" value={furnaceLabel(member.furnaceLevel)} />
        <Stat label="Durum" value={statusLabel(status)} />
        <Stat label="Son hareket" value={`${daysSince(member.lastChangeAt)} gün önce`} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Güç gelişimi</h2>
        <PowerChart data={chart} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Etkinlik geçmişi</h2>
        {member.eventEntries.length === 0 ? (
          <p className="text-sm text-slate-400">Kayıtlı etkinlik skoru yok.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Etkinlik</th><th>Puan</th><th>Sıra</th><th>Tarih</th></tr>
            </thead>
            <tbody>
              {member.eventEntries.map((e) => (
                <tr key={e.id}>
                  <td>{e.event.name}</td>
                  <td>{formatPower(e.points)}</td>
                  <td>{e.rank ?? "-"}</td>
                  <td>{e.createdAt.toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-lg font-bold text-sky-300">{value}</div>
    </div>
  );
}
