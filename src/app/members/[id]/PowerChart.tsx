"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface Point {
  date: string;
  furnace: number;
}

/** Fırın seviyesinin zaman içindeki değişimi (basamak grafik). */
export default function FurnaceChart({ data }: { data: Point[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-slate-400">Grafik için yeterli veri yok (en az 2 snapshot).</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          formatter={(v: number) => ["Sv " + v, "Fırın"]}
        />
        <Line type="stepAfter" dataKey="furnace" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
