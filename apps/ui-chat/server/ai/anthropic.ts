import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import z from "zod";
import { Message } from "../../shared/ai/schemas";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MessageSchema = z.object({
  text: z.string(),
  type: z.union([z.literal("text")]),
});

const ChatResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  role: z.literal("assistant"),
  stop_reason: z.string(), // todo: define union
  type: z.string(),
  content: MessageSchema.array(),
});

export async function postUserMessage(message: string): Promise<Message> {
  const response = await client.messages.create({
    max_tokens: 100,
    messages: [{ role: "user", content: message }],
    model: "claude-3-haiku-20240307",
  });

  const data = ChatResponseSchema.parse(response);
  const text = data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text || "")
    .join("");

  return {
    id: data.id,
    role: data.role,
    text,
  };
}
