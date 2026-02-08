import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatStore } from "./chat";
import { Role, Status, type Message } from "../shared/types/chat";

vi.mock("../clients/messages", () => ({
  sendMessage: vi.fn(),
}));

import { sendMessage } from "../clients/messages";

describe("ChatStore", () => {
  let store: ChatStore;
  const mockSendMessage = sendMessage as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = new ChatStore();
  });

  describe("messagesList", () => {
    it("should return messages sorted by timestamp", () => {
      const messages: Message[] = [
        {
          clientMessageId: "msg-2",
          role: Role.ASSISTANT,
          status: Status.SENT,
          text: "Response",
          timestamp: 2000,
        },
        {
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.SENT,
          text: "Hello",
          timestamp: 1000,
        },
      ];

      store.hydrateConversation("conv-123", messages);

      const sorted = store.messagesList;
      expect(sorted[0].timestamp).toBe(1000);
      expect(sorted[1].timestamp).toBe(2000);
    });
  });

  describe("hydrateConversation", () => {
    it("should add server messages to empty conversation", () => {
      const serverMessages: Message[] = [
        {
          id: "server-1",
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.SENT,
          text: "Hello",
          timestamp: 1000,
        },
      ];

      store.hydrateConversation("conv-123", serverMessages);

      expect(store.messages).toHaveLength(1);
      expect(store.messages[0].text).toBe("Hello");
    });

    it("should merge with existing messages by updating status", () => {
      const localMessages: Message[] = [
        {
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.PENDING,
          text: "Hello",
          timestamp: 1000,
        },
      ];
      store.hydrateConversation("conv-123", localMessages);

      const serverMessages: Message[] = [
        {
          id: "server-1",
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.SENT,
          text: "Hello",
          timestamp: 1000,
        },
      ];
      store.hydrateConversation("conv-123", serverMessages);

      expect(store.messages).toHaveLength(1);
      expect(store.messages[0].status).toBe(Status.SENT);
      expect(store.messages[0].id).toBe("server-1");
    });

    it("should add new messages from server", () => {
      const initialMessages: Message[] = [
        {
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.SENT,
          text: "Hello",
          timestamp: 1000,
        },
      ];
      store.hydrateConversation("conv-123", initialMessages);

      const updatedMessages: Message[] = [
        {
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.SENT,
          text: "Hello",
          timestamp: 1000,
        },
        {
          clientMessageId: "msg-2",
          role: Role.ASSISTANT,
          status: Status.SENT,
          text: "Hi there!",
          timestamp: 2000,
        },
      ];
      store.hydrateConversation("conv-123", updatedMessages);

      expect(store.messages).toHaveLength(2);
    });
  });

  describe("reconcileMessage", () => {
    it("should update message status", () => {
      const messages: Message[] = [
        {
          clientMessageId: "msg-1",
          role: Role.USER,
          status: Status.PENDING,
          text: "Hello",
          timestamp: 1000,
        },
      ];
      store.hydrateConversation("conv-123", messages);

      store.reconcileMessage("conv-123", {
        clientMessageId: "msg-1",
        status: Status.SENT,
      });

      expect(store.messages[0].status).toBe(Status.SENT);
    });

    it("should update message text when provided", () => {
      const messages: Message[] = [
        {
          clientMessageId: "msg-1",
          role: Role.ASSISTANT,
          status: Status.PENDING,
          text: "",
          timestamp: 1000,
        },
      ];
      store.hydrateConversation("conv-123", messages);

      store.reconcileMessage("conv-123", {
        clientMessageId: "msg-1",
        status: Status.SENT,
        text: "Response text",
      });

      expect(store.messages[0].text).toBe("Response text");
    });

    it("should do nothing for non-existent message", () => {
      store.setConversationId("conv-123");

      store.reconcileMessage("conv-123", {
        clientMessageId: "non-existent",
        status: Status.FAILED,
      });

      expect(store.messages).toHaveLength(0);
    });
  });

  describe("send", () => {
    it("should add optimistic user and assistant messages", async () => {
      store.setConversationId("conv-123");
      mockSendMessage.mockResolvedValueOnce({
        messages: [
          { clientMessageId: "test-uuid-1234", text: "Hello", status: "sent" },
          {
            clientMessageId: "test-uuid-1234",
            text: "Hi there!",
            status: "sent",
          },
        ],
      });

      const sendPromise = store.send("conv-123", "Hello");

      expect(store.messages).toHaveLength(2);
      expect(store.messages[0].role).toBe(Role.USER);
      expect(store.messages[1].role).toBe(Role.ASSISTANT);
      expect(store.messages[1].status).toBe(Status.PENDING);

      await sendPromise;
    });

    it("should clear form input after sending", async () => {
      store.updateForm("Hello");
      mockSendMessage.mockResolvedValueOnce({ messages: [] });

      store.send("conv-123", "Hello");

      expect(store.form.input).toBe("");
    });

    it("should not send empty messages", async () => {
      await store.send("conv-123", "");

      expect(mockSendMessage).not.toHaveBeenCalled();
      expect(store.messages).toHaveLength(0);
    });

    it("should mark message as failed on error", async () => {
      store.setConversationId("conv-123");
      mockSendMessage.mockRejectedValueOnce(new Error("Network error"));

      await store.send("conv-123", "Hello");

      const userMessage = store.messages.find((m) => m.role === Role.USER);
      expect(userMessage?.status).toBe(Status.FAILED);
    });

    it("should call sendMessage with correct params", async () => {
      mockSendMessage.mockResolvedValueOnce({ messages: [] });

      await store.send("conv-123", "Hello world");

      expect(mockSendMessage).toHaveBeenCalledWith({
        conversationId: "conv-123",
        userClientMessageId: "test-uuid-1234",
        assistantClientMessageId: "test-uuid-1234",
        text: "Hello world",
      });
    });
  });
});
