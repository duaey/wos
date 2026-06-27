/** Aktiflik / AFK hesaplama yardımcıları. */

export type ActivityStatus = "active" | "slow" | "afk";

export interface ActivityInput {
  lastChangeAt: Date; // güç/fırın en son ne zaman değişti
  now?: Date;
}

/**
 * Üyenin güç/fırın verisinin en son ne zaman değiştiğine bakarak
 * aktiflik durumunu belirler. WOS chat verisi olmadan "kim oynuyor"
 * sorusunun en güvenilir cevabı budur.
 *
 *  - 2 günden kısa süre önce ilerleme  -> active (🟢)
 *  - 2-5 gün arası                       -> slow   (🟡)
 *  - 5 günden uzun süredir durgun        -> afk    (🔴)
 */
export function activityStatus({ lastChangeAt, now = new Date() }: ActivityInput): ActivityStatus {
  const days = (now.getTime() - lastChangeAt.getTime()) / 86_400_000;
  if (days < 2) return "active";
  if (days < 5) return "slow";
  return "afk";
}

export function statusLabel(s: ActivityStatus): string {
  return s === "active" ? "🟢 Aktif" : s === "slow" ? "🟡 Yavaş" : "🔴 AFK";
}

export function daysSince(d: Date, now = new Date()): number {
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}
