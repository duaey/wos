import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { parseChat, answerQuestion } from "@/lib/vision";
import { buildAllianceContext } from "@/lib/context";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Oyun içi chat botu orkestratörü.
 *
 * Tablet bir chat ekran görüntüsü yükler. Sistem:
 *   1. Vision ile mesajları okur
 *   2. Tetikleyici kelimeyi (BOT_TRIGGER) içeren YENİ mention'ları bulur
 *   3. Her biri için Claude'dan ittifak verisiyle yanıt üretir
 *   4. Yanıtları (hash'leriyle) tablete döner — tablet bunları chat'e yazar
 *
 * Body: { image: base64, answered?: string[] }
 * Header: Authorization: Bearer <INGEST_SECRET>
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const trigger = (process.env.BOT_TRIGGER ?? "bot").toLowerCase();

  let body: { image?: string; answered?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.image) return NextResponse.json({ error: "image gerekli" }, { status: 400 });

  const answered = new Set(body.answered ?? []);

  try {
    const { messages } = await parseChat(body.image);

    // Tetikleyiciyi içeren ve daha önce cevaplanmamış mesajları seç
    const pending = [];
    for (const m of messages) {
      const hash = crypto.createHash("sha1").update(`${m.name}|${m.text}`).digest("hex");
      if (answered.has(hash)) continue;
      if (!m.text.toLowerCase().includes(trigger)) continue;
      pending.push({ hash, name: m.name, text: m.text });
    }

    if (pending.length === 0) return NextResponse.json({ replies: [] });

    // İttifak verisini bir kez hazırla (tüm yanıtlarda kullanılır)
    const context = await buildAllianceContext();

    const replies = [];
    for (const p of pending) {
      const question = `${p.name} sordu: ${p.text}`;
      const text = await answerQuestion(question, context);
      replies.push({ hash: p.hash, to: p.name, text });
    }

    return NextResponse.json({ replies });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
