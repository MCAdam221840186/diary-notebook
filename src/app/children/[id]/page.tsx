"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { Typography, Card, Empty, Button, Space, Spin } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import AddDiaryDialog from "@/components/AddDiaryDialog";
import AvatarUpload from "@/components/AvatarUpload";

interface Diary {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ChildData {
  id: string;
  name: string;
  avatar_url: string | null;
}

export default function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [child, setChild] = useState<ChildData | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/children/${id}/diaries`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChild(data.child);
      setDiaries(data.diaries);
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

  if (notFound || !child) {
    return (
      <Empty description="小朋友不存在">
        <Link href="/home">
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
    });
  }

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Link href="/home">
          <Button type="text" icon={<ArrowLeftOutlined />}>
            返回
          </Button>
        </Link>
      </Space>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <AvatarUpload
          childId={id}
          currentAvatar={child.avatar_url}
          onSuccess={handleDataChange}
        />
      </div>

      <Typography.Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
        {child.name} 的日记
      </Typography.Title>
      <Typography.Paragraph
        type="secondary"
        style={{ textAlign: "center", marginBottom: 24 }}
      >
        共 {diaries.length} 篇日记
      </Typography.Paragraph>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <AddDiaryDialog childId={id} onSuccess={handleDataChange} />
      </div>

      {diaries.length === 0 ? (
        <Empty description="还没有日记" />
      ) : (
        diaries.map((diary) => (
          <Link
            key={diary.id}
            href={`/diaries/${diary.id}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              hoverable
              style={{ marginBottom: 12 }}
              styles={{ body: { padding: "16px 24px" } }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  {diary.title}
                </Typography.Text>
                <Typography.Text type="secondary">
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  {formatDate(diary.created_at)}
                </Typography.Text>
                {diary.content && (
                  <Typography.Paragraph
                    ellipsis={{ rows: 2 }}
                    type="secondary"
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {diary.content}
                  </Typography.Paragraph>
                )}
              </Space>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
