import { flow, makeAutoObservable } from "mobx";
import { sendMessage } from "../clients/ai";
import {
  type ChatTurn,
  type Message,
  Role,
  Status,
} from "../../shared/ai/schemas";

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
    const text = this.form.input;
    const clientMessageId = crypto.randomUUID();
    const userMessage = {
      role: Role.USER,
      clientMessageId,
      text,
      status: Status.PENDING,
      timestamp: Date.now(),
    };

    this.messages.push(userMessage);

    try {
      const response: ChatTurn = yield sendMessage(
        this.form.input,
        clientMessageId,
        this.conversationId
      );

      this.reconcileUserMessage(response.userMessage);
      this.messages.push(response.assistantMessage);
      this.conversationId = response.conversationId;
    } catch {
      // mark as failed
    }
  });
  reconcileUserMessage(serverMessage: Message) {
    const message = this.messages.find(
      (message) => message.clientMessageId === serverMessage.clientMessageId
    );
    if (message) {
      message.status = Status.SENT;
      message.timestamp = serverMessage.timestamp;
    }
  }
}

export const chatStore = new ChatStore();
