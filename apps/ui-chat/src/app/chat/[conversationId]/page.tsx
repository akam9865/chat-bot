import { ChatContainer } from "../../../components/ChatContainer";
import { getChatLog } from "../../../lib/db/drizzle";
import { getAuthorization } from "../../../lib/auth/getAuthorization";
import { redirect } from "next/navigation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await getAuthorization();
  if (!user) {
    redirect("/");
  }

  const conversationId = (await params).conversationId;
  const chatLog = await getChatLog(conversationId, user.userId);

  return (
    <ChatContainer
      key={conversationId}
      conversationId={conversationId}
      messages={chatLog}
    />
  );
}
