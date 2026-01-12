import { postUserMessage } from "../../../server/ai/anthropic";
import z from "zod";
import { Role, Status } from "../../../shared/types/chat";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth/jwt";
import { appendMessages, updateMessage } from "../../../lib/db/drizzle";

const PostMessageTurnSchema = z.object({
  content: z.string(),
  userClientMessageId: z.string(),
  assistantClientMessageId: z.string(),
  conversationId: z.string(),
});

type PostMessageTurnBody = z.infer<typeof PostMessageTurnSchema>;

export async function POST(request: Request) {
  // todo: dedupe the token verification flow
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "unathorized" }, { status: 401 });
  }
  try {
    await verifyToken(token);
  } catch {
    return NextResponse.json({ message: "unathorized" }, { status: 401 });
  }
  try {
    const body = await parseMessageTurnBody(request);
    const savedMessages = await saveMessages(body);
    // relying on saved messages === both sent, but we can have more permutations
    // CHAT-11: if ai response fails for example. refactor when we implement streaming.
    const assistantResponse = await callLlm(body.content);
    await updateMessage(
      body.conversationId,
      body.assistantClientMessageId,
      assistantResponse
    );

    const messages = savedMessages.map((message) => {
      if (message.clientMessageId === body.assistantClientMessageId) {
        return {
          ...message,
          text: assistantResponse,
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
  req: Request
): Promise<PostMessageTurnBody> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new BadRequestError("Invalid JSON");
  }

  return PostMessageTurnSchema.parse(json);
}

async function saveMessages(body: PostMessageTurnBody) {
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

async function callLlm(text: string) {
  try {
    return await postUserMessage(text);
  } catch (e) {
    throw new LlmError();
  }
}

function handleMessageError(e: any) {
  if (e instanceof BadRequestError) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: e.status }
    );
  }
  if (e instanceof LlmError) {
    return NextResponse.json(
      { ok: false, error: "llm error" },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { ok: false, error: "internal server error" },
    { status: 500 }
  );
}
