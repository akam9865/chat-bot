import { ChatInput } from "./ChatInput";
import { ChatLog } from "./ChatLog";

export const ChatContainer = ({
  conversationId,
}: {
  conversationId?: string;
}) => {
  return (
    <div className="flex w-full h-full min-h-0 min-w-0">
      <MessagePanel />
    </div>
  );
};

const MessagePanel = () => {
  return (
    <div className="flex-1 p-4 flex flex-col h-full min-h-0 min-w-0">
      <div className="flex-1 overflow-auto">
        <ChatLog />
      </div>
      <div className="mt-2 ">
        <ChatInput />
      </div>
    </div>
  );
};
