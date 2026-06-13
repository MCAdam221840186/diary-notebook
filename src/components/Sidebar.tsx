"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Layout,
  Menu,
  Typography,
  Modal,
  Input,
  Button,
  notification,
} from "antd";
import {
  BookOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { isEditor, loaded, enableEdit, disableEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    if (isEditor) {
      disableEdit();
      notification.info({ message: "已切换为只读模式", placement: "topRight" });
    } else {
      setOpen(true);
    }
  };

  const handleVerify = async () => {
    if (!token.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      setOpen(false);
      if (data.valid) {
        enableEdit(token.trim());
        notification.success({
          message: "鉴权成功",
          description: "你现在可以阅读并修改日记",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Token 无效",
          description: "未能成功鉴权",
          placement: "topRight",
        });
      }
    } catch {
      notification.error({
        message: "验证失败",
        description: "请检查网络",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
      setToken("");
    }
  };

  // Determine selected menu key from pathname
  // Sidebar is hidden on "/" (landing page), so this only runs on sub-pages
  const selectedKey = pathname.startsWith("/diaries") || pathname.startsWith("/children")
    ? "/diaries"
    : pathname === "/about"
      ? "/about"
      : "/diaries";

  const menuItems = [
    {
      key: "/diaries",
      icon: <BookOutlined />,
      label: <Link href="/diaries">日记</Link>,
    },
    {
      key: "/about",
      icon: <InfoCircleOutlined />,
      label: <Link href="/about">团队成员</Link>,
    },
  ];

  if (!loaded) return null;

  return (
    <>
      <Layout.Sider
        width={220}
        style={{
          background: "#2e7d32",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* App title */}
        <div
          style={{
            padding: "20px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Typography.Text strong style={{ fontSize: 16, color: "#fff" }}>
            📓 Diary Notebook
          </Typography.Text>
        </div>

        {/* Navigation menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            borderInlineEnd: "none",
            flex: 1,
            background: "transparent",
          }}
        />

        {/* Auth status at bottom — looks like a passive label */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={handleToggle}
          title={isEditor ? "点击切换为只读模式" : "点击输入鉴权 Token"}
        >
          <span
            style={{
              color: isEditor ? "#a5d6a7" : "rgba(255,255,255,0.65)",
              fontSize: 13,
              borderBottom: isEditor
                ? "1px dashed #a5d6a7"
                : "1px dashed transparent",
            }}
          >
            {isEditor ? (
              <>
                <EditOutlined style={{ marginRight: 4 }} />
                你正在阅读并修改日记
              </>
            ) : (
              <>
                <EyeOutlined style={{ marginRight: 4 }} />
                你正在阅读日记
              </>
            )}
          </span>
        </div>
      </Layout.Sider>

      <Modal
        title={
          <span>
            <KeyOutlined style={{ marginRight: 8 }} />
            输入鉴权 Token
          </span>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setToken("");
        }}
        footer={
          <Button type="primary" onClick={handleVerify} loading={loading}>
            确认
          </Button>
        }
      >
        <Input.Password
          placeholder="请粘贴你的 Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onPressEnter={handleVerify}
          autoFocus
        />
      </Modal>
    </>
  );
}
