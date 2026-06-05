> ✅ **已完成**（2026-06-05）

## Phase 0：项目初始化

### 目标

搭建 Next.js 全栈项目基础。

### 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- bcrypt
- JWT
- shadcn/ui
- Docker

### 任务

1. 初始化 Next.js 项目
2. 配置 TypeScript、ESLint、Tailwind
3. 初始化 shadcn/ui
4. 初始化 Prisma + SQLite
5. 创建基础目录结构
6. 添加 `.env.example`
7. 添加 Dockerfile 和 docker-compose.yml
8. 添加基础 README

### Cursor Prompt

请基于当前仓库初始化一个 Next.js 14+ App Router 全栈项目，使用 TypeScript、Tailwind CSS、shadcn/ui、Prisma、SQLite。

请完成：

1. 创建符合架构文档的目录结构
2. 配置 Prisma 和 SQLite
3. 配置 Tailwind 和 shadcn/ui
4. 添加 .env.example
5. 添加 Dockerfile 和 docker-compose.yml
6. 添加基础 README
7. 确保 pnpm install、pnpm lint、pnpm build 可运行

暂时不要实现业务功能，只完成项目骨架。

### 验收标准

- [x] 项目可以启动
- [x] 首页可访问
- [x] Prisma 初始化成功
- [x] Docker 配置存在
- [x] lint/build 通过

> **Phase 0 状态（2026-06-05）**：脚手架验收已完成。包管理器已统一为 **pnpm**（`pnpm-lock.yaml` + `packageManager` 字段）。shadcn/ui 已通过 CLI 初始化（`components.json`）。本地已执行 `pnpm db:push` / `db:seed`，数据库位于 `data/app.db`。
>
> 说明：仓库实际进度已超前 Phase 0（含 Phase 1–3 部分实现：完整 Schema、JWT 认证、今日视图等），无需回滚。

### 任务进度

1. [x] 初始化 Next.js 项目
2. [x] 配置 TypeScript、ESLint、Tailwind
3. [x] 初始化 shadcn/ui
4. [x] 初始化 Prisma + SQLite
5. [x] 创建基础目录结构
6. [x] 添加 `.env.example`
7. [x] 添加 Dockerfile 和 docker-compose.yml
8. [x] 添加基础 README

------

> ✅ **已完成**（2026-06-05）

## Phase 1：数据库模型与基础服务层

### 目标

根据 PRD 建立完整 MVP 数据结构。

### 任务

实现 Prisma Schema：

- User
- DiaryEntry
- Todo
- Plan
- Review
- Note
- LongTermGoal
- Tag
- TagRelation
- Category
- GoalPlan

同时创建：

- `lib/db.ts`
- 基础类型和 enum
- seed 脚本
- create-user 脚本

### Cursor Prompt

请根据产品需求文档和技术架构文档，实现 Prisma 数据模型。

需要包含以下实体：

User、DiaryEntry、Todo、Plan、Review、Note、LongTermGoal、Tag、TagRelation、Category、GoalPlan。

要求：

1. 使用 SQLite 兼容的 Prisma schema
2. 所有用户数据都必须关联 user_id
3. 添加必要 enum，例如 TodoStatus、Priority、PlanType、PlanStatus、Mood、GoalStatus、ReviewPeriodType
4. 添加合理索引，例如 userId、date、dueDate、entityType/entityId
5. 创建 lib/db.ts Prisma 单例
6. 添加 prisma/seed.ts
7. 添加 scripts/create-user.ts
8. 添加 package scripts：db:push、db:seed、db:studio

完成后运行 Prisma generate 和 db push。

### 验收标准

- [x] Prisma schema 可生成
- [x] SQLite 数据库可创建
- [x] seed 可运行
- [x] 所有实体关系清晰

------

> ✅ **已完成**（2026-06-05）

## Phase 2：用户认证

### 目标

完成邮箱注册、登录、登出、JWT Cookie 鉴权。

### 任务

