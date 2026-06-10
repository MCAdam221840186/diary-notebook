"use client";

import type { ReactNode } from "react";
import { ConfigProvider, Layout } from "antd";
import { AuthProvider } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";

const { Content } = Layout;

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
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar />
          <Layout style={{ marginLeft: 220 }}>
            <Content
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
