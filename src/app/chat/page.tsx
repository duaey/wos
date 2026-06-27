import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const msgs = await prisma.chatMsg
    .findMany({ orderBy: { capturedAt: "desc" }, take: 100 })
    .catch(() => []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">İttifak Chat</h1>
      <p className="text-sm text-slate-400">
        Tablet (Auto.js) tarafından yakalanıp Vision AI ile okunan son mesajlar.
      </p>
      {msgs.length === 0 ? (
        <p className="text-slate-400">Henüz chat mesajı yakalanmadı.</p>
      ) : (
        <div className="card space-y-2">
          {msgs.map((m) => (
            <div key={m.id} className="border-b border-slate-800 pb-2 last:border-0">
              <span className="font-semibold text-sky-300">{m.rawName}</span>{" "}
              <span className="text-xs text-slate-500">{m.sentLabel ?? ""}</span>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
