import { getDb } from "./db";

export async function verifyToken(token: string): Promise<boolean> {
  if (!token || !token.startsWith("dn-") || token.length !== 19) return false;
  const sql = getDb();
  const result = await sql`SELECT 1 FROM auth_tokens WHERE token = ${token}`;
  return result.length > 0;
}

export function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function requireAuth(request: Request): Promise<Response | null> {
  const token = getBearerToken(request);
  if (!token) {
    return Response.json({ error: "未授权：缺少 token" }, { status: 401 });
  }
  const valid = await verifyToken(token);
  if (!valid) {
    return Response.json({ error: "未授权：token 无效" }, { status: 401 });
  }
  return null;
}
