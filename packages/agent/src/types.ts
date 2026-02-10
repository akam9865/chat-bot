export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMProvider {
  sendUserMessage(history: LLMMessage[], message: string): Promise<string>;
  generateConversationTitle(userMessage: string): Promise<string>;
}
