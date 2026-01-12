import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getAuthorization() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return false;

  try {
    await verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
