"use client";

import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/lib/auth-context";
import TopBar from "@/components/TopBar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
        },
      }}
    >
      <AuthProvider>
        <TopBar />
        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 24px 48px",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {children}
        </main>
      </AuthProvider>
    </ConfigProvider>
  );
}
