import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diary Notebook",
  description: "全栈日记笔记本 — 记录每一天的思考与灵感",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
