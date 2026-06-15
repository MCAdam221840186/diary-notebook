import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const sql = getDb();

    // Create auth_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Create children table
    await sql`
      CREATE TABLE IF NOT EXISTS children (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Create diaries table
    await sql`
      CREATE TABLE IF NOT EXISTS diaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Create team_members table
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Create team_diaries table
    await sql`
      CREATE TABLE IF NOT EXISTS team_diaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Drop old notes table if exists
    await sql`DROP TABLE IF EXISTS notes;`;

    // Seed 3 test tokens (skip if already exist)
    const testTokens = [
      "dn-aB3kF9mX2pQ5rV7w",
      "dn-K8sL2dR4fG6hJ9mN",
      "dn-Q1wE3rT5yU7iO9pS",
    ];
    for (const token of testTokens) {
      await sql`
        INSERT INTO auth_tokens (token)
        VALUES (${token})
        ON CONFLICT (token) DO NOTHING;
      `;
    }

    // Count rows
    const [{ count: childCount }] =
      await sql`SELECT COUNT(*)::int AS count FROM children;`;
    const [{ count: diaryCount }] =
      await sql`SELECT COUNT(*)::int AS count FROM diaries;`;
    const [{ count: tokenCount }] =
      await sql`SELECT COUNT(*)::int AS count FROM auth_tokens;`;
    const [{ count: memberCount }] =
      await sql`SELECT COUNT(*)::int AS count FROM team_members;`;
    const [{ count: teamDiaryCount }] =
      await sql`SELECT COUNT(*)::int AS count FROM team_diaries;`;

    return Response.json({
      status: "ok",
      tables: {
        children: childCount,
        diaries: diaryCount,
        auth_tokens: tokenCount,
        team_members: memberCount,
        team_diaries: teamDiaryCount,
      },
    });
  } catch (error) {
    console.error("Setup failed:", error);
    return Response.json(
      { status: "error", message: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
