import { postUserMessage } from "../../../server/ai/anthropic";
import z from "zod";
import { Role, Status } from "../../../shared/ai/schemas";
import { randomUUID } from "crypto";

const PostUserMessageSchema = z.object({
  content: z.string(),
  clientMessageId: z.string(),
  conversationId: z.string().optional(),
});

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const {
    content,
    clientMessageId,
    conversationId: existingConversationId,
  } = PostUserMessageSchema.parse(body);
  const conversationId = existingConversationId ?? randomUUID();

  const assistantMessage = await postUserMessage(content);
  const userMessage = {
    id: randomUUID(), // mock for now
    clientMessageId,
    role: Role.USER,
    status: Status.SENT,
    text: content,
    timestamp: Date.now(),
  };
  // todo: save both messages to db

  return Response.json({ conversationId, userMessage, assistantMessage });
}
