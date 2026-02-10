"use client";
import { observer } from "mobx-react-lite";
import { chatStore } from "../stores/chat";
import { Message, Role, Status } from "@repo/storage/types";
import { MarkdownContent } from "./MarkdownContent";

export const ChatLog = observer(() => {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mt-auto flex flex-col gap-2">
        {chatStore.messagesList.map((message) => (
          <MessageItem key={message.clientMessageId} message={message} />
        ))}
      </div>
    </div>
  );
});

const MessageItem = observer(({ message }: { message: Message }) => {
  const isUser = message.role === Role.USER;
  const alignMessage = isUser ? "self-end" : "self-start";
  const backgroundColor = isUser ? "bg-blue-100" : "bg-neutral-100";

  if (message.status === Status.PENDING) {
    return (
      <div className="animate-pulse bg-neutral-200 rounded-full w-6 h-6" />
    );
  }

  return (
    <div
      key={message.clientMessageId}
      className={`rounded-md px-3 py-2 text-sm max-w-2/3 ${alignMessage} ${backgroundColor}`}
    >
      <MarkdownContent>{message.text}</MarkdownContent>
    </div>
  );
});
