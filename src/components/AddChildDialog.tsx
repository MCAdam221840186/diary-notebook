"use client";

import { useState, useRef } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Avatar,
  message,
} from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { compressImage } from "@/lib/compress-image";

export default function AddChildDialog({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form] = Form.useForm();
  const uploadRef = useRef<HTMLInputElement>(null);

  if (!loaded || !isEditor) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("仅支持图片文件");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      message.warning("图片超过 1MB，将自动压缩");
    }

    try {
      const dataUrl = await compressImage(file);
      setAvatarPreview(dataUrl);
      setAvatarFile(file);
    } catch {
      message.error("图片处理失败");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (uploadRef.current) uploadRef.current.value = "";
  };

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
        body: JSON.stringify({
          name: values.name,
          avatar_data: avatarPreview,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      message.success("小朋友已添加");
      setOpen(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      form.resetFields();
      onSuccess?.();
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
          setAvatarPreview(null);
          setAvatarFile(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          {/* Avatar upload */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <input
              ref={uploadRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Avatar
              size={80}
              src={avatarPreview}
              icon={!avatarPreview ? <UserOutlined /> : undefined}
              style={{ cursor: "pointer", marginBottom: 8 }}
              onClick={() => uploadRef.current?.click()}
            />
            <div style={{ fontSize: 12, color: "#999" }}>
              {avatarPreview ? (
                <>
                  <span
                    style={{ cursor: "pointer", color: "#1677ff" }}
                    onClick={() => uploadRef.current?.click()}
                  >
                    更换
                  </span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span
                    style={{ cursor: "pointer", color: "#ff4d4f" }}
                    onClick={handleRemoveAvatar}
                  >
                    移除
                  </span>
                </>
              ) : (
                <span
                  style={{ cursor: "pointer", color: "#1677ff" }}
                  onClick={() => uploadRef.current?.click()}
                >
                  点击上传头像（小于 1MB）
                </span>
              )}
            </div>
          </div>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="小朋友的名字" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
