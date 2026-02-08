import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import z from "zod";
import { Message, Role } from "../../shared/types/chat";

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

const Models = {
  cheap: "claude-3-haiku-20240307",
  haiku: "claude-haiku-4-5-20251001",
} as const;

export async function sendUserMessage(
  history: Message[],
  message: string,
): Promise<string> {
  const messages = [
    ...history.map((message) => ({
      role: message.role,
      content: message.text,
    })),
    { role: Role.USER, content: message },
  ];

  const response = await client.messages.create({
    max_tokens: 10_000,
    // system: "you are an expert in ...", // todo: add system presets + plain text input
    messages: messages,
    model: Models.haiku,
  });

  return parseAnthropicResponse(response);
}

export async function generateConversationTitle(
  userMessage: string,
): Promise<string> {
  const response = await client.messages.create({
    max_tokens: 30,
    messages: [
      {
        role: "user",
        content: `Generate a short title (max 5 words) for a conversation that starts with this message. Reply with only the title, no quotes or punctuation.\n\nMessage: ${userMessage}`,
      },
    ],
    model: Models.cheap,
  });

  return parseAnthropicResponse(response);
}

function parseAnthropicResponse(response: Anthropic.Message): string {
  const data = ChatResponseSchema.parse(response);
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
