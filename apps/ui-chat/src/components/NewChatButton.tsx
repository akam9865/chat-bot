"use client";

import { useRouter } from "next/navigation";
import { chatStore } from "../stores/chat";

export const NewChatButton = () => {
  const router = useRouter();

  return (
    <div
      className="text-sm font-medium hover:bg-neutral-100 p-1 rounded-md cursor-pointer"
      onClick={() => {
        chatStore.resetConversation();
        router.push("/");
      }}
    >
      New Chat
    </div>
  );
};
