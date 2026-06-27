import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";
import { getAlerts, type Alert } from "@/lib/alerts";
import { furnaceLabel, furnaceDelta } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  let alerts: Alert[] = [];
  try {
    stats = await getDashboardStats();
    alerts = await getAlerts();
  } catch {
    return <EmptyState />;
  }
  if (stats.memberCount === 0) return <EmptyState />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">İttifak Paneli</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Üye" value={String(stats.memberCount)} />
        <Stat label="Ort. Fırın" value={furnaceLabel(stats.avgFurnace)} />
        <Stat label="🟢 Aktif" value={String(stats.active)} />
        <Stat label="🔴 AFK" value={String(stats.afk)} />
      </div>

      <p className="text-xs text-slate-500">
        Otomatik takip: fırın seviyesi + isim değişimi (resmi API). Güç/öldürme/skor
        verisi ekran görüntüsü yoluyla gelir — WOS API'si bunları vermez.
      </p>

      {alerts.length > 0 && (
        <div className="card">
          <h2 className="mb-2 font-semibold">🔔 Uyarılar</h2>
          <ul className="space-y-1 text-sm">
            {alerts.slice(0, 12).map((a, i) => (
              <li
                key={i}
                className={
                  a.level === "warning"
                    ? "text-amber-400"
                    : a.level === "success"
                    ? "text-emerald-400"
                    : "text-slate-300"
                }
              >
                {a.memberId ? (
                  <Link href={`/members/${a.memberId}`}>{a.text}</Link>
                ) : (
                  a.text
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold">📈 Son fırın atlayanlar</h2>
          {stats.recentlyLeveled.length === 0 ? (
            <p className="text-sm text-slate-400">Son 7 günde fırın atlayan yok.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {stats.recentlyLeveled.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <Link href={`/members/${m.id}`}>{m.name}</Link>
                  <span className="text-emerald-400">{furnaceDelta(m.furnaceDelta7d)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">⚠️ Uzun süredir durgun</h2>
          {stats.topStalled.length === 0 ? (
            <p className="text-sm text-slate-400">AFK üye yok 🎉</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {stats.topStalled.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <Link href={`/members/${m.id}`}>{m.name}</Link>
                  <span className="text-red-400">durgun</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link href="/members" className="inline-block">
        → Tüm üyeleri gör
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="stat">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card text-center">
      <h1 className="mb-2 text-xl font-bold">Henüz üye yok</h1>
      <p className="text-slate-400">
        Başlamak için <Link href="/admin">Yönetim</Link> sayfasından ittifak üyelerinin
        WOS UID&apos;lerini ekleyin. Veritabanı bağlı değilse önce <code>DATABASE_URL</code>{" "}
        ayarlayıp <code>npm run db:push</code> çalıştırın.
      </p>
    </div>
  );
}
