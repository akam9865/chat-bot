import { Suspense } from "react";
import { ChatContainer } from "../../../components/ChatContainer";
import { getChatLog } from "../../../lib/db/drizzle";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const conversationId = (await params).conversationId;
  const chatLog = await getChatLog(conversationId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContainer
        key={conversationId}
        conversationId={conversationId}
        messages={chatLog}
      />
    </Suspense>
  );
}
