import {
  type SendMessageResponse,
  SendMessageResponseSchema,
} from "@repo/storage/types";

export async function sendMessage({
  conversationId,
  userClientMessageId,
  assistantClientMessageId,
  text,
}: {
  conversationId: string;
  userClientMessageId: string;
  assistantClientMessageId: string;
  text: string;
}): Promise<SendMessageResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      userClientMessageId,
      assistantClientMessageId,
      conversationId,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json: unknown = await res.json();

  return SendMessageResponseSchema.parse(json);
}
