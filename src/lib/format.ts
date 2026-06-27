/** Sayı/güç biçimlendirme yardımcıları (Türkçe). */

export function formatPower(p: bigint | number): string {
  const n = typeof p === "bigint" ? Number(p) : p;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " Mr"; // milyar
  if (n >= 1e6) return (n / 1e6).toFixed(1) + " M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + " B";
  return String(n);
}

export function formatDelta(d: bigint | number): string {
  const n = typeof d === "bigint" ? Number(d) : d;
  if (n > 0) return "↑ +" + formatPower(n);
  if (n < 0) return "↓ -" + formatPower(-n);
  return "→ 0";
}

export function furnaceLabel(lv: number): string {
  // API stove_lv ham değerini gösterir (FC eşlemesi sürüme göre değişir).
  return "Sv " + lv;
}

export function furnaceDelta(d: number): string {
  if (d > 0) return "↑ +" + d;
  if (d < 0) return "↓ " + d;
  return "→ 0";
}
