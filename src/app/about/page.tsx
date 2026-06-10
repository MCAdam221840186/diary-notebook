"use client";

import { Typography, Row, Col, Card, Avatar, Space, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";

const teamMembers = [
  {
    name: "张老师",
    role: "班主任 & 语文老师",
    description: "负责班级日常管理，记录孩子们的成长点滴。",
    avatar: null,
  },
  {
    name: "李老师",
    role: "数学老师",
    description: "用数字和逻辑启发孩子们的思维。",
    avatar: null,
  },
  {
    name: "王老师",
    role: "英语老师",
    description: "带领孩子们走进英语的世界。",
    avatar: null,
  },
  {
    name: "陈老师",
    role: "美术老师",
    description: "鼓励孩子们用画笔表达内心的想法。",
    avatar: null,
  },
];

export default function AboutPage() {
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

      <Row gutter={[16, 16]}>
        {teamMembers.map((member, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              styles={{ body: { padding: 24 } }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%", textAlign: "center" }}
                size={12}
              >
                <Avatar
                  size={72}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#4caf50" }}
                />
                <div>
                  <Typography.Text
                    strong
                    style={{ display: "block", fontSize: 16 }}
                  >
                    {member.name}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13, marginTop: 4 }}
                  >
                    {member.role}
                  </Typography.Text>
                </div>
                <Typography.Paragraph
                  type="secondary"
                  style={{ margin: 0, fontSize: 13 }}
                >
                  {member.description}
                </Typography.Paragraph>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
