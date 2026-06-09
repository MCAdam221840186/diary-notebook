"use client";

import { useState } from "react";
import { Layout, Typography, Modal, Input, Button, message } from "antd";
import { EditOutlined, EyeOutlined, KeyOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";

export default function TopBar() {
  const { isEditor, loaded, enableEdit, disableEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    if (isEditor) {
      disableEdit();
      message.info("已切换为只读模式");
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
        message.success("鉴权成功，你现在可以阅读并修改日记");
      } else {
        message.error("Token 无效，未能成功鉴权");
      }
    } catch {
      message.error("验证失败，请检查网络");
    } finally {
      setLoading(false);
      setToken("");
    }
  };

  if (!loaded) return null;

  return (
    <>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          height: 56,
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography.Text strong style={{ fontSize: 16 }}>
          📓 Diary Notebook
        </Typography.Text>

        <span
          onClick={handleToggle}
          style={{
            cursor: "pointer",
            color: isEditor ? "#52c41a" : "#8c8c8c",
            fontSize: 13,
            userSelect: "none",
            borderBottom: isEditor ? "1px dashed #52c41a" : "1px dashed transparent",
          }}
          title={isEditor ? "点击切换为只读模式" : "点击输入鉴权 Token"}
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
      </Layout.Header>

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
