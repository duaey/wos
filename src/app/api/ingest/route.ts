import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { parseChat, parseScores, parseOnline } from "@/lib/vision";
import { matchMemberId } from "@/lib/match";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Tablet (Auto.js) bir ekran görüntüsü yükler. Görüntü Vision servisine
 * gönderilir, dönen yapılandırılmış veri DB'ye işlenir.
 *
 * Body: { kind: "chat"|"scores"|"online", image: base64, eventName?: string }
 * Header: Authorization: Bearer <INGEST_SECRET>
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { kind?: string; image?: string; eventName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { kind, image, eventName } = body;
  if (!kind || !image) {
    return NextResponse.json({ error: "kind ve image gerekli" }, { status: 400 });
  }

  const capture = await prisma.capture.create({ data: { kind } });

  try {
    let written = 0;

    if (kind === "chat") {
      const { messages } = await parseChat(image);
      for (const m of messages) {
        const hash = crypto
          .createHash("sha1")
          .update(`${m.name}|${m.text}|${m.timeLabel ?? ""}`)
          .digest("hex");
        const memberId = await matchMemberId(m.name);
        await prisma.chatMsg.upsert({
          where: { hash },
          create: { hash, rawName: m.name, text: m.text, sentLabel: m.timeLabel, memberId },
          update: {},
        });
        written++;
      }
    } else if (kind === "scores") {
      const { scores, event } = await parseScores(image);
      const ev = await prisma.event.create({ data: { name: eventName ?? event ?? "Etkinlik" } });
      for (const s of scores) {
        const memberId = await matchMemberId(s.name);
        await prisma.eventEntry.create({
          data: {
            eventId: ev.id,
            memberId,
            rawName: s.name,
            points: BigInt(Math.trunc(s.points) || 0),
            rank: s.rank ?? null,
          },
        });
        written++;
      }
    } else if (kind === "online") {
      const { members } = await parseOnline(image);
      const now = new Date();
      for (const o of members) {
        if (!o.online) continue;
        const id = await matchMemberId(o.name);
        if (id) {
          await prisma.member.update({ where: { id }, data: { lastChangeAt: now } });
          written++;
        }
      }
    } else {
      await prisma.capture.update({ where: { id: capture.id }, data: { status: "error", note: "bilinmeyen kind" } });
      return NextResponse.json({ error: "bilinmeyen kind" }, { status: 400 });
    }

    await prisma.capture.update({
      where: { id: capture.id },
      data: { status: "parsed", note: `${written} kayıt` },
    });
    return NextResponse.json({ ok: true, written });
  } catch (e: any) {
    await prisma.capture.update({
      where: { id: capture.id },
      data: { status: "error", note: String(e?.message ?? e) },
    });
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
