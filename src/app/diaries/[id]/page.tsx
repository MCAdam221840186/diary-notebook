"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { Typography, Card, Empty, Button, Space, Spin, Divider } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import EditDiaryDialog from "@/components/EditDiaryDialog";

interface DiaryDetail {
  id: string;
  child_id: string;
  title: string;
  content: string;
  created_at: string;
  child_name: string;
}

export default function DiaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/diaries/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDiary(data);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleDataChange = () => setRefreshKey((k) => k + 1);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !diary) {
    return (
      <Empty description="日记不存在">
        <Link href="/diaries">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            返回首页
          </Button>
        </Link>
      </Empty>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Link href={`/children/${diary.child_id}`}>
          <Button type="text" icon={<ArrowLeftOutlined />}>
            返回
          </Button>
        </Link>
      </Space>

      <Card
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
        styles={{ body: { padding: "32px 40px" } }}
      >
        <Space style={{ marginBottom: 16 }}>
          <EditDiaryDialog
            diary={{
              id: diary.id,
              title: diary.title,
              content: diary.content,
              created_at: diary.created_at,
            }}
            onSuccess={handleDataChange}
          />
        </Space>

        <Typography.Title level={2} style={{ marginBottom: 12 }}>
          {diary.title}
        </Typography.Title>

        <Space style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            <UserOutlined style={{ marginRight: 4 }} />
            {diary.child_name}
          </Typography.Text>
          <Typography.Text type="secondary">
            <CalendarOutlined style={{ marginRight: 4 }} />
            {formatDate(diary.created_at)}
          </Typography.Text>
        </Space>

        <Divider style={{ marginTop: 0, marginBottom: 24 }} />

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            color: "#262626",
          }}
        >
          {diary.content || "（暂无内容）"}
        </div>
      </Card>
    </div>
  );
}
