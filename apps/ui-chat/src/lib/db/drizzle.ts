import "server-only";

import { getDb } from "../../server/db/client";
import {
  conversations,
  messages as messagesTable,
} from "../../server/db/schema";
import { Status, type Message } from "../../shared/types/chat";
import { and, eq } from "drizzle-orm";

const db = getDb();

export async function appendMessages(
  conversationId: string,
  messages: Message[]
) {
  await db.transaction(async (tx) => {
    await tx
      .insert(conversations)
      .values({ id: conversationId })
      .onConflictDoNothing();

    const values = messages.map((message) => ({
      conversationId,
      clientMessageId: message.clientMessageId,
      role: message.role,
      text: message.text,
      status: message.status,
      createdAt: new Date(message.timestamp),
    }));

    await tx
      .insert(messagesTable)
      .values(values)
      .onConflictDoNothing()
      .returning();
  });

  return messages.map((message) => ({
    clientMessageId: message.clientMessageId,
    text: message.text,
    status: Status.SENT, // CHAT-11: ai messages are pending at this moment
  }));
}

export async function updateMessage(
  conversationId: string,
  messageId: string,
  text: string
) {
  await db
    .update(messagesTable)
    .set({ text, status: Status.SENT })
    .where(
      and(
        eq(messagesTable.clientMessageId, messageId),
        eq(messagesTable.conversationId, conversationId)
      )
    );
}
