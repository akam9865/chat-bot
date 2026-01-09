import { flow, makeAutoObservable } from "mobx";
import { sendMessage } from "../clients/ai";
import { Message } from "../../shared/ai/schemas";

type ChatForm = {
  input: string;
};

class ChatStore {
  messages: Message[] = [];
  form: ChatForm = { input: "" };

  constructor() {
    makeAutoObservable(this);
  }

  updateForm(message: string) {
    this.form.input = message;
  }

  send = flow(function* (this: ChatStore) {
    const message: Message = yield sendMessage(this.form.input);
    this.messages.push(message);
  });
}

export const chatStore = new ChatStore();
