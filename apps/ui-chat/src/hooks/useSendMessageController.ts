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
      const createdConversation = await createConversationAction();
      chatStore.setConversationId(createdConversation.id);
      router.push(`/chat/${createdConversation.id}`);
      router.refresh();
      conversationId = createdConversation.id;
    }

    await chatStore.send(conversationId, text);
  };
}
