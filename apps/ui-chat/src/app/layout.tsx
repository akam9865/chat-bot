import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import { ConversationsPanel } from "../components/ConversationsPanel";
import { getAuthorization } from "../lib/auth/getAuthorization";
import { Login } from "../components/Login";
import { SidebarSkeleton } from "../components/skeletons/SidebarSkeleton";
import { ChatSkeleton } from "../components/skeletons/ChatSkeleton";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Chat Bot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthorization();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {user ? (
          <div className="flex h-dvh min-h-0 w-full overflow-hidden">
            <Suspense fallback={<SidebarSkeleton />}>
              <ConversationsPanel />
            </Suspense>
            <main className="flex-1 min-w-0 min-h-0">
              <Suspense fallback={<ChatSkeleton />}>{children}</Suspense>
            </main>
          </div>
        ) : (
          <Login />
        )}
      </body>
    </html>
  );
}

