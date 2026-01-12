"use client";
import { observer } from "mobx-react-lite";
import { chatStore } from "../stores/chat";
import { useSendMessageController } from "../hooks/useSendMessageController";

export const ChatInput = observer(() => {
  const sendMessage = useSendMessageController();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Ask me anything"
          className="mt-1 block p-4 pr-11 w-full rounded-md border-gray-300 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 text-md"
          onChange={(e) => chatStore.updateForm(e.target.value)}
          value={chatStore.form.input}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          onClick={sendMessage}
          className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
