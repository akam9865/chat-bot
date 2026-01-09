import z from "zod";

export const Role = {
  ASSISTANT: "assistant",
  SYSTEM: "system",
  USER: "user",
} as const;

type Role = (typeof Role)[keyof typeof Role];
const RoleSchema = z.enum([
  //
  Role.ASSISTANT,
  Role.SYSTEM,
  Role.USER,
]);

export const Status = {
  PENDING: "pending",
  SENT: "sent",
} as const;
type Status = (typeof Status)[keyof typeof Status];
const StatusSchema = z.enum([
  //
  Status.PENDING,
  Status.SENT,
]);

export const MessageSchema = z.object({
  id: z.string().optional(),
  clientMessageId: z.string().optional(), // todo: think about separate message schemas by role
  role: RoleSchema,
  status: StatusSchema,
  text: z.string(),
  timestamp: z.number(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ChatTurnSchema = z.object({
  conversationId: z.string(),
  userMessage: MessageSchema,
  assistantMessage: MessageSchema,
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;
