/**
 * duaey/gpt Vision AI servisi istemcisi.
 * Ekran görüntüsünü (base64) gönderir, yapılandırılmış JSON alır.
 */

const BASE = process.env.VISION_SERVICE_URL ?? "http://localhost:8787";
const KEY = process.env.VISION_SERVICE_KEY ?? "";

export interface ChatLine {
  name: string;
  text: string;
  timeLabel?: string;
}
export interface ScoreLine {
  name: string;
  points: number;
  rank?: number;
}
export interface OnlineLine {
  name: string;
  online: boolean;
}

type Kind = "chat" | "scores" | "online";

async function call<T>(path: string, imageBase64: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
    },
    body: JSON.stringify({ image: imageBase64 }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`vision ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export function parseChat(imageBase64: string) {
  return call<{ messages: ChatLine[] }>("/parse-chat", imageBase64);
}

/** Chat asistanı: soruyu (opsiyonel ittifak verisiyle) yanıtlar. */
export async function answerQuestion(question: string, context?: string): Promise<string> {
  const res = await fetch(`${BASE}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
    },
    body: JSON.stringify({ question, context }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`vision /answer -> ${res.status}`);
  const data = (await res.json()) as { reply: string };
  return data.reply;
}
export function parseScores(imageBase64: string) {
  return call<{ event?: string; scores: ScoreLine[] }>("/parse-scores", imageBase64);
}
export function parseOnline(imageBase64: string) {
  return call<{ members: OnlineLine[] }>("/parse-online", imageBase64);
}

export type { Kind };
