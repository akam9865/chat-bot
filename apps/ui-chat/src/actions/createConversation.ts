"use server";

import { revalidatePath } from "next/cache";
import { createConversation } from "../lib/db/drizzle";
import { getAuthorization } from "../lib/auth/getAuthorization";

export async function createConversationAction() {
  const user = await getAuthorization();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const conversation = await createConversation(user.userId);
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }
  revalidatePath("/");
  return conversation;
}
