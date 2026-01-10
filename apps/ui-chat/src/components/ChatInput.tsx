"use client";
import { observer } from "mobx-react-lite";
import { chatStore } from "../stores/chat";

export const ChatInput = observer(() => {
  return (
    <div>
      <input
        onChange={(e) => chatStore.updateForm(e.target.value)}
        value={chatStore.form.input}
      />
      <button onClick={() => chatStore.send()}>send</button>
    </div>
  );
});
