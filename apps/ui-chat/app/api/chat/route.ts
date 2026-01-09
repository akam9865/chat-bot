import { postUserMessage } from "../../../server/ai/anthropic";
import z from "zod";

const PostUserMessageSchema = z.object({
  message: z.string(),
});

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const input = PostUserMessageSchema.parse(body);
  const message = await postUserMessage(input.message);

  return Response.json(message);
}
