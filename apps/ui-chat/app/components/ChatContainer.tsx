import { ChatInput } from "./ChatInput";
import { ChatLog } from "./ChatLog";

export const ChatContainer = () => {
  return (
    <div>
      <ChatLog />
      <ChatInput />
    </div>
  );
};
