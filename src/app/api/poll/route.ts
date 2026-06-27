import { NextRequest, NextResponse } from "next/server";
import { pollAllMembers } from "@/lib/poll";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * WOS API poller'ını tetikler. Cron (Vercel Cron / harici zamanlayıcı)
 * veya yönetim panelindeki "Şimdi güncelle" butonu çağırır.
 * Authorization: Bearer <CRON_SECRET> gerektirir.
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await pollAllMembers();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
