import { Login } from "../Login";
import { getAuthorization } from "../../lib/auth/getAuthorization";

export async function AuthGate({ children }: { children: React.ReactNode }) {
  const isAuthorized = await getAuthorization();
  return isAuthorized ? children : <Login />;
}
