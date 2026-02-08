import Link from "next/link";
import { getConversations } from "../lib/db/drizzle";
import { getAuthorization } from "../lib/auth/getAuthorization";

export const ConversationsPanel = async () => {
  const user = await getAuthorization();
  if (!user) return null;

  const conversations = await getConversations(user.userId);

  return (
    <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
      <Link
        href="/"
        className="block text-sm font-medium hover:bg-neutral-100 p-1 rounded-md"
      >
        New Chat
      </Link>

      <h1 className="pl-1 text-gray-500 text-md font-medium my-4">
        Your Chats
      </h1>

      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/chat/${conversation.id}`}
          className="block text-sm font-medium hover:bg-neutral-100 p-1 rounded-md truncate"
        >
          {conversation.title || conversation.id}
        </Link>
      ))}
    </div>
  );
};
