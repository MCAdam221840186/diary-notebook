// 临时种子脚本 — 重建表结构和测试数据
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// 手动解析 .env.local
const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const DATABASE_URL = envContent
  .split("\n")
  .find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "")
  ?.trim();

if (!DATABASE_URL) {
  console.error("❌ 未找到 DATABASE_URL");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log("🚀 开始重建数据库...");

  // 1. 创建表
  console.log("📦 创建表...");
  await sql`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS children (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
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
  await sql`DROP TABLE IF EXISTS notes;`;
  console.log("✅ 表创建完成");

  // 2. 插入测试 Token
  console.log("🔑 插入测试 Token...");
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
  console.log("✅ Token 插入完成");

  // 3. 清空旧数据并插入测试小朋友
  console.log("👶 插入测试小朋友...");
  await sql`DELETE FROM children;`;

  const childrenData = [
    { name: "小明", avatar_url: null },
    { name: "小红", avatar_url: null },
    { name: "小华", avatar_url: null },
    { name: "小丽", avatar_url: null },
    { name: "小刚", avatar_url: null },
  ];

  const children = [];
  for (const child of childrenData) {
    const [c] = await sql`
      INSERT INTO children (name, avatar_url)
      VALUES (${child.name}, ${child.avatar_url})
      RETURNING id, name;
    `;
    children.push(c);
    console.log(`  ✅ ${c.name} (${c.id})`);
  }

  // 4. 插入测试日记
  console.log("📝 插入测试日记...");
  await sql`DELETE FROM diaries;`;

  const diariesData = [
    { child_idx: 0, title: "今天的快乐", content: "今天在学校和朋友们一起玩得很开心，我们一起踢足球，我还进了一个球！" },
    { child_idx: 0, title: "我的暑假计划", content: "暑假快到了，我打算和爸爸妈妈一起去海边玩，还要去奶奶家住一个星期。" },
    { child_idx: 1, title: "春天的花", content: "今天老师带我们去公园看花，有红色的、黄色的、紫色的，好漂亮啊！我最喜欢粉色的樱花。" },
    { child_idx: 1, title: "我的小猫咪", content: "我家有一只小花猫，它叫咪咪。它有一双圆圆的大眼睛，毛茸茸的，非常可爱。" },
    { child_idx: 2, title: "第一次做饭", content: "今天我第一次帮妈妈做饭，我学会了打鸡蛋和洗菜，虽然有点累但是很开心。" },
    { child_idx: 2, title: "我最喜欢的书", content: "我最喜欢的书是《小王子》，这本书教会了我很多道理，我已经读了三遍了。" },
    { child_idx: 3, title: "画画课", content: "今天的美术课我们画了自己的家乡，我画了家门口的小河和远处的山。" },
    { child_idx: 3, title: "运动会", content: "今天我们学校举办了运动会，我参加了跑步比赛，虽然没拿到第一名，但是我很努力了！" },
    { child_idx: 4, title: "新朋友", content: "今天我们班来了一位新同学，他叫小强。我和他一起吃了午饭，还教他玩我们班的游戏。" },
    { child_idx: 4, title: "科学小实验", content: "今天我们做了火山爆发的实验，用醋和小苏打，好神奇！我长大了想当科学家。" },
  ];

  const now = new Date();
  for (let i = 0; i < diariesData.length; i++) {
    const { child_idx, title, content } = diariesData[i];
    const child = children[child_idx];
    // 让日期错开，每天一篇
    const date = new Date(now);
    date.setDate(date.getDate() - (diariesData.length - i));
    const timestamp = date.toISOString();

    const [d] = await sql`
      INSERT INTO diaries (child_id, title, content, created_at, updated_at)
      VALUES (${child.id}, ${title}, ${content}, ${timestamp}, ${timestamp})
      RETURNING id, title;
    `;
    console.log(`  ✅ [${child.name}] ${d.title} (${d.id})`);
  }

  // 5. 统计结果
  const [{ count: childCount }] = await sql`SELECT COUNT(*)::int AS count FROM children;`;
  const [{ count: diaryCount }] = await sql`SELECT COUNT(*)::int AS count FROM diaries;`;
  const [{ count: tokenCount }] = await sql`SELECT COUNT(*)::int AS count FROM auth_tokens;`;

  console.log("\n🎉 数据库重建完成！");
  console.log(`📊 统计：小朋友 ${childCount} 人，日记 ${diaryCount} 篇，Token ${tokenCount} 个`);
  console.log("\n🔑 测试 Token：");
  testTokens.forEach((t) => console.log(`   ${t}`));

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 执行失败:", err);
  process.exit(1);
});
