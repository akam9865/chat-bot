"use server";

import { revalidatePath } from "next/cache";
import { createConversation } from "../lib/db/drizzle";

export async function createConversationAction() {
  const conversation = await createConversation();
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }
  revalidatePath("/");
  return conversation;
}
