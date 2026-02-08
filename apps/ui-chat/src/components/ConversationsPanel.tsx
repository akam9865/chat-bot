"use client";

import { useEffect } from "react";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { conversationStore } from "../stores/conversations";
import { SidebarSkeleton } from "./skeletons/SidebarSkeleton";
import { TypewriterText } from "./TypewriterText";

export const ConversationsPanel = observer(() => {
  useEffect(() => {
    conversationStore.load();
  }, []);

  if (conversationStore.isLoading) return <SidebarSkeleton />;

  return (
    <div className="w-72 shrink-0 h-full min-h-0 overflow-y-auto border border-neutral-200 p-4">
      <Link
        href="/"
        className="block text-sm font-medium hover:bg-neutral-100 p-1 rounded-md"
      >
        New Chat
      </Link>

      <h1 className="pl-1 text-gray-500 text-md font-medium my-4">
        Your Chats
      </h1>

      {conversationStore.conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/chat/${conversation.id}`}
          className="block text-sm font-medium hover:bg-neutral-100 p-1 rounded-md truncate"
        >
          <TypewriterText text={conversation.title} fallback="New Chat" />
        </Link>
      ))}
    </div>
  );
});
