import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchPlayer } from "@/lib/wos-api";

export const dynamic = "force-dynamic";

/** Mevcut üyeleri listeler. */
export async function GET() {
  const members = await prisma.member.findMany({ orderBy: { power: "desc" } });
  return NextResponse.json(
    members.map((m) => ({ ...m, power: m.power.toString() }))
  );
}

/**
 * Toplu üye ekler. Body: { uids: string[] }
 * Her UID için WOS API'den ilk veri çekilip kaydedilir.
 */
export async function POST(req: NextRequest) {
  let body: { uids?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const uids = (body.uids ?? []).map((u) => String(u).trim()).filter(Boolean);
  if (uids.length === 0) return NextResponse.json({ error: "uids gerekli" }, { status: 400 });

  const added: string[] = [];
  const failed: string[] = [];

  for (const uid of uids) {
    const p = await fetchPlayer(uid);
    try {
      await prisma.member.upsert({
        where: { wosUid: uid },
        create: {
          wosUid: uid,
          name: p?.nickname ?? `UID ${uid}`,
          power: p?.power ?? BigInt(0),
          furnaceLevel: p?.furnaceLevel ?? 0,
          snapshots: p
            ? { create: { power: p.power, furnaceLevel: p.furnaceLevel } }
            : undefined,
        },
        update: p
          ? { name: p.nickname, power: p.power, furnaceLevel: p.furnaceLevel }
          : {},
      });
      added.push(uid);
    } catch {
      failed.push(uid);
    }
  }

  return NextResponse.json({ ok: true, added, failed });
}

/** Üye siler. Body: { id: string } */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  await prisma.member.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
