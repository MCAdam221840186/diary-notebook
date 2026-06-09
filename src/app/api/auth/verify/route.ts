import { verifyToken } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return Response.json({ valid: false }, { status: 400 });
    }

    const valid = await verifyToken(token);
    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false, error: "验证失败" }, { status: 500 });
  }
}
