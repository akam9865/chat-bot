import {
  appendMessages,
  getChatLog,
  updateConversationTitle,
  updateMessage,
} from "@repo/storage";
import { type Message, Role, Status } from "@repo/storage/types";
import { AnthropicProvider } from "@repo/agent";

import z from "zod";
import { NextResponse } from "next/server";
import { requireAuthorization } from "../../../lib/auth/requireAuthorization";

const llm = new AnthropicProvider(process.env.ANTHROPIC_API_KEY!);

const PostMessageTurnSchema = z.object({
  content: z.string(),
  userClientMessageId: z.string(),
  assistantClientMessageId: z.string(),
  conversationId: z.string(),
});

type PostMessageTurnBody = z.infer<typeof PostMessageTurnSchema>;

export async function POST(request: Request) {
  const { user, response } = await requireAuthorization();
  if (response) return response;

  try {
    const userId = user.userId;
    const body = await parseMessageTurnBody(request);
    // Get the chat log before saving to the db. Simple way to avoid duplicates and empty assistant messages.
    const chatLog = await getChatLog(body.conversationId, userId);

    const [title, savedMessages, assistantResponse] = await Promise.all([
      generateTitleOnFirstMessage(chatLog, body.content),
      insertMessageTurn(body),
      callLlm(chatLog, body.content),
    ]);

    const [updatedAssistantMessage] = await Promise.all([
      updateMessage(
        body.conversationId,
        body.assistantClientMessageId,
        assistantResponse,
      ),
      title ? updateConversationTitle(body.conversationId, title) : undefined,
    ]);

    const messages = savedMessages.map((message) => {
      if (
        message.clientMessageId === updatedAssistantMessage?.clientMessageId
      ) {
        return {
          ...message,
          status: updatedAssistantMessage.status,
          text: updatedAssistantMessage.text,
        };
      }
      return message;
    });

    return NextResponse.json({ ok: true, messages, title });
  } catch (e) {
    return handleMessageError(e);
  }
}

class BadRequestError extends Error {
  status = 400 as const;
}

async function parseMessageTurnBody(
  req: Request,
): Promise<PostMessageTurnBody> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new BadRequestError("Invalid JSON");
  }

  return PostMessageTurnSchema.parse(json);
}

async function insertMessageTurn(body: PostMessageTurnBody) {
  const now = Date.now();
  return await appendMessages(body.conversationId, [
    {
      role: Role.USER,
      clientMessageId: body.userClientMessageId,
      text: body.content,
      status: Status.SENT,
      timestamp: now,
    },
    {
      role: Role.ASSISTANT,
      clientMessageId: body.assistantClientMessageId,
      text: "",
      status: Status.PENDING,
      timestamp: now + 1,
    },
  ]);
}

// TODO: consider multiple messages until we're confident in the title
function generateTitleOnFirstMessage(chatLog: Message[], content: string) {
  if (chatLog.length > 0) {
    return undefined;
  }

  return llm.generateConversationTitle(content).catch(() => undefined);
}

// todo: split on status codes and add context
class LlmError extends Error {}

async function callLlm(history: Message[], text: string) {
  try {
    // TODO: rename Message.text to Message.content to align with LLM conventions
    const messages = history.map((m) => ({ role: m.role, content: m.text }));
    return await llm.sendUserMessage(messages, text);
  } catch (e) {
    throw new LlmError();
  }
}

function handleMessageError(e: any) {
  if (e instanceof BadRequestError) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: e.status },
    );
  }
  if (e instanceof LlmError) {
    return NextResponse.json(
      { ok: false, error: "llm error" },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { ok: false, error: "internal server error" },
    { status: 500 },
  );
}
