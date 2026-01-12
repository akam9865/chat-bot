import { flow, makeAutoObservable } from "mobx";
import { sendMessage } from "../clients/ai";
import {
  type Message,
  type SendMessageResponse,
  Role,
  Status,
} from "../shared/types/chat";

type ChatForm = {
  input: string;
};

class ChatStore {
  private messagesByConversationId: Map<string, Message[]> = new Map();
  form: ChatForm = { input: "" };
  conversationId?: string = undefined;

  constructor() {
    makeAutoObservable(this);
  }
  setConversationId(conversationId: string) {
    this.getOrCreateConversation(conversationId);
    this.conversationId = conversationId;
  }

  hasConversation(conversationId: string): boolean {
    return this.messagesByConversationId.has(conversationId);
  }

  get messages(): Message[] {
    if (!this.conversationId) return [];
    return this.getOrCreateConversation(this.conversationId);
  }

  get messagesList(): Message[] {
    const messages = this.messages.slice();
    // might not need to sort, we insert in order and query with asc
    messages.sort((a, b) => a.timestamp - b.timestamp);
    return messages;
  }

  private getOrCreateConversation(conversationId: string): Message[] {
    let conversation = this.messagesByConversationId.get(conversationId);
    if (!conversation) {
      conversation = [];
      this.messagesByConversationId.set(conversationId, conversation);
    }
    return conversation;
  }

  updateForm(message: string) {
    this.form.input = message;
  }

  hydrateConversation(conversationId: string, messages: Message[]) {
    this.messagesByConversationId.set(conversationId, messages.slice());
    this.conversationId = conversationId;
  }

  send = flow(function* (this: ChatStore) {
    const text = this.form.input.trim();
    if (!text) return;

    const conversationId = (this.conversationId ||= crypto.randomUUID());
    const clientMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const timestamp = Date.now();

    // Optimistically update the UI for the user message only
    const userMessage: Message = {
      role: Role.USER,
      clientMessageId,
      text,
      status: Status.SENT,
      timestamp,
    };
    const pendingAssistantMessage: Message = {
      role: Role.ASSISTANT,
      clientMessageId: assistantMessageId,
      text: "",
      status: Status.PENDING,
      timestamp: timestamp + 1,
    };

    const conversation = this.getOrCreateConversation(conversationId);
    conversation.push(userMessage, pendingAssistantMessage);
    this.form.input = "";

    try {
      const { messages }: SendMessageResponse = yield sendMessage({
        conversationId: this.conversationId,
        userClientMessageId: clientMessageId,
        assistantClientMessageId: assistantMessageId,
        text,
      });

      messages.forEach((message) => {
        this.reconcileMessage(conversationId, message);
      });
    } catch (e) {
      console.log(e);

      // CHAT-11: just setting the user message as failed is not strictly accurate.
      // We'll have to refactor to handle failure permutations.
      this.reconcileMessage(conversationId, {
        clientMessageId,
        status: Status.FAILED,
      });
    }
  });

  reconcileMessage(
    conversationId: string,
    patch: Partial<Message> & { clientMessageId: string; status: Status }
  ) {
    const { clientMessageId, status, text } = patch;
    const conversation = this.getOrCreateConversation(conversationId);
    const message = conversation.find(
      (message) => message.clientMessageId === clientMessageId
    );
    if (!message) return;
    message.status = status;
    if (text) message.text = text;
  }
}

export const chatStore = new ChatStore();
