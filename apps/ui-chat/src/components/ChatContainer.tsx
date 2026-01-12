import { ChatInput } from "./ChatInput";
import { ChatLog } from "./ChatLog";

export const ChatContainer = () => {
  return (
    <div className="flex w-full h-full">
      <SidePanel />
      <MessagePanel />
    </div>
  );
};

const SidePanel = () => {
  return (
    <div className="w-72 border border-neutral-200 p-4">
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

const MessagePanel = () => {
  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex-1 overflow-auto">
        <ChatLog />
      </div>
      <div className="mt-2 ">
        <ChatInput />
      </div>
    </div>
  );
};
