"use client";

import { useRouter } from "next/navigation";
import { chatStore } from "../stores/chat";
import { createConversationAction } from "../actions/createConversation";
import { conversationStore } from "../stores/conversation";

export function useSendMessageController() {
  const router = useRouter();

  return async () => {
    const text = chatStore.form.input.trim();
    if (!text) return;

    let conversationId = chatStore.conversationId;

    if (!conversationId) {
      const createdConversation = await createConversationAction();
      conversationStore.addConversation(createdConversation);
      chatStore.setConversationId(createdConversation.id);
      router.push(`/chat/${createdConversation.id}`);
      conversationId = createdConversation.id;
    }

    await chatStore.send(conversationId, text);
  };
}
