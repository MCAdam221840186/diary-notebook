import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "edge";

// PUT /api/children/[id] — update child (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { childId } = await params;
    const { name, avatar_data } = await request.json();
    const sql = getDb();

    const [child] = await sql`
      UPDATE children
      SET name = COALESCE(${name ?? null}, name),
          avatar_url = COALESCE(${avatar_data ?? null}, avatar_url)
      WHERE id = ${childId}
      RETURNING id, name, avatar_url
    `;

    if (!child) {
      return Response.json({ error: "小朋友不存在" }, { status: 404 });
    }

    return Response.json(child);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}
