# 个人生活助手 — 技术架构

> 版本：v0.1  
> 更新日期：2026-06-05  
> 方案：**Next.js 全栈 + SQLite + 单容器 Docker**

---

## 1. 架构决策摘要

| 项 | 选择 | 原因 |
|----|------|------|
| 应用形态 | Next.js 14+ App Router 单体 | 页面与 API 一体，单人开发最快 |
| 语言 | TypeScript | 端到端类型安全 |
| 数据库 | SQLite | 单用户使用，单文件易备份 |
| ORM | Prisma | 迁移与类型生成省心 |
| 认证 | JWT + bcrypt | 轻量，无 NextAuth 依赖 |
| 搜索 | SQLite FTS5 | 个人数据量足够 |
| UI | Tailwind CSS + shadcn/ui | 现代深色主题、组件丰富 |
| 部署 | Docker + Volume | 云 VPS 一键运行，数据持久化 |

**刻意不引入**：PostgreSQL、Redis、微服务、Supabase、独立 SPA 前端。

---

## 2. 系统架构图

```
                    云服务器 (单台 VPS)
┌─────────────────────────────────────────────────────┐
│  Docker 容器                                         │
│  ┌───────────────────────────────────────────────┐  │
│  │              Next.js 应用                        │  │
│  │  ┌─────────────┐  ┌──────────────────────────┐ │  │
│  │  │  页面/UI     │  │  API Routes /            │ │  │
│  │  │  /today      │  │  Server Actions          │ │  │
│  │  │  /diary ...  │  │  /api/auth, /api/search  │ │  │
│  │  └─────────────┘  └─────────────┬────────────┘ │  │
│  │                                  │              │  │
│  │                    Prisma ORM                    │  │
│  └──────────────────────────────────┼──────────────┘  │
│                                     │                 │
│  Volume 挂载 ──────────────────────▼                 │
│              /data/app.db  (SQLite)                  │
└─────────────────────────────────────────────────────┘
         ▲
         │ HTTPS
    Caddy / Nginx 反代（可选）
```

---

## 3. 目录结构

```
personal-life-assistant/
├── app/
│   ├── (auth)/              # 登录相关（无主导航）
│   │   └── login/
│   ├── (main)/              # 需登录的主应用
│   │   ├── layout.tsx
│   │   ├── today/
│   │   ├── diary/
│   │   ├── todos/
│   │   ├── notes/
│   │   ├── plans/
│   │   ├── reviews/
│   │   ├── goals/
│   │   ├── search/
│   │   └── settings/
│   ├── api/                 # REST API（Webhook 等）
│   │   ├── auth/
│   │   └── health/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn 组件
│   └── layout/              # 导航、侧栏
├── lib/
│   ├── db.ts                # Prisma 单例
│   ├── auth.ts              # JWT 签发/校验
│   ├── session.ts           # Cookie / 请求上下文
│   └── services/            # 业务逻辑
│       ├── today.ts
│       ├── review.ts
│       └── search.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   └── create-user.ts       # 单用户初始化
├── data/                    # SQLite（gitignore，Docker volume）
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── architecture.md
└── product-requirements.md
```

---

## 4. 数据层

实体与 PRD 一致，见 `prisma/schema.prisma`：

- User、DiaryEntry、Todo、Plan、Review、Note、LongTermGoal
- Tag、TagRelation（多态关联）、Category
- GoalPlan（长期目标 ↔ 计划 N:M）

全文检索：后续通过 SQLite FTS5 虚拟表或 `LIKE` + 标签联表实现（MVP 搜索模块）。

---

## 5. 认证流程

```
登录 POST /api/auth/login
  → 校验 email + bcrypt
  → 签发 JWT（payload: userId, exp）
  → Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax

受保护页面 / Server Action
  → middleware 或 getSession() 读 Cookie
  → 校验 JWT → 注入 userId

登出 POST /api/auth/logout
  → 清除 Cookie
```

单用户场景：部署时用 `pnpm db:seed` 或 `scripts/create-user.ts` 创建账号，可关闭公开注册。

---

## 6. 部署

```bash
# 本地开发
cp .env.example .env
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev

# 生产
docker compose up -d --build
```

环境变量：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | `file:../data/app.db`（本地）；`file:/app/data/app.db`（Docker） |
| `JWT_SECRET` | 随机长字符串 |
| `NODE_ENV` | `production` |

备份：定期拷贝 `data/app.db`。

---

## 7. 后续扩展（不改架构）

| 需求 | 实现方式 |
|------|----------|
| 微信录入 | `app/api/webhook/wechat/route.ts` |
| AI 拆计划 | `lib/ai/plan-split.ts` + OpenAI API |
| 附件 | `uploads/` 目录或对象存储 |
| PWA | `next-pwa` 或 Serwist |

---

## 8. 相关文档

- 产品需求：[product-requirements.md](./product-requirements.md)
