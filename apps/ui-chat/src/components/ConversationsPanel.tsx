import { getConversations } from "../lib/db/drizzle";

export const ConversationsPanel = async () => {
  const conversations = await getConversations();
  return (
    <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
      <h1 className="text-gray-500 text-md font-medium mb-4">Chats</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Chat 1</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Chat 2</div>
          </div>
        </div>
      </div>
    </div>
  );
};
