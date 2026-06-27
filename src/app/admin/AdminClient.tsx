"use client";

import { useState } from "react";

export default function AdminClient() {
  const [uids, setUids] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function addMembers() {
    setBusy(true);
    setMsg("");
    const list = uids
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uids: list }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setMsg(`Eklendi: ${data.added.length}, Başarısız: ${data.failed.length}`);
      setUids("");
    } else {
      setMsg("Hata: " + (data.error ?? "bilinmiyor"));
    }
  }

  async function poll() {
    setBusy(true);
    setMsg("Güncelleniyor...");
    const res = await fetch("/api/poll", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    setMsg(
      data.ok
        ? `Güncellendi: ${data.updated}/${data.checked}, değişen: ${data.changed}, başarısız: ${data.failed?.length ?? 0}`
        : "Hata: " + (data.error ?? "")
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h2 className="font-semibold">Üye ekle (toplu UID)</h2>
        <textarea
          className="h-32 w-full rounded bg-slate-800 p-2 text-sm"
          placeholder="UID'leri satır/virgül/boşlukla ayırarak yapıştır&#10;33750731&#10;244886619"
          value={uids}
          onChange={(e) => setUids(e.target.value)}
        />
        <button
          onClick={addMembers}
          disabled={busy}
          className="rounded bg-sky-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          Ekle
        </button>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Veriyi güncelle</h2>
        <p className="text-sm text-slate-400">
          WOS API&apos;sinden tüm üyelerin güç/fırın verisini şimdi çeker.
        </p>
        <button
          onClick={poll}
          disabled={busy}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          Şimdi güncelle
        </button>
      </div>

      {msg && <p className="text-sm text-sky-300">{msg}</p>}
    </div>
  );
}
