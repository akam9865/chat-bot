"use client";
import { observer } from "mobx-react-lite";
import { chatStore } from "../stores/chat";
import { Message } from "../shared/types/chat";

export const ChatLog = observer(() => {
  return (
    <div>
      messages
      {chatStore.messagesList.map((message) => {
        return (
          <div key={messageKey(message)}>
            {message.text} - {message.status} - {message.timestamp}
          </div>
        );
      })}
    </div>
  );
});

function messageKey(message: Message) {
  return (
    message.id ||
    message.clientMessageId ||
    `${message.role}-${message.timestamp}`
  );
}
