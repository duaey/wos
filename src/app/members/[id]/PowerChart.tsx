"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface Point {
  date: string;
  power: number;
}

export default function PowerChart({ data }: { data: Point[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-slate-400">Grafik için yeterli veri yok (en az 2 snapshot).</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          formatter={(v: number) => [(v / 1e6).toFixed(2) + "M", "Güç"]}
        />
        <Line type="monotone" dataKey="power" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
