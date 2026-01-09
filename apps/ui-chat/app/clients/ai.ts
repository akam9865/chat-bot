import { type Message, MessageSchema } from "../../shared/ai/schemas";

export async function sendMessage(message: string): Promise<Message> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // todo: JWT
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json: unknown = await res.json();
  return MessageSchema.parse(json);
}
