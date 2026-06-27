import { prisma } from "@/lib/db";
import { formatPower } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { entries: { orderBy: { points: "desc" } } },
    })
    .catch(() => []);

  // Etkinliğe katılmayanları bulmak için tüm üye isimleri
  const allMembers = await prisma.member.findMany({ select: { name: true } }).catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Etkinlikler</h1>
      {events.length === 0 ? (
        <p className="text-slate-400">
          Henüz etkinlik yok. Tablet skor ekranını yükleyince ya da yönetimden manuel
          eklenince burada görünür.
        </p>
      ) : (
        events.map((ev) => {
          const scored = new Set(ev.entries.map((e) => e.rawName.toLowerCase()));
          const missing = allMembers
            .map((m) => m.name)
            .filter((n) => !scored.has(n.toLowerCase()));
          return (
            <div key={ev.id} className="card">
              <h2 className="mb-2 font-semibold">
                {ev.name}{" "}
                <span className="text-sm font-normal text-slate-400">
                  {ev.createdAt.toLocaleDateString("tr-TR")}
                </span>
              </h2>
              <table>
                <thead>
                  <tr><th>#</th><th>Üye</th><th>Puan</th></tr>
                </thead>
                <tbody>
                  {ev.entries.map((e, i) => (
                    <tr key={e.id}>
                      <td>{e.rank ?? i + 1}</td>
                      <td>{e.rawName}</td>
                      <td>{formatPower(e.points)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {missing.length > 0 && (
                <p className="mt-2 text-sm text-red-400">
                  ⚠️ Katılmayan ({missing.length}): {missing.join(", ")}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
