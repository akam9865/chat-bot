import {
  type Conversation,
  ConversationSchema,
} from "@repo/storage/types";
import z from "zod";

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/conversations", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json: unknown = await res.json();
  return z.array(ConversationSchema).parse(json);
}

export async function createConversation(): Promise<Conversation> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json: unknown = await res.json();
  return ConversationSchema.parse(json);
}
