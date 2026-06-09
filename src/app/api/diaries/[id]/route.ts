import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// GET /api/diaries/[id] — get diary detail
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();

    const [diary] = await sql`
      SELECT d.*, c.name AS child_name
      FROM diaries d
      JOIN children c ON c.id = d.child_id
      WHERE d.id = ${id}
    `;

    if (!diary) {
      return Response.json({ error: "日记不存在" }, { status: 404 });
    }

    return Response.json(diary);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}

// PUT /api/diaries/[id] — update diary (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { title, content, created_at } = await request.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json({ error: "标题不能为空" }, { status: 400 });
    }

    const sql = getDb();

    // Build update SET dynamically — only update created_at if provided
    const timestamp = created_at || new Date().toISOString();
    const [diary] = await sql`
      UPDATE diaries
      SET title = ${title.trim()}, content = ${content ?? ""}, created_at = ${timestamp}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!diary) {
      return Response.json({ error: "日记不存在" }, { status: 404 });
    }

    return Response.json(diary);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}
