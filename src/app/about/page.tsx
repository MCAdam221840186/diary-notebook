"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Space,
  Divider,
  Spin,
  Empty,
} from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/auth-context";
import EditTeamMemberDialog from "@/components/EditTeamMemberDialog";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar_url: string | null;
}

export default function AboutPage() {
  const { isEditor, loaded } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team-members");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  const handleDataChange = () => setRefreshKey((k) => k + 1);

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 8 }}>
        关于我们
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        这个日记本应用帮助老师记录和保存孩子们的成长故事。
      </Typography.Paragraph>

      <Divider style={{ marginTop: 16, marginBottom: 24 }} />

      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        团队成员
      </Typography.Title>

      {/* Add button — only for editors */}
      {loaded && isEditor && (
        <EditTeamMemberDialog onSuccess={handleDataChange} />
      )}

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
      ) : members.length === 0 ? (
        <Empty description="还没有团队成员，在提权后添加第一位成员吧" />
      ) : (
        <Row gutter={[16, 16]}>
          {members.map((member) => (
            <Col key={member.id} xs={24} sm={12} md={8} lg={6}>
              <EditTeamMemberDialog
                member={member}
                onSuccess={handleDataChange}
                trigger={
                  <Card
                    hoverable
                    styles={{ body: { padding: 24 } }}
                    style={{
                      cursor: loaded && isEditor ? "pointer" : "default",
                      position: "relative",
                    }}
                  >
                    {loaded && isEditor && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#4caf50",
                          fontSize: 16,
                          opacity: 0.6,
                        }}
                      >
                        <EditOutlined />
                      </div>
                    )}
                    <Space
                      direction="vertical"
                      style={{ width: "100%", textAlign: "center" }}
                      size={12}
                    >
                      <Avatar
                        size={72}
                        src={member.avatar_url}
                        icon={!member.avatar_url ? <UserOutlined /> : undefined}
                        style={{ backgroundColor: "#4caf50" }}
                      />
                      <div>
                        <Typography.Text
                          strong
                          style={{ display: "block", fontSize: 16 }}
                        >
                          {member.name}
                        </Typography.Text>
                        {member.role && (
                          <Typography.Text
                            type="secondary"
                            style={{ display: "block", fontSize: 13, marginTop: 4 }}
                          >
                            {member.role}
                          </Typography.Text>
                        )}
                      </div>
                      {member.description && (
                        <Typography.Paragraph
                          type="secondary"
                          style={{ margin: 0, fontSize: 13 }}
                        >
                          {member.description}
                        </Typography.Paragraph>
                      )}
                    </Space>
                  </Card>
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
