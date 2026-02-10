import { getDb } from "../client";
import {
  conversations as conversationsTable,
  messages as messagesTable,
} from "../schema";
import { MessageSchema, Status, type Message } from "../types/chat";
import { and, asc, desc, eq } from "drizzle-orm";

export async function appendMessages(
  conversationId: string,
  messages: Message[],
) {
  const db = getDb();
  const values = messages.map((message) => ({
    conversationId,
    clientMessageId: message.clientMessageId,
    role: message.role,
    text: message.text,
    status: message.status,
    createdAt: new Date(message.timestamp),
  }));

  return await db
    .insert(messagesTable)
    .values(values)
    .onConflictDoNothing()
    .returning();
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  const db = getDb();
  await db
    .update(conversationsTable)
    .set({ title })
    .where(eq(conversationsTable.id, conversationId));
}

export async function updateMessage(
  conversationId: string,
  messageId: string,
  text: string,
) {
  const db = getDb();
  const [res] = await db
    .update(messagesTable)
    .set({ text, status: Status.SENT })
    .where(
      and(
        eq(messagesTable.clientMessageId, messageId),
        eq(messagesTable.conversationId, conversationId),
      ),
    )
    .returning();
  return res;
}

export async function getConversations(userId: string) {
  const db = getDb();
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(desc(conversationsTable.createdAt));
  return conversations;
}

export async function getChatLog(
  conversationId: string,
  userId: string,
): Promise<Message[]> {
  const db = getDb();

  // Check the conversation belongs to this user
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, conversationId),
        eq(conversationsTable.userId, userId),
      ),
    );

  if (!conversation) {
    return [];
  }

  const chatLog = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(asc(messagesTable.createdAt));

  return chatLog.map((message) =>
    MessageSchema.parse({
      ...message,
      timestamp: message.createdAt.getTime(),
    }),
  );
}

export async function createConversation(userId: string) {
  const db = getDb();
  const [conversation] = await db
    .insert(conversationsTable)
    .values({
      id: crypto.randomUUID(),
      userId,
    })
    .returning();
  return conversation;
}
