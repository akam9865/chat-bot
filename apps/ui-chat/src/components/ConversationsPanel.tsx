import Link from "next/link";
import { getConversations } from "../lib/db/drizzle";
import { NewChatButton } from "./NewChatButton";

export const ConversationsPanel = async () => {
  // todo: get active conversation from url
  const conversations = await getConversations();

  return (
    <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
      <NewChatButton />

      <h1 className="pl-1 text-gray-500 text-md font-medium my-4">
        Your Chats
      </h1>
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
