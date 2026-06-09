# Diary Notebook

## 项目概况

一个部署在 Vercel 上的全栈日记/笔记本应用。

### 技术栈

- **框架**: Next.js 16 (App Router, TypeScript)
- **样式**: Tailwind CSS v4
- **数据库**: Neon (PostgreSQL, via @neondatabase/serverless)
- **部署**: Vercel

### 环境变量

所有 Vercel 集成的数据库凭据通过 Vercel Dashboard 自动注入。本地开发需要在项目根目录创建 `.env.local` 文件：

```env
# Neon (Postgres)
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
PGHOST="..."
PGUSER="..."
PGPASSWORD="..."
PGDATABASE="..."
PGPORT="..."
```
