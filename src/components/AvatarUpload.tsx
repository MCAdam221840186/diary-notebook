"use client";

import { useState, useRef } from "react";
import { Modal, Avatar, notification } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import { compressImage } from "@/lib/compress-image";

export default function AvatarUpload({
  childId,
  currentAvatar,
  onSuccess,
}: {
  childId: string;
  currentAvatar: string | null;
  onSuccess?: () => void;
}) {
  const { isEditor, loaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

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
      setPreview(dataUrl);
    } catch {
      notification.error({ message: "图片处理失败", placement: "topRight" });
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("diary_auth_token");
      const res = await fetch(`/api/children/${childId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_data: preview }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "更新失败");
      }

      notification.success({ message: "头像已更新", placement: "topRight" });
      setOpen(false);
      setPreview(null);
      onSuccess?.();
    } catch (err: unknown) {
      notification.error({
        message: err instanceof Error ? err.message : "更新失败",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = preview || currentAvatar;

  return (
    <>
      <input
        ref={uploadRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div
        style={{ position: "relative", display: "inline-block", cursor: loaded && isEditor ? "pointer" : "default" }}
        onClick={() => {
          if (loaded && isEditor) {
            setPreview(null);
            setOpen(true);
          }
        }}
        title={loaded && isEditor ? "点击更换头像" : undefined}
      >
        <Avatar
          size={96}
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : undefined}
          style={{
            display: "block",
            border: loaded && isEditor ? "2px dashed #d9d9d9" : "none",
            padding: 2,
          }}
        />
        {loaded && isEditor && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              background: "#1677ff",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            <CameraOutlined style={{ color: "#fff", fontSize: 14 }} />
          </div>
        )}
      </div>

      <Modal
        title="更换头像"
        open={open}
        onCancel={() => {
          setOpen(false);
          setPreview(null);
          if (uploadRef.current) uploadRef.current.value = "";
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText="确认"
        okButtonProps={{ disabled: !preview }}
      >
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Avatar
            size={120}
            src={preview || currentAvatar}
            icon={!preview && !currentAvatar ? <UserOutlined /> : undefined}
            style={{ display: "block", margin: "0 auto 16px" }}
          />
          <span
            style={{ color: "#1677ff", cursor: "pointer", fontSize: 14 }}
            onClick={() => uploadRef.current?.click()}
          >
            选择图片
          </span>
          {preview && (
            <>
              <span style={{ margin: "0 8px", color: "#d9d9d9" }}>|</span>
              <span
                style={{ color: "#ff4d4f", cursor: "pointer", fontSize: 14 }}
                onClick={() => {
                  setPreview(null);
                  if (uploadRef.current) uploadRef.current.value = "";
                }}
              >
                清除
              </span>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
