import z from "zod";

export const RoleSchema = z.enum(["system", "user", "assistant"]);
export type Role = z.infer<typeof RoleSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: RoleSchema,
  text: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;
