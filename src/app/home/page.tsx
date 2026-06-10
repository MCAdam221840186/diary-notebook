"use client";

import { Typography, Empty } from "antd";
import { HomeOutlined } from "@ant-design/icons";

export default function HomePage() {
  return (
    <div>
      <Typography.Title level={2}>
        <HomeOutlined style={{ marginRight: 8 }} />
        主页
      </Typography.Title>
      <Empty description="主页内容即将上线，敬请期待" />
    </div>
  );
}
