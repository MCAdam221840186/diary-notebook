"use client";

import { useState } from "react";
import { Button, Modal, Form, Input, DatePicker, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import dayjs from "dayjs";

export default function AddDiaryDialog({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess?: () => void;
}) {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  if (!loaded || !isEditor) return null;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const token = localStorage.getItem("diary_auth_token");
      const body: Record<string, unknown> = {
        title: values.title,
        content: values.content ?? "",
      };

      if (values.created_at) {
        body.created_at = values.created_at.toISOString();
      }

      const res = await fetch(`/api/children/${childId}/diaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      notification.success({ message: "日记已添加", placement: "topRight" });
      setOpen(false);
      form.resetFields();
      onSuccess?.();
    } catch (err: unknown) {
      notification.error({ message: err instanceof Error ? err.message : "创建失败", placement: "topRight" });
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
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={{ created_at: dayjs() }}
        >
          <Form.Item name="created_at" label="写作时间">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              disabledDate={(d) => d && d.isAfter(dayjs())}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="日记标题" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={8} placeholder="写下今天的故事..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
