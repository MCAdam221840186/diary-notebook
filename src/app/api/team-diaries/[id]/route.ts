import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// PUT /api/team-diaries/[id] — update a team diary (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { date, title, content } = await request.json();

    if (!date || !content || typeof content !== "string") {
      return Response.json({ error: "日期和内容不能为空" }, { status: 400 });
    }

    const sql = getDb();
    const [diary] = await sql`
      UPDATE team_diaries
      SET date = ${date}::date, title = ${title ?? ""}, content = ${content}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, date, title, content, created_at, updated_at
    `;

    if (!diary) {
      return Response.json({ error: "团队日志不存在" }, { status: 404 });
    }

    return Response.json(diary);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/team-diaries/[id] — delete a team diary (auth required)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const sql = getDb();
    const [diary] = await sql`
      DELETE FROM team_diaries WHERE id = ${id}
      RETURNING id
    `;

    if (!diary) {
      return Response.json({ error: "团队日志不存在" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
