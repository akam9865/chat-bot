import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface TokenPayload {
  userId: string;
}

export async function signToken(userId: string) {
  return new SignJWT({ scope: "chat", userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  if (payload.scope !== "chat" || typeof payload.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  return { userId: payload.userId };
}
