import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import z from "zod";
import { Message, Status } from "../../shared/types/chat";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AnthropicMessageSchema = z.object({
  text: z.string(),
  type: z.union([z.literal("text")]),
});

const ChatResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  role: z.literal("assistant"),
  stop_reason: z.string(), // todo: define union, or derive from type Anthropic.Message
  type: z.string(),
  content: AnthropicMessageSchema.array(),
});

export async function postUserMessage(message: string): Promise<string> {
  const response = await client.messages.create({
    max_tokens: 100,
    messages: [{ role: "user", content: message }],
    model: "claude-3-haiku-20240307",
  });

  const data = ChatResponseSchema.parse(response);
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text || "")
    .join("");
}
