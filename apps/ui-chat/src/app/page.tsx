import { Suspense } from "react";
import { ChatContainer } from "../components/ChatContainer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Suspense fallback={<div>Loading...</div>}>
          <ChatContainer messages={[]} />
        </Suspense>
      </main>
    </div>
  );
}
