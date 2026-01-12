import "server-only";

import { getDb } from "../../server/db/client";
import {
  conversations as conversationsTable,
  messages as messagesTable,
} from "../../server/db/schema";
import { MessageSchema, Status, type Message } from "../../shared/types/chat";
import { and, asc, desc, eq } from "drizzle-orm";

export async function appendMessages(
  conversationId: string,
  messages: Message[]
) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx
      .insert(conversationsTable)
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
  const db = getDb();
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

export async function getConversations() {
  const db = getDb();
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.createdAt));
  return conversations;
}

export async function getChatLog(conversationId: string): Promise<Message[]> {
  const db = getDb();
  const chatLog = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(asc(messagesTable.createdAt));

  return chatLog.map((message) =>
    MessageSchema.parse({
      ...message,
      timestamp: message.createdAt.getTime(),
    })
  );
}
