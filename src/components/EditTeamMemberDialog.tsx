"use client";

import { useState, useRef } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Avatar,
  notification,
} from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { compressImage } from "@/lib/compress-image";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar_url: string | null;
}

interface Props {
  member?: TeamMember; // provided = edit mode, omitted = create mode
  onSuccess?: () => void;
  trigger?: React.ReactNode; // custom trigger element for edit mode
}

const { TextArea } = Input;

export default function EditTeamMemberDialog({ member, onSuccess, trigger }: Props) {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form] = Form.useForm();
  const uploadRef = useRef<HTMLInputElement>(null);

  const isEdit = !!member;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notification.error({ message: "仅支持图片文件", placement: "topRight" });
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      notification.warning({ message: "图片超过 1MB，将自动压缩", placement: "topRight" });
    }

    try {
      const dataUrl = await compressImage(file);
      setAvatarPreview(dataUrl);
    } catch {
      notification.error({ message: "图片处理失败", placement: "topRight" });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const handleOpen = () => {
    if (member) {
      form.setFieldsValue({
        name: member.name,
        role: member.role,
        description: member.description,
      });
      setAvatarPreview(null);
    } else {
      form.resetFields();
      setAvatarPreview(null);
    }
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setAvatarPreview(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const token = localStorage.getItem("diary_auth_token");
      const url = isEdit
        ? `/api/team-members/${member.id}`
        : "/api/team-members";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          role: values.role,
          description: values.description,
          avatar_data: avatarPreview,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (isEdit ? "更新失败" : "创建失败"));
      }

      notification.success({
        message: isEdit ? "团队成员已更新" : "团队成员已添加",
        placement: "topRight",
      });
      setOpen(false);
      setAvatarPreview(null);
      form.resetFields();
      onSuccess?.();
    } catch (err: unknown) {
      notification.error({
        message: err instanceof Error ? err.message : "操作失败",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!loaded || !isEditor) return null;

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpen}
          style={{ marginBottom: 24 }}
        >
          添加团队成员
        </Button>
      )}

      <Modal
        title={isEdit ? "编辑团队成员" : "添加团队成员"}
        open={open}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText="确认"
        cancelText="取消"
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
              src={avatarPreview || member?.avatar_url}
              icon={!avatarPreview && !member?.avatar_url ? <UserOutlined /> : undefined}
              style={{ cursor: "pointer", marginBottom: 8 }}
              onClick={() => uploadRef.current?.click()}
            />
            <div style={{ fontSize: 12, color: "#999" }}>
              {avatarPreview || member?.avatar_url ? (
                <>
                  <span
                    style={{ cursor: "pointer", color: "#4caf50" }}
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
                  style={{ cursor: "pointer", color: "#4caf50" }}
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
            <Input placeholder="姓名" />
          </Form.Item>

          <Form.Item name="role" label="一句话简介">
            <Input placeholder="例如：班主任 & 语文老师" />
          </Form.Item>

          <Form.Item name="description" label="详细介绍">
            <TextArea rows={3} placeholder="详细介绍这位老师" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
