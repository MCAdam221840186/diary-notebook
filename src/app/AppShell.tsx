"use client";

import type { ReactNode } from "react";
import { ConfigProvider, Layout } from "antd";
import zhCN from "antd/locale/zh_CN";
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
        locale={zhCN}
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
      locale={zhCN}
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
          <Layout style={{ marginLeft: 220, background: "#f0f2f5" }}>
            <Content
              key={pathname}
              className="page-transition"
              style={{
                maxWidth: 1200,
                margin: "24px auto",
                padding: "32px 40px 48px",
                width: "100%",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                minHeight: "calc(100vh - 48px)",
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
