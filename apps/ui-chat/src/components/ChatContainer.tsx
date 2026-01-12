"use client";
import { ChatInput } from "./ChatInput";
import { ChatLog } from "./ChatLog";
import type { Message } from "../shared/types/chat";
import { chatStore } from "../stores/chat";
import { useEffect } from "react";

export const ChatContainer = ({
  conversationId,
  messages,
}: {
  conversationId?: string;
  messages?: Message[];
}) => {
  useEffect(() => {
    if (!conversationId) return;
    chatStore.setConversationId(conversationId);

    if (messages) {
      chatStore.hydrateConversation(conversationId, messages);
    }
  }, [conversationId]);

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
