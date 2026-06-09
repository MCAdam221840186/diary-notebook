"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, DatePicker, notification } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import dayjs from "dayjs";

export default function EditDiaryDialog({
  diary,
  onSuccess,
}: {
  diary: { id: string; title: string; content: string; created_at?: string };
  onSuccess?: () => void;
}) {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  if (!loaded || !isEditor) return null;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: diary.title,
        content: diary.content,
        created_at: diary.created_at ? dayjs(diary.created_at) : dayjs(),
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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

      const res = await fetch(`/api/diaries/${diary.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "更新失败");
      }

      notification.success({ message: "日记已更新", placement: "topRight" });
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      notification.error({ message: err instanceof Error ? err.message : "更新失败", placement: "topRight" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="default"
        icon={<EditOutlined />}
        onClick={() => setOpen(true)}
      >
        编辑
      </Button>

      <Modal
        title="编辑日记"
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={640}
      >
        <Form form={form} layout="vertical" autoComplete="off">
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
