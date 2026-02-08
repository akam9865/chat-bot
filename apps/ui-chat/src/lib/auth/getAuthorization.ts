import { cache } from "react";
import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "./jwt";

export const getAuthorization = cache(
  async (): Promise<TokenPayload | null> => {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return null;

    try {
      return await verifyToken(token);
    } catch {
      return null;
    }
  },
);
