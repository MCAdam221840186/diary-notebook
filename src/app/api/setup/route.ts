import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Create notes table
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Insert a sample note
    const [sample] = await sql`
      INSERT INTO notes (title, content)
      VALUES ('欢迎使用 Diary Notebook', '这是你的第一条日记。用 Markdown 格式尽情书写吧 ✍️')
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    // Count total notes
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM notes;`;

    return Response.json({
      status: "ok",
      message: "数据库连接成功，notes 表已就绪",
      total_notes: count,
      sample_note: sample ?? null,
    });
  } catch (error) {
    console.error("Database setup failed:", error);
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
