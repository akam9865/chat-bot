import { type ChatTurn, ChatTurnSchema } from "../../shared/ai/schemas";

export async function sendMessage(
  content: string,
  clientMessageId: string,
  conversationId?: string
): Promise<ChatTurn> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // todo: JWT
    body: JSON.stringify({ content, clientMessageId, conversationId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json: unknown = await res.json();
  return ChatTurnSchema.parse(json);
}
