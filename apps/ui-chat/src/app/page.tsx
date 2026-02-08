import { Suspense } from "react";
import { ChatContainer } from "../components/ChatContainer";
import { ChatSkeleton } from "../components/skeletons/ChatSkeleton";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Suspense fallback={<ChatSkeleton />}>
          <ChatContainer />
        </Suspense>
      </main>
    </div>
  );
}
