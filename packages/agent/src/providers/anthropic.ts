import Anthropic from "@anthropic-ai/sdk";
import z from "zod";
import type { LLMMessage, LLMProvider } from "../types";

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

function parseResponse(response: Anthropic.Message): string {
  const data = ChatResponseSchema.parse(response);
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async sendUserMessage(
    history: LLMMessage[],
    message: string,
  ): Promise<string> {
    const messages = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await this.client.messages.create({
      max_tokens: 10_000,
      messages: messages,
      model: Models.haiku,
    });

    return parseResponse(response);
  }

  async generateConversationTitle(userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      max_tokens: 30,
      messages: [
        {
          role: "user",
          content: `Generate a short title (max 5 words) for a conversation that starts with this message. Reply with only the title, no quotes or punctuation.\n\nMessage: ${userMessage}`,
        },
      ],
      model: Models.cheap,
    });

    return parseResponse(response);
  }
}
