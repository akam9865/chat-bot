import { Suspense } from "react";
import { ChatContainer } from "../components/ChatContainer";
import styles from "./page.module.css";
import { getAuthorization } from "../lib/auth/getAuthorization";
import { Login } from "../components/Login";

async function Auth() {
  const isAuthorized = await getAuthorization();
  return isAuthorized ? <ChatContainer /> : <Login />;
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Suspense fallback={<div>loading...</div>}>
          <Auth />
        </Suspense>
      </main>
      <footer className={styles.footer} />
    </div>
  );
}