1. 实现 bcrypt 密码加密
2. 实现 JWT 签发和校验
3. 使用 HttpOnly Cookie 存储 token
4. 实现：
   - `/login`
   - `/register`
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/auth/logout`
5. 实现 `getSession()`
6. 实现 middleware 保护主应用路由

### Cursor Prompt

请实现 MVP 用户认证模块。

要求：

1. 邮箱 + 密码注册
2. 邮箱格式校验
3. 密码至少 8 位
4. 使用 bcrypt 加密密码
5. 登录成功后签发 JWT
6. JWT 存入 HttpOnly Cookie
7. 实现 logout 清除 Cookie
8. 实现 getSession()，供 Server Components 和 Server Actions 使用
9. 使用 middleware 保护 /today、/diary、/todos、/notes、/plans、/reviews、/goals、/search、/settings
10. 未登录用户访问主应用时重定向到 /login
11. 已登录用户访问 /login 或 /register 时重定向到 /today

请保持实现轻量，不引入 NextAuth。

### 验收标准

- [x] 可注册
- [x] 可登录
- [x] 可登出
- [x] 未登录不能访问主页面
- [x] 密码数据库中不是明文
- [x] Cookie 为 HttpOnly

------

> ✅ **已完成**（2026-06-05）

## Phase 3：主应用布局与导航

### 目标

搭建登录后的整体 UI 框架。

### 任务

1. 实现 `(main)/layout.tsx`
2. 桌面顶部导航
3. 移动端底部 Tab
4. 响应式布局
5. 基础深色或现代主题
6. 用户菜单和登出入口

### 页面入口

- `/today`
- `/diary`
- `/todos`
- `/notes`
- `/plans`
- `/reviews`
- `/goals`
- `/search`
- `/settings`

### Cursor Prompt

请实现主应用布局和导航。

要求：

1. 使用 app/(main)/layout.tsx 包裹所有登录后页面
2. 桌面端使用顶部导航，包含 今日、日记、待办、计划、复盘、笔记、目标、搜索、设置
3. 移动端使用底部 Tab，优先展示 今日、待办、笔记、更多
4. 使用 Tailwind 和 shadcn/ui 实现现代简洁 UI
5. 支持响应式布局
6. 提供登出入口
7. 每个主路由先放占位页面，避免 404

本阶段不需要实现业务 CRUD，只完成布局和导航。

### 验收标准

- [x] 登录后进入统一布局
- [x] 移动端可用
- [x] 导航可跳转
- [x] UI 风格统一

------

> ✅ **已完成**（2026-06-05）

## Phase 4：待办模块 Todo

### 目标

先实现最高频任务管理能力。

### 功能

- 创建待办
- 编辑待办
- 删除待办
- 标记完成 / 取消完成
- 填写完成说明
- 筛选：
  - 今日
  - 全部
  - 已完成
  - 未完成
- 优先级
- 截止日期

### Cursor Prompt

请实现待办模块。

页面：

1. /todos 待办列表
2. /todos/[id] 待办详情和编辑

功能：

1. 创建待办
2. 编辑标题、描述、截止日期、优先级、完成说明
3. 删除待办
4. 标记 completed / pending
5. completed 时记录 completedAt
6. 支持筛选：今日、全部、已完成、未完成
7. 今日待办规则：dueDate 为今天，或历史未完成待办
8. 所有查询必须限定当前登录用户
9. 使用 Server Actions 或 Route Handler，保持代码风格一致

请补充必要组件和服务层代码。

### 验收标准

- [x] 可完整 CRUD
- [x] 勾选完成后状态正确
- [x] 今日待办逻辑正确
- [x] 用户只能看到自己的待办

------

> ✅ **已完成**（2026-06-05）

## Phase 5：日记模块 Diary

### 目标

实现每日记录能力，并为今日视图做准备。

### 功能

- 创建日记
- 编辑日记
- 删除日记
- 按日期展示
- Markdown 正文
- mood
- 标签

### Cursor Prompt

请实现日记模块。

页面：

1. /diary 日记列表
2. /diary/[id] 日记详情和编辑

功能：

1. 创建日记
2. 编辑标题、日期、正文、心情
3. 删除日记
4. 日记列表按日期倒序展示
5. 支持一天多条日记
6. 支持 Markdown 正文输入
7. 支持给日记绑定标签
8. 所有数据必须限定当前登录用户

请复用已有布局和 UI 组件。

### 验收标准

- 可记录多条日记
- 可按日期浏览
- Markdown 内容可保存
- 标签可关联

------
> ✅ **已完成**（2026-06-05）
## Phase 6：今日视图 Today

### 目标

完成 MVP 最高频核心页面。

### 内容

今日页需要聚合：

- 今日待办
- 历史未完成待办
- 今日日记
- 快速新增待办
- 快速新增日记
- 今日完成率
- 未完成待办补说明入口

### Cursor Prompt

请实现 /today 今日视图。

今日视图需要聚合：

1. 今天的日记列表
2. 今天截止的待办
3. 历史未完成待办
4. 今日待办完成率
5. 快速新增待办
6. 快速新增日记
7. 待办可直接勾选完成/取消完成
8. 未完成待办可以直接填写 completionNote
9. 提供“创建今日复盘”入口，跳转到 /reviews/new?date=YYYY-MM-DD

要求：

1. 数据必须来自当前登录用户
2. 页面适配移动端
3. 保持操作路径短，适合每日高频使用

### 验收标准

- 一页内完成日记和待办核心操作
- 勾选待办无需进入详情页
- 移动端可正常使用

------
> ✅ **已完成**（2026-06-05）
## Phase 7：标签与分类系统

### 目标

为笔记、日记、搜索打基础。

### 功能

- 全局标签
- 标签创建 / 复用
- 多态关联
- 笔记分类
- 分类创建 / 编辑 / 删除

### Cursor Prompt

请实现标签和分类基础能力。

标签：

1. 用户级 Tag
2. name 在用户内唯一
3. 支持 color
4. 支持通过 TagRelation 关联 diary、todo、note、plan、review、goal
5. 提供可复用的 TagInput / TagSelector 组件

分类：

1. 用户级 Category
2. 主要用于 Note
3. 支持创建、编辑、删除
4. 支持 sortOrder

请将已有日记标签功能接入统一标签系统，并为后续笔记模块复用。

### 验收标准

- 标签可复用
- 标签不会跨用户串数据
- 分类可用于笔记

------
> ✅ **已完成**（2026-06-05）
## Phase 8：笔记模块 Note

### 目标

实现知识沉淀核心功能。

### 功能

- 创建笔记
- 编辑笔记
- 删除笔记
- Markdown 正文
- 分类
- 标签
- 列表筛选

### Cursor Prompt

请实现笔记模块。

页面：

1. /notes 笔记列表
2. /notes/[id] 笔记详情和编辑

功能：

1. 创建笔记
2. 编辑标题、正文、分类、标签
3. 删除笔记
4. Markdown 编辑和预览
5. /notes 支持按分类筛选
6. /notes 支持按标签筛选
7. 笔记卡片显示标题、摘要、分类、标签、更新时间
8. 所有数据必须限定当前登录用户

### 验收标准

- 30 秒内可创建一条笔记
- 可通过分类和标签筛选
- Markdown 内容可正常展示

------
> ✅ **已完成**（2026-06-05）
## Phase 9：基础搜索

### 目标

实现 MVP 检索能力。

### 搜索范围

- 日记
- 待办
- 笔记
- 计划
- 复盘
- 长期目标

### 筛选条件

- 关键词
- 类型
- 标签
- 分类
- 时间范围

### 实现建议

MVP 可先用 SQLite `contains` / `LIKE` 查询，不必一开始做 FTS5。等数据量增长后再升级 FTS5。

### Cursor Prompt

请实现 /search 全局搜索页面。

搜索范围：

1. DiaryEntry
2. Todo
3. Note
4. Plan
5. Review
6. LongTermGoal

筛选条件：

1. 关键词：匹配标题和正文/描述
2. 内容类型
3. 标签
4. 分类，主要用于笔记
5. 时间范围

要求：

1. MVP 可使用 Prisma contains 查询
2. 搜索结果按类型分组展示
3. 每条结果显示标题、摘要、类型、更新时间
4. 点击结果跳转到对应详情页
5. 所有查询必须限定当前登录用户
6. 代码结构预留未来升级 SQLite FTS5 的空间，例如放在 lib/services/search.ts

### 验收标准

- [x] 可搜到笔记和日记正文
- [x] 可按类型筛选
- [x] 可按标签筛选
- [x] 可按时间范围筛选

------


## Phase 10：计划模块 Plan

### 目标

实现计划与待办关联。

### 功能

- 计划 CRUD
- 短期 / 长期类型
- 状态
- 起止日期
- 关联待办
- 进度概览
- 从计划页创建关联待办

### Cursor Prompt

请实现计划模块。

页面：

1. /plans 计划列表
2. /plans/[id] 计划详情和编辑

功能：

1. 创建、编辑、删除计划
2. 字段包含标题、描述、类型、起止日期、状态
3. 计划详情展示关联待办
4. 展示完成数 / 总数和进度条
5. 支持从计划详情页创建关联待办
6. 支持将已有待办关联到计划
7. 所有数据必须限定当前登录用户

### 验收标准

- [x] 计划可关联待办
- [x] 进度统计正确
- [x] 可从计划拆分待办

------
> ✅ **已完成**（2026-06-05）

## Phase 11：每日复盘 Review

### 目标

实现每日复盘闭环。

### 功能

- 创建每日复盘
- 绑定日期
- 自动展示当日数据
- Markdown 内容
- 历史列表

### Cursor Prompt

请实现每日复盘模块。

页面：

1. /reviews 复盘列表
2. /reviews/new?date=YYYY-MM-DD 新建每日复盘
3. /reviews/[id] 复盘详情和编辑

功能：

1. 复盘 periodType MVP 固定为 daily
2. 复盘绑定 periodDate
3. 新建复盘时展示该日期的日记摘要
4. 新建复盘时展示该日期的待办完成情况
5. 用户可以编辑 Markdown 正文并保存
6. 复盘列表按日期倒序展示
7. 每个用户同一天最多一条 daily review
8. 所有数据必须限定当前登录用户

### 验收标准

- 可从今日页创建今日复盘
- 自动引用当日数据
- 可浏览历史复盘

------

## Phase 12：长期目标 Goal

### 目标

实现长期目标与计划关联。

### 功能

- 长期目标 CRUD
- 状态
- 关联多个计划
- 列表展示

### Cursor Prompt

请实现长期目标模块。

页面：

1. /goals 长期目标列表
2. /goals/[id] 长期目标详情和编辑

功能：

1. 创建、编辑、删除长期目标
2. 字段包含标题、描述、状态
3. 状态包括 active、completed、paused
4. 支持关联一个或多个计划
5. 详情页展示关联计划
6. MVP 不需要复杂进度，只展示关联计划数量和状态概览
7. 所有数据必须限定当前登录用户

### 验收标准

- 目标可 CRUD
- 可关联计划
- 页面可浏览目标状态

------

## Phase 13：设置页

### 目标

完成基础账户设置。

### 功能

- 修改昵称
- 重置密码（目前已经有这个功能了）
- 主题设置，可选

### Cursor Prompt

请实现 /settings 设置页面。

功能：

2. 修改 displayName


所有操作必须限定当前登录用户。

### 验收标准

- 可修改昵称
- 可修改密码
- 密码仍然加密保存

------

## Phase 14：UI 统一与移动端优化

### 目标

让 MVP 不像纯功能堆砌。

### 任务

1. 统一按钮、卡片、表单、空状态
2. 优化移动端布局
3. 优化表单错误提示
4. 增加 loading 状态
5. 增加删除确认
6. 优化 Markdown 显示
7. 优化今日页视觉层级

### Cursor Prompt

请对整个 MVP 做 UI 和交互统一优化。

重点：

1. 统一所有页面的标题、卡片、按钮、表单样式
2. 所有列表增加空状态
3. 所有删除操作增加确认
4. 表单错误提示清晰
5. 移动端布局必须可用
6. 今日页作为核心入口，需要视觉层级更清晰
7. 待办完成时提供轻微视觉反馈
8. 不改变已有业务逻辑

请检查 /today、/todos、/diary、/notes、/plans、/reviews、/goals、/search、/settings。

### 验收标准

- 手机浏览器可完成核心 CRUD
- 页面风格统一
- 错误提示明确

------

> ✅ **已完成**（2026-06-05）

## Phase 15：测试、部署与文档

### 目标

确保项目可以稳定运行和部署。

### 任务

1. 补充基础测试或手动验收脚本
2. 检查 lint/build
3. 检查 Docker 构建
4. 更新 README
5. 添加部署说明
6. 添加数据备份说明

### Cursor Prompt

请完成 MVP 收尾工作。

要求：

1. 运行并修复 pnpm lint
2. 运行并修复 pnpm build
3. 检查 Dockerfile 和 docker-compose.yml 是否可用于生产部署
4. 更新 README，包含：

   \- 本地开发

   \- 环境变量

   \- 数据库初始化

   \- 创建用户

   \- Docker 部署

   \- SQLite 数据备份

5. 添加 MVP 手动验收清单
6. 不新增超出 MVP 范围的功能

### 验收标准

- [x] `pnpm lint` 通过
- [x] `pnpm build` 通过
- [x] Docker 可构建（Dockerfile + docker-compose 已校验；本机未安装 Docker 时需自行验证）
- [x] README 可指导部署

> **Phase 15 状态（2026-06-05）**：已修复 lint 未使用 import；`pnpm lint` / `pnpm build` 通过。补充 `.dockerignore`、Docker 内 `create-user.js` 打包。更新 README（本地开发、环境变量、数据库、用户、Docker、备份）并新增 [MVP-ACCEPTANCE.md](./MVP-ACCEPTANCE.md)。

