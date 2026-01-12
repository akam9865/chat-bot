"use server";

import { createConversation } from "../lib/db/drizzle";

export async function createConversationAction() {
  const conversation = await createConversation();
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }
  return conversation.id;
}
