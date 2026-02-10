import { NextResponse } from "next/server";
import { requireAuthorization } from "../../../lib/auth/requireAuthorization";
import { createConversation, getConversations } from "@repo/storage";

export async function GET() {
  const { user, response } = await requireAuthorization();
  if (response) return response;

  const conversations = await getConversations(user.userId);
  return NextResponse.json(conversations);
}

export async function POST() {
  const { user, response } = await requireAuthorization();
  if (response) return response;

  const conversation = await createConversation(user.userId);
  if (!conversation) {
    return NextResponse.json(
      { message: "failed to create conversation" },
      { status: 500 },
    );
  }

  return NextResponse.json(conversation, { status: 201 });
}
