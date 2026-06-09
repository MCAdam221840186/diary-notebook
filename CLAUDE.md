# Diary Notebook

## 项目概况

一个部署在 Vercel 上的全栈日记/笔记本应用。教师收录孩子们的日记，支持鉴权编辑。

### 技术栈

- **框架**: Next.js 16 (App Router, TypeScript)
- **UI 库**: Ant Design v5
- **样式**: Tailwind CSS v4 (全局) + antd 组件样式
- **数据库**: Neon (PostgreSQL, via @neondatabase/serverless)
- **部署**: Vercel

### 数据库表结构

- **children** — `id UUID PK`, `name TEXT`, `avatar_url TEXT?`, `created_at`
- **diaries** — `id UUID PK`, `child_id UUID FK → children`, `title TEXT`, `content TEXT`, `created_at`, `updated_at`
- **auth_tokens** — `id UUID PK`, `token TEXT UNIQUE`, `created_at`

### 鉴权系统

- Token 格式: `dn-` + 16 位字母数字（例: `dn-aB3kF9mX2pQ5rV7w`）
- 3 个测试 Token 在 `/api/setup` 时自动入库
- TopBar 显示状态: 只读 → `"你正在阅读日记"` / 提权 → `"你正在阅读并修改日记"`
- 点击状态文字弹出 Token 输入对话框，调用 `/api/auth/verify` 验证
- 状态通过 `localStorage` (`diary_auth_token`) 持久化
- API 写操作通过 `Authorization: Bearer <token>` 头鉴权

### API 路由

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/setup` | — | 初始化所有表和测试 Token |
| POST | `/api/auth/verify` | — | 验证 Token `{ token } → { valid: bool }` |
| GET | `/api/children` | — | 列表（含 diary_count） |
| POST | `/api/children` | ✅ | 添加小朋友 `{ name, avatar_url? }` |
| GET | `/api/children/:id/diaries` | — | 日记列表 `{ child, diaries }` |
| POST | `/api/children/:id/diaries` | ✅ | 写日记 `{ title, content }` |
| GET | `/api/diaries/:id` | — | 日记详情 |
| PUT | `/api/diaries/:id` | ✅ | 编辑日记 `{ title, content }` |

### 页面路由

- `/` — 首页：孩子卡片网格（一行 5 个）
- `/children/[id]` — 孩子的日记列表（按日期倒序）
- `/diaries/[id]` — 日记详情

### 环境变量

所有 Vercel 集成的数据库凭据通过 Vercel Dashboard 自动注入。本地开发需要在项目根目录创建 `.env.local` 文件：

```env
# Neon (Postgres)
DATABASE_URL="postgresql://..."
```

### 头像存储

- 头像以 Base64 数据 URI 格式存储在 `children.avatar_url` 字段中
- 前端 `compressImage()` 通过 Canvas API 在浏览器端自动压缩至 400px 以内、JPEG 质量自适应（< 1MB）
- 无需额外文件存储服务

### 测试 Token

```text
dn-aB3kF9mX2pQ5rV7w
dn-K8sL2dR4fG6hJ9mN
dn-Q1wE3rT5yU7iO9pS
```
