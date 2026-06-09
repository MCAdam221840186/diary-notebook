import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// GET /api/children/[childId]/diaries — list diaries for a child
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const sql = getDb();

    // Verify child exists
    const [child] = await sql`SELECT id, name, avatar_url FROM children WHERE id = ${childId}`;
    if (!child) {
      return Response.json({ error: "小朋友不存在" }, { status: 404 });
    }

    const diaries = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM diaries
      WHERE child_id = ${childId}
      ORDER BY created_at DESC
    `;

    return Response.json({ child, diaries });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}

// POST /api/children/[childId]/diaries — create a diary (auth required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { childId } = await params;
    const { title, content, created_at } = await request.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json({ error: "标题不能为空" }, { status: 400 });
    }

    const sql = getDb();

    // Verify child exists
    const [child] = await sql`SELECT id FROM children WHERE id = ${childId}`;
    if (!child) {
      return Response.json({ error: "小朋友不存在" }, { status: 404 });
    }

    const timestamp = created_at || new Date().toISOString();
    const [diary] = await sql`
      INSERT INTO diaries (child_id, title, content, created_at, updated_at)
      VALUES (${childId}, ${title.trim()}, ${content ?? ""}, ${timestamp}, ${timestamp})
      RETURNING *
    `;

    return Response.json(diary, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
