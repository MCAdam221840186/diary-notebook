import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// PUT /api/team-members/[id] — update a team member (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { memberId } = await params;
    const { name, role, description, avatar_data } = await request.json();
    const sql = getDb();

    const [member] = await sql`
      UPDATE team_members
      SET
        name = COALESCE(${name ?? null}, name),
        role = COALESCE(${role ?? null}, role),
        description = COALESCE(${description ?? null}, description),
        avatar_url = COALESCE(${avatar_data ?? null}, avatar_url),
        updated_at = NOW()
      WHERE id = ${memberId}
      RETURNING *
    `;

    if (!member) {
      return Response.json({ error: "团队成员不存在" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}
