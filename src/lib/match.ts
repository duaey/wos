import { prisma } from "@/lib/db";

/**
 * Ekrandan okunan ham ismi kayıtlı bir üyeyle eşleştirir.
 * Tam eşleşme -> normalize edilmiş eşleşme -> içerme.
 * Eşleşme yoksa null (kayıt rawName ile saklanır).
 */
const norm = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "").replace(/[^\p{L}\p{N}]/gu, "");

export async function matchMemberId(rawName: string): Promise<string | null> {
  const members = await prisma.member.findMany({ select: { id: true, name: true } });
  const target = norm(rawName);
  if (!target) return null;

  for (const m of members) if (norm(m.name) === target) return m.id;
  for (const m of members) {
    const n = norm(m.name);
    if (n && (n.includes(target) || target.includes(n))) return m.id;
  }
  return null;
}
