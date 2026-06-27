import Link from "next/link";
import { getMemberRows, type MemberRow } from "@/lib/queries";
import { furnaceLabel, furnaceDelta } from "@/lib/format";
import { statusLabel, daysSince } from "@/lib/activity";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  let rows: MemberRow[] = [];
  try {
    rows = await getMemberRows();
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Üyeler ({rows.length})</h1>
      {rows.length === 0 ? (
        <p className="text-slate-400">
          Üye yok. <Link href="/admin">Yönetim</Link> sayfasından ekleyin.
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Üye</th>
                <th>Fırın</th>
                <th>7g değişim</th>
                <th>Son hareket</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/members/${m.id}`}>{m.name}</Link>
                  </td>
                  <td>{furnaceLabel(m.furnaceLevel)}</td>
                  <td className={m.furnaceDelta7d > 0 ? "text-emerald-400" : "text-slate-400"}>
                    {furnaceDelta(m.furnaceDelta7d)}
                  </td>
                  <td>{daysSince(m.lastChangeAt)} gün önce</td>
                  <td>{statusLabel(m.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
