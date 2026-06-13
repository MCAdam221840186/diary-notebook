import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// GET /api/team-members — list all team members
export async function GET() {
  try {
    const sql = getDb();
    const members = await sql`
      SELECT * FROM team_members
      ORDER BY created_at ASC
    `;
    return Response.json(members);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}

// POST /api/team-members — create a team member (auth required)
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { name, role, description, avatar_data } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "姓名不能为空" }, { status: 400 });
    }

    const sql = getDb();
    const [member] = await sql`
      INSERT INTO team_members (name, role, description, avatar_url)
      VALUES (${name.trim()}, ${role ?? ""}, ${description ?? ""}, ${avatar_data ?? null})
      RETURNING *
    `;
    return Response.json(member, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
