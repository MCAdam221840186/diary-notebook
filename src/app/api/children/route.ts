import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// GET /api/children — list children with diary count
export async function GET() {
  try {
    const sql = getDb();
    const children = await sql`
      SELECT c.*, COUNT(d.id)::int AS diary_count
      FROM children c
      LEFT JOIN diaries d ON d.child_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    return Response.json(children);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}

// POST /api/children — create a child (auth required)
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { name, avatar_data } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "姓名不能为空" }, { status: 400 });
    }

    const sql = getDb();
    const [child] = await sql`
      INSERT INTO children (name, avatar_url)
      VALUES (${name.trim()}, ${avatar_data ?? null})
      RETURNING *
    `;
    return Response.json(child, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
