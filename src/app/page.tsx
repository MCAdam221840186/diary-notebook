"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Avatar, Empty, Spin } from "antd";
import { UserOutlined, FileTextOutlined } from "@ant-design/icons";
import Link from "next/link";
import AddChildDialog from "@/components/AddChildDialog";

interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  diary_count: number;
}

export default function HomePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChildren(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 8 }}>
        小朋友们的日记
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        点击卡片浏览日记
      </Typography.Paragraph>

      <AddChildDialog />

      {loading ? (
        <div style={{ textAlign: "center", padding: 64 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Empty
          description={
            <Typography.Text type="danger">加载失败: {error}</Typography.Text>
          }
        />
      ) : children.length === 0 ? (
        <Empty description="还没有小朋友，在提权后添加第一位小作者吧" />
      ) : (
        <Row gutter={[16, 16]}>
          {children.map((child) => (
            <Col key={child.id} xs={12} sm={8} md={6} lg={4}>
              <Link href={`/children/${child.id}`} style={{ textDecoration: "none" }}>
                <Card
                  hoverable
                  style={{ textAlign: "center" }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Avatar
                    size={64}
                    src={child.avatar_url}
                    icon={!child.avatar_url ? <UserOutlined /> : undefined}
                    style={{ marginBottom: 12 }}
                  />
                  <Typography.Text
                    strong
                    style={{ display: "block", fontSize: 15 }}
                  >
                    {child.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    <FileTextOutlined style={{ marginRight: 4 }} />
                    {child.diary_count} 篇日记
                  </Typography.Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
