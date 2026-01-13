import { getConversations } from "../lib/db/drizzle";

import { ConversationPanelClient } from "./ConversationPanelClient";

export const ConversationsPanel = async () => {
  const conversations = await getConversations();

  return <ConversationPanelClient conversations={conversations} />;
};
