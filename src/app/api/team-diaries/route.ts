import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// GET /api/team-diaries — list all team diaries ordered by date desc
export async function GET() {
  try {
    const sql = getDb();
    const diaries = await sql`
      SELECT id, date, title, content, created_at, updated_at
      FROM team_diaries
      ORDER BY date DESC, created_at DESC
    `;
    return Response.json(diaries);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}

// POST /api/team-diaries — create a team diary (auth required)
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { date, title, content } = await request.json();
    if (!date || !content || typeof content !== "string") {
      return Response.json({ error: "日期和内容不能为空" }, { status: 400 });
    }

    const sql = getDb();
    const [diary] = await sql`
      INSERT INTO team_diaries (date, title, content)
      VALUES (${date}::date, ${title ?? ""}, ${content})
      RETURNING id, date, title, content, created_at, updated_at
    `;

    return Response.json(diary, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
