"use client";
import { observer } from "mobx-react-lite";
import { chatStore } from "../stores/chat";

export const ChatLog = observer(() => {
  const messages = chatStore.messages;
  return (
    <div>
      messages
      {messages.map((message) => {
        return <div key={message.id}>{message.text}</div>;
      })}
    </div>
  );
});
