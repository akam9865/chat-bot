import { flow, makeAutoObservable } from "mobx";
import { type Conversation } from "../shared/types/chat";
import {
  createConversation,
  fetchConversations,
} from "../clients/conversations";

export class ConversationStore {
  conversations: Conversation[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  load = flow(function* (this: ConversationStore) {
    this.isLoading = true;
    try {
      this.conversations = yield fetchConversations();
    } finally {
      this.isLoading = false;
    }
  });

  create = flow(function* (this: ConversationStore) {
    const conversation: Conversation = yield createConversation();
    this.conversations.unshift(conversation);
    return conversation;
  });

  updateTitle(conversationId: string, title: string) {
    const conversation = this.conversations.find(
      (c) => c.id === conversationId,
    );
    if (conversation) {
      conversation.title = title;
    }
  }
}

export const conversationStore = new ConversationStore();
