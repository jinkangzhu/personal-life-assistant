# Personal Life Assistant

个人笔记、日记与待办助手 — Next.js 全栈 + SQLite + Docker。

## 文档

- [产品需求](./product-requirements.md)
- [技术架构](./architecture.md)
- [MVP 手动验收清单](./MVP-ACCEPTANCE.md)

## 本地开发

### 前置要求

- Node.js 20+
- [pnpm](https://pnpm.io/) 10+

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，**生产环境务必修改** `JWT_SECRET`（建议使用 32 位以上随机字符串）。

### 3. 初始化数据库

```bash
pnpm db:push
pnpm db:seed
```

`db:push` 会根据 Prisma schema 创建/更新 SQLite 表结构；`db:seed` 会创建默认用户（见下方「创建用户」）。

数据库文件默认位于 `data/app.db`（已在 `.gitignore` 中排除，不会提交到 git）。

### 4. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，使用 seed 账号登录。

### 5. 质量检查（发布前）

```bash
pnpm lint
pnpm build
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | SQLite 路径。本地：`file:./data/app.db`；Docker：`file:/app/data/app.db` |
| `JWT_SECRET` | 是 | JWT 签名密钥，生产环境必须使用强随机字符串 |
| `JWT_EXPIRES_IN` | 否 | Token 有效期，默认 `30d` |
| `PASSWORD_RESET_SECRET` | 否 | 开发者密码重置密钥（至少 16 位）。配置后可通过 `/reset-password` 重置密码；留空则禁用 |
| `SEED_EMAIL` | 否 | `db:seed` / `create-user` 默认邮箱 |
| `SEED_PASSWORD` | 否 | `db:seed` / `create-user` 默认密码（至少 8 位） |
| `SEED_DISPLAY_NAME` | 否 | seed 用户显示名称，默认 `Me` |

完整示例见 [`.env.example`](./.env.example)。

## 创建用户

### 方式一：Seed（推荐首次本地开发）

在 `.env` 中配置 `SEED_EMAIL`、`SEED_PASSWORD`、`SEED_DISPLAY_NAME`，然后：

```bash
pnpm db:seed
```

### 方式二：命令行脚本

```bash
pnpm create-user -- your@email.com yourpassword "Your Name"
```

若省略参数，脚本会读取 `.env` 中的 `SEED_*` 变量。密码至少 8 位；同一邮箱再次执行会更新密码。

### 忘记密码

在 `.env` 中设置 `PASSWORD_RESET_SECRET`（至少 16 位），访问 `/reset-password`，输入邮箱、新密码和该密钥完成重置。

## Docker 部署

适用于云服务器等生产环境。容器启动时会自动执行 `prisma db push` 同步表结构。

### 1. 准备环境文件

```bash
cp .env.example .env
```

至少修改：

```env
JWT_SECRET=your-long-random-secret
```

可选：配置 `PASSWORD_RESET_SECRET` 以启用密码重置页面。

### 2. 构建并启动

```bash
docker compose up -d --build
```

应用默认监听 `http://<服务器IP>:3000`。生产环境建议在前面加 Caddy / Nginx 做 HTTPS 反代。

### 3. 创建首个用户

容器内不包含 `tsx`，使用构建时打包的脚本：

```bash
docker compose exec app node create-user.js your@email.com yourpassword "Your Name"
```

或在宿主机 `.env` 中配置 `SEED_*` 后，将变量传入容器再执行（需自行 `export` 或在 `docker-compose.yml` 中挂载）：

```bash
docker compose exec -e SEED_EMAIL -e SEED_PASSWORD -e SEED_DISPLAY_NAME app node create-user.js
```

### 4. 数据持久化

`docker-compose.yml` 将宿主 `./data` 挂载到容器 `/app/data`，SQLite 文件 `data/app.db` 在容器重建后仍保留。

### 5. 常用运维命令

```bash
# 查看日志
docker compose logs -f app

# 重启
docker compose restart app

# 停止
docker compose down
```

## SQLite 数据备份

SQLite 为单文件数据库，**定期拷贝 `data/app.db` 即可备份**。

### 本地

```bash
# Linux / macOS
cp data/app.db "data/app.db.backup.$(date +%Y%m%d)"

# Windows PowerShell
Copy-Item data/app.db "data/app.db.backup.$(Get-Date -Format yyyyMMdd)"
```

### Docker 部署

在宿主机上备份挂载目录即可（无需进入容器）：

```bash
cp data/app.db "data/app.db.backup.$(date +%Y%m%d)"
```

建议：备份前可先停止应用或确保无写入，避免拷贝到不一致状态；重要数据请保留多个历史备份并异地存储。

## 项目结构

```
app/           Next.js 页面与 API
components/    UI 与布局组件
lib/           数据库、认证、业务服务
prisma/        数据模型与 seed
scripts/       运维脚本（含 Docker entrypoint、create-user）
data/          SQLite 数据（不提交 git）
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式（Turbopack） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 运行生产构建 |
| `pnpm lint` | ESLint 检查 |
| `pnpm db:push` | 同步数据库 schema |
| `pnpm db:seed` | 创建/更新默认用户 |
| `pnpm db:studio` | 打开 Prisma Studio |
| `pnpm create-user` | 创建/更新用户 |

## MVP 功能范围

- [x] JWT 认证（登录 / 登出 / 注册 / 密码重置）
- [x] 今日视图（日记 + 待办聚合）
- [x] 日记 / 待办 / 笔记 CRUD
- [x] 计划 / 复盘 / 长期目标
- [x] 全局搜索（FTS5）
- [x] 设置（标签、分类、个人资料、密码、主题）
- [x] Docker 单容器部署

发布前请按 [MVP-ACCEPTANCE.md](./MVP-ACCEPTANCE.md) 逐项手动验收。

## 技术栈

- Next.js 15 (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS 4 + shadcn/ui
- pnpm
- JWT + bcrypt
