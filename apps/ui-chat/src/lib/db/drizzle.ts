import "server-only";

import { getDb } from "../../server/db/client";
import {
  conversations as conversationsTable,
  messages as messagesTable,
  users as usersTable,
} from "../../server/db/schema";
import { MessageSchema, Status, type Message } from "../../shared/types/chat";
import { and, asc, desc, eq } from "drizzle-orm";

export async function createUser(type: "guest" | "admin") {
  const db = getDb();
  const [user] = await db.insert(usersTable).values({ type }).returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function findOrCreateAdmin() {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.type, "admin"))
    .limit(1);
  if (existing) return existing;
  return createUser("admin");
}

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

export async function saveConversation(conversationId: string, userId: string) {
  const db = getDb();
  await db
    .insert(conversationsTable)
    .values({ id: conversationId, userId })
    .onConflictDoNothing();
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
