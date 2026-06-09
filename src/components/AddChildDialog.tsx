"use client";

import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AddChildDialog() {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  if (!loaded || !isEditor) return null;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const token = localStorage.getItem("diary_auth_token");
      const res = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      message.success("小朋友已添加");
      setOpen(false);
      form.resetFields();
      router.refresh();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
        style={{ marginBottom: 24 }}
      >
        添加小朋友
      </Button>

      <Modal
        title="添加小朋友"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="小朋友的名字" />
          </Form.Item>
          <Form.Item name="avatar_url" label="头像链接（可选）">
            <Input placeholder="https://example.com/avatar.png" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
