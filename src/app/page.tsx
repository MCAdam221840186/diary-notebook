"use client";

import { Button, Typography } from "antd";
import { RightCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e3f2fd 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,199,132,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(144,202,249,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <Typography.Title
          style={{
            fontSize: 72,
            fontWeight: 300,
            letterSpacing: 16,
            color: "#2e7d32",
            margin: 0,
            marginBottom: 16,
            fontFamily: '"Noto Sans SC", "STKaiti", "KaiTi", serif',
          }}
        >
          云启青禾
        </Typography.Title>

        <Typography.Paragraph
          style={{
            fontSize: 18,
            color: "#558b2f",
            marginBottom: 48,
            letterSpacing: 4,
          }}
        >
          记录每一株幼苗的成长故事
        </Typography.Paragraph>

        <Button
          type="primary"
          size="large"
          shape="round"
          icon={<RightCircleOutlined />}
          onClick={() => router.push("/diaries")}
          style={{
            height: 48,
            paddingInline: 36,
            fontSize: 16,
          }}
        >
          进入日记
        </Button>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          color: "#a5d6a7",
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        云启青禾
      </div>
    </div>
  );
}
