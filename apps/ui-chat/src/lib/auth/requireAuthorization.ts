import { NextResponse } from "next/server";
import { getAuthorization } from "./getAuthorization";

type Success = { user: { userId: string }; response?: never };
type Failure = { user?: never; response: NextResponse };

export async function requireAuthorization(): Promise<Success | Failure> {
  const user = await getAuthorization();
  if (!user) {
    return {
      response: NextResponse.json({ message: "unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}
