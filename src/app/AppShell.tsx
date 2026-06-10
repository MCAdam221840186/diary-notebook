"use client";

import type { ReactNode } from "react";
import { ConfigProvider, Layout } from "antd";
import { AuthProvider } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const { Content } = Layout;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Landing page — full screen, no sidebar
  if (pathname === "/") {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#4caf50",
            borderRadius: 8,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
          },
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4caf50",
          borderRadius: 8,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
        },
      }}
    >
      <AuthProvider>
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar />
          <Layout style={{ marginLeft: 220 }}>
            <Content
              key={pathname}
              className="page-transition"
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "24px 24px 48px",
                width: "100%",
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </AuthProvider>
    </ConfigProvider>
  );
}
