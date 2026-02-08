import {
  generateTitle,
  postUserMessage,
} from "../../../server/ai/anthropic";
import z from "zod";
import { Message, Role, Status } from "../../../shared/types/chat";
import { NextResponse } from "next/server";
import { getAuthorization } from "../../../lib/auth/getAuthorization";
import {
  appendMessages,
  getChatLog,
  saveConversation,
  updateMessage,
} from "../../../lib/db/drizzle";

const PostMessageTurnSchema = z.object({
  content: z.string(),
  userClientMessageId: z.string(),
  assistantClientMessageId: z.string(),
  conversationId: z.string(),
});

type PostMessageTurnBody = z.infer<typeof PostMessageTurnSchema>;

export async function POST(request: Request) {
  const user = await getAuthorization();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = user.userId;
    const body = await parseMessageTurnBody(request);
    // Get the chat log before saving to the db. Simple way to avoid duplicates and empty assistant messages.
    const chatLog = await getChatLog(body.conversationId, userId);

    // Insert conversation if it doesn't exist, generate title on first message
    const isFirstMessage = chatLog.length === 0;
    const titlePromise = isFirstMessage
      ? generateTitle(body.content).catch(() => undefined)
      : Promise.resolve(undefined);

    const [title, savedMessages, assistantResponse] = await Promise.all([
      titlePromise,
      insertMessageTurn(body),
      callLlm(chatLog, body.content),
    ]);

    await saveConversation(body.conversationId, userId, title);

    const updatedAssistantMessage = await updateMessage(
      body.conversationId,
      body.assistantClientMessageId,
      assistantResponse,
    );

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

    return NextResponse.json({ ok: true, messages });
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

// todo: split on status codes and add context
class LlmError extends Error {}

async function callLlm(history: Message[], text: string) {
  try {
    return await postUserMessage(history, text);
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
