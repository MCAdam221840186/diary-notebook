"use client";

import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AddDiaryDialog({ childId }: { childId: string }) {
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
      const res = await fetch(`/api/children/${childId}/diaries`, {
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

      message.success("日记已添加");
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
        写新日记
      </Button>

      <Modal
        title="写新日记"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={640}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="日记标题" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={8} placeholder="用 Markdown 格式书写..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
