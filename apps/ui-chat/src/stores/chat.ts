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
  messages: Message[] = [];
  form: ChatForm = { input: "" };
  conversationId?: string = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  get messagesList(): Message[] {
    const messages = this.messages.slice();
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }

  updateForm(message: string) {
    this.form.input = message;
  }

  send = flow(function* (this: ChatStore) {
    const text = this.form.input.trim();
    if (!text) return;

    this.conversationId ||= crypto.randomUUID();
    const clientMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const timestamp = Date.now();

    // Optimistically update the UI for the user message only
    const userMessage = {
      role: Role.USER,
      clientMessageId,
      text,
      status: Status.SENT,
      timestamp,
    };
    const pendingAssistantMessage = {
      role: Role.ASSISTANT,
      clientMessageId: assistantMessageId,
      text: "",
      status: Status.PENDING,
      timestamp: timestamp + 1,
    };

    this.messages.push(userMessage, pendingAssistantMessage);
    this.form.input = "";

    try {
      const { messages }: SendMessageResponse = yield sendMessage({
        conversationId: this.conversationId,
        userClientMessageId: clientMessageId,
        assistantClientMessageId: assistantMessageId,
        text,
      });

      messages.forEach((message) => {
        this.reconcileMessage(message);
      });
    } catch (e) {
      console.log(e);

      // CHAT-11: just setting the user message as failed is not strictly accurate.
      // We'll have to refactor to handle failure permutations.
      this.reconcileMessage({
        clientMessageId,
        status: Status.FAILED,
      });
    }
  });

  reconcileMessage({
    clientMessageId,
    status,
    text,
  }: {
    clientMessageId: string;
    status: Status;
    text?: string;
  }) {
    const message = this.messages.find(
      (message) => message.clientMessageId === clientMessageId
    );
    if (!message) return;
    message.status = status;
    message.text = text ?? "";
  }
}

export const chatStore = new ChatStore();
