import { describe, it, expect, vi } from "vitest";
import { sendMessage } from "./ai";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("sendMessage", () => {
  it("should make a POST request with correct payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            { clientMessageId: "user-123", text: "Hello", status: "sent" },
            {
              clientMessageId: "assistant-123",
              text: "Hi there!",
              status: "sent",
            },
          ],
        }),
    });

    await sendMessage({
      conversationId: "conv-123",
      userClientMessageId: "user-123",
      assistantClientMessageId: "assistant-123",
      text: "Hello",
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Hello",
        userClientMessageId: "user-123",
        assistantClientMessageId: "assistant-123",
        conversationId: "conv-123",
      }),
      credentials: "include",
    });
  });

  it("should return parsed response on success", async () => {
    const expectedResponse = {
      messages: [
        { clientMessageId: "user-123", text: "Hello", status: "sent" },
        { clientMessageId: "assistant-123", text: "Hi there!", status: "sent" },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(expectedResponse),
    });

    const result = await sendMessage({
      conversationId: "conv-123",
      userClientMessageId: "user-123",
      assistantClientMessageId: "assistant-123",
      text: "Hello",
    });

    expect(result).toEqual(expectedResponse);
  });

  it("should throw error on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(
      sendMessage({
        conversationId: "conv-123",
        userClientMessageId: "user-123",
        assistantClientMessageId: "assistant-123",
        text: "Hello",
      }),
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw HTTP status error when no error text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve(""),
    });

    await expect(
      sendMessage({
        conversationId: "conv-123",
        userClientMessageId: "user-123",
        assistantClientMessageId: "assistant-123",
        text: "Hello",
      }),
    ).rejects.toThrow("HTTP 500");
  });

  it("should handle text() throwing an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error("text failed")),
    });

    await expect(
      sendMessage({
        conversationId: "conv-123",
        userClientMessageId: "user-123",
        assistantClientMessageId: "assistant-123",
        text: "Hello",
      }),
    ).rejects.toThrow("HTTP 500");
  });

  it("should throw on invalid response schema", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          // Invalid schema - missing messages array
          data: "invalid",
        }),
    });

    await expect(
      sendMessage({
        conversationId: "conv-123",
        userClientMessageId: "user-123",
        assistantClientMessageId: "assistant-123",
        text: "Hello",
      }),
    ).rejects.toThrow();
  });

  it("should include credentials for cookie auth", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ messages: [] }),
    });

    await sendMessage({
      conversationId: "conv-123",
      userClientMessageId: "user-123",
      assistantClientMessageId: "assistant-123",
      text: "Hello",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });
});
