import { makeAutoObservable } from "mobx";
import { Conversation } from "../shared/types/conversation";

class ConversationStore {
  conversations: Conversation[] = [];

  get conversationsList(): Conversation[] {
    return this.conversations
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  constructor() {
    makeAutoObservable(this);
  }

  setConversations(conversations: Conversation[]) {
    this.conversations = conversations;
  }

  addConversation(conversation: Conversation) {
    this.conversations.unshift(conversation);
  }
}

export const conversationStore = new ConversationStore();
