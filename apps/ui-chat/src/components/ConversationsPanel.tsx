import Link from "next/link";
import { getConversations } from "../lib/db/drizzle";

export const ConversationsPanel = async () => {
  // todo: get active conversation from url
  const conversations = await getConversations();

  return (
    <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
      <h1 className="text-gray-500 text-md font-medium mb-4">Chats</h1>
      {conversations.map((conversation, index) => (
        <Link key={conversation.id} href={`/chat/${conversation.id}`}>
          <div className="text-sm font-medium hover:bg-neutral-100 p-1 rounded-md cursor-pointer">
            {conversation.title || `Chat ${index + 1}`}
          </div>
        </Link>
      ))}
    </div>
  );
};
