"use client";

import { useRouter } from "next/navigation";
import { chatStore } from "../stores/chat";
import { createConversationAction } from "../actions/createConversation";

export function useSendMessageController() {
  const router = useRouter();

  return async () => {
    const text = chatStore.form.input.trim();
    if (!text) return;

    if (!chatStore.conversationId) {
      const createdConversationId = await createConversationAction();
      chatStore.setConversationId(createdConversationId);
      router.push(`/chat/${createdConversationId}`);
    }

    await chatStore.send();
  };
}
