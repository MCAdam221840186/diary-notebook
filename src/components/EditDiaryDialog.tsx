"use client";

import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function EditDiaryDialog({
  diary,
}: {
  diary: { id: string; title: string; content: string };
}) {
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
      const res = await fetch(`/api/diaries/${diary.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "更新失败");
      }

      message.success("日记已更新");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="default"
        icon={<EditOutlined />}
        onClick={() => {
          form.setFieldsValue({ title: diary.title, content: diary.content });
          setOpen(true);
        }}
      >
        编辑
      </Button>

      <Modal
        title="编辑日记"
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
