import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull(),
    clientMessageId: uuid("client_message_id").notNull(),
    role: text("role").notNull(),
    text: text("text").notNull(),
    status: text("status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("messages_conversation_client_message_unique").on(
      t.conversationId,
      t.clientMessageId
    ),
  ]
);
