import { AuthGate } from "../../../components/auth/AuthGate";
import { ChatContainer } from "../../../components/ChatContainer";

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  return (
    <AuthGate>
      <ChatContainer key={conversationId} conversationId={conversationId} />
    </AuthGate>
  );
}
