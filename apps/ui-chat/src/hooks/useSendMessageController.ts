"use client";

import { useRouter } from "next/navigation";
import { chatStore } from "../stores/chat";
import { createConversationAction } from "../actions/createConversation";

export function useSendMessageController() {
  const router = useRouter();

  return async () => {
    const text = chatStore.form.input.trim();
    if (!text) return;

    let conversationId = chatStore.conversationId;

    if (!conversationId) {
      const createdConversationId = await createConversationAction();
      chatStore.setConversationId(createdConversationId);
      router.push(`/chat/${createdConversationId}`);
      conversationId = createdConversationId;
    }

    await chatStore.send(conversationId);
  };
}
