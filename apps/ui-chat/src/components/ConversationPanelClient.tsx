"use client";
import { observer } from "mobx-react-lite";
import { Conversation } from "../shared/types/conversation";
import { useEffect } from "react";
import { conversationStore } from "../stores/conversation";
import { chatStore } from "../stores/chat";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export const ConversationPanelClient = observer(
  ({ conversations }: { conversations: Conversation[] }) => {
    const router = useRouter();
    const params = useParams();
    const conversationId = params.conversationId as string | undefined;

    useEffect(() => {
      conversationStore.setConversations(conversations);
    }, [conversations]);

    return (
      <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
        <div
          className="text-sm font-medium hover:bg-neutral-100 p-1 rounded-md cursor-pointer"
          onClick={() => {
            chatStore.resetConversation();
            router.push("/");
          }}
        >
          New Chat
        </div>

        <h1 className="pl-1 text-gray-500 text-md font-medium my-4">
          Your Chats
        </h1>
        {conversationStore.conversations.map((conversation, index) => (
          <Link key={conversation.id} href={`/chat/${conversation.id}`}>
            <div
              className={`text-sm font-medium hover:bg-neutral-100 p-1 rounded-md cursor-pointer ${conversationId === conversation.id ? "bg-neutral-100" : ""}`}
            >
              {conversation.title || `Chat ${index + 1}`}
            </div>
          </Link>
        ))}
      </div>
    );
  }
);
