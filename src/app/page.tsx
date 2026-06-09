export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl">📓</div>
          <h1 className="text-4xl font-bold tracking-tight">Diary Notebook</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 text-center">
            记录每一天的思考与灵感
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
          <Card
            emoji="✍️"
            title="写日记"
            description="Markdown 格式，支持富文本编辑"
          />
          <Card
            emoji="🔍"
            title="全文搜索"
            description="快速检索过去的记录"
          />
          <Card
            emoji="☁️"
            title="云同步"
            description="数据存储在云端，随时随地访问"
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Stack: Next.js + Neon (Postgres) + Vercel
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          部署于 Vercel &middot; 开发中
        </p>
      </main>
    </div>
  );
}

function Card({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-3xl">{emoji}</span>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {description}
      </p>
    </div>
  );
}
