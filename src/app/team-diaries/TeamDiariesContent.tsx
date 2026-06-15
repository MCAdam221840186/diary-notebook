"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Timeline,
  Button,
  Modal,
  DatePicker,
  Input,
  Empty,
  Spin,
  Popconfirm,
  notification,
} from "antd";
import {
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import { useAuth } from "@/lib/auth-context";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TeamDiary {
  id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function TeamDiariesPage() {
  const { isEditor } = useAuth();
  const [diaries, setDiaries] = useState<TeamDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<TeamDiary | null>(null);
  const [formDate, setFormDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchDiaries = useCallback(async () => {
    try {
      const res = await fetch("/api/team-diaries");
      if (res.ok) {
        const data = await res.json();
        setDiaries(data);
      }
    } catch {
      notification.error({ message: "加载失败", placement: "topRight" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const openCreate = () => {
    setEditingDiary(null);
    setFormDate(dayjs().format("YYYY-MM-DD"));
    setFormTitle("");
    setFormContent("");
    setShowPreview(false);
    setModalOpen(true);
  };

  const openEdit = (diary: TeamDiary) => {
    setEditingDiary(diary);
    setFormDate(dayjs(diary.date).format("YYYY-MM-DD"));
    setFormTitle(diary.title);
    setFormContent(diary.content);
    setShowPreview(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formDate || !formContent.trim()) {
      notification.warning({ message: "日期和内容不能为空", placement: "topRight" });
      return;
    }

    const token = localStorage.getItem("diary_auth_token");
    if (!token) {
      notification.error({ message: "请先进行鉴权", placement: "topRight" });
      return;
    }

    setSaving(true);
    try {
      const url = editingDiary
        ? `/api/team-diaries/${editingDiary.id}`
        : "/api/team-diaries";
      const method = editingDiary ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formDate,
          title: formTitle,
          content: formContent,
        }),
      });

      if (res.ok) {
        notification.success({
          message: editingDiary ? "更新成功" : "创建成功",
          placement: "topRight",
        });
        setModalOpen(false);
        fetchDiaries();
      } else {
        const data = await res.json();
        notification.error({
          message: data.error || "操作失败",
          placement: "topRight",
        });
      }
    } catch {
      notification.error({ message: "保存失败，请检查网络", placement: "topRight" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("diary_auth_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/team-diaries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        notification.success({ message: "删除成功", placement: "topRight" });
        fetchDiaries();
      } else {
        notification.error({ message: "删除失败", placement: "topRight" });
      }
    } catch {
      notification.error({ message: "删除失败", placement: "topRight" });
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            团队日志
          </Title>
          <Text type="secondary">记录团队的每一天</Text>
        </div>
        {isEditor && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            写日志
          </Button>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : diaries.length === 0 ? (
        <Empty description="还没有团队日志，快来写第一篇吧！" />
      ) : (
        <Timeline
          mode="left"
          items={diaries.map((diary) => ({
            key: diary.id,
            color: "#4caf50",
            label: (
              <div style={{ textAlign: "right", paddingRight: 8 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {dayjs(diary.date).format("M月D日")}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(diary.date).format("dddd")}
                </Text>
              </div>
            ),
            children: (
              <div
                style={{
                  background: "#fafff9",
                  borderRadius: 8,
                  padding: "16px 20px",
                  border: "1px solid #e8f5e9",
                  position: "relative",
                }}
              >
                {/* Title & actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text strong style={{ fontSize: 16, color: "#2e7d32" }}>
                    {diary.title || dayjs(diary.date).format("YYYY年M月D日")}
                  </Text>
                  {isEditor && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(diary)}
                      />
                      <Popconfirm
                        title="确定要删除这条日志吗？"
                        onConfirm={() => handleDelete(diary.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </div>
                  )}
                </div>

                {/* Rendered markdown content */}
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {diary.content}
                  </ReactMarkdown>
                </div>

                {/* Timestamp */}
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(diary.updated_at).format("更新于 HH:mm")}
                  </Text>
                </div>
              </div>
            ),
          }))}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={
          <span>
            {editingDiary ? (
              <EditOutlined style={{ marginRight: 8 }} />
            ) : (
              <PlusOutlined style={{ marginRight: 8 }} />
            )}
            {editingDiary ? "编辑日志" : "写团队日志"}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingDiary ? "保存" : "发布"}
        cancelText="取消"
        width={720}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: "0 0 auto" }}>
              <Text strong>日期：</Text>
              <DatePicker
                value={dayjs(formDate)}
                onChange={(d) => setFormDate(d ? d.format("YYYY-MM-DD") : "")}
                allowClear={false}
                style={{ marginLeft: 8 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong>标题：</Text>
              <Input
                placeholder="（选填）日志标题"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={{ marginLeft: 8, width: "calc(100% - 50px)" }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>内容（支持 Markdown 格式）：</Text>
            <Button
              type="text"
              icon={showPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "编辑" : "预览"}
            </Button>
          </div>

          {showPreview ? (
            <div
              className="markdown-body"
              style={{
                minHeight: 300,
                padding: 16,
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                background: "#fafff9",
              }}
            >
              {formContent ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formContent}
                </ReactMarkdown>
              ) : (
                <Text type="secondary">暂无内容</Text>
              )}
            </div>
          ) : (
            <TextArea
              rows={12}
              placeholder="支持 Markdown 语法&#10;&#10;## 标题&#10;正文内容&#10;* 列表项&#10;**加粗** *斜体*"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
