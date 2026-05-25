# daohang AI 接手说明

本项目是轻量个人导航页 / 个人主页，目标是长期可维护、方便 AI 接手，但禁止无边界重构。

## 技术栈锁定

- 后端：Fastify
- 前端：HTML / CSS / Alpine.js / 原生 JS
- 数据库：SQLite，Node 库使用 `better-sqlite3`
- 主部署：Docker Compose
- 备用部署：systemd + 宿主机 Nginx
- 反代：推荐由宿主机 Nginx 负责 80/443

## 默认禁止

任何 AI 默认禁止执行以下行为：

- 禁止迁移到 React / Vue / Next.js / Nuxt。
- 禁止引入 Prisma。
- 禁止引入 MySQL / PostgreSQL / Redis。
- 禁止删除 Docker Compose 主部署方式。
- 禁止删除 systemd 备用部署文档。
- 禁止写死用户域名、服务器 IP、账号、密码、Token。
- 禁止把后台可配置内容写死到前端。
- 禁止擅自修改前台可见文案。
- 禁止无计划大规模重写 UI。
- 禁止删除现有功能或用户数据。
- 禁止改数据库结构但不写迁移说明。
- 禁止改 API 但不更新 `docs/API.md`。

## 允许新增功能

可以新增功能，但必须遵守：

1. 保持 Fastify + Alpine.js + SQLite 架构。
2. 前台可见配置优先放到后台管理。
3. 涉及 API 必须更新 `docs/API.md`。
4. 涉及数据库必须更新 `docs/DATABASE.md`。
5. 涉及部署必须更新 `docs/DEPLOY.md`。
6. 不得破坏现有页面、登录、保存、上传、访问统计。
7. 完成后必须给出验证命令。

## 需要用户明确确认

以下操作必须先问用户：

- 删除功能或数据。
- 修改主部署方式。
- 修改数据库核心设计。
- 引入大型依赖或外部服务。
- 修改登录认证/权限体系。
- 大规模 UI 重做。
- 更换技术栈。
- 修改 Docker Compose 对外端口。
- 修改线上 Nginx 域名配置。

## Gemini 边界

Gemini 主要用于 UI 优化，默认只允许修改：

- `public/index.html`
- `admin/index.html`
- `public/assets/css/`
- `public/assets/js/app.js`
- `public/assets/js/admin.js`
- `public/assets/js/modules/`

Gemini 默认禁止修改：

- `src/db/`
- `src/routes/`
- `src/services/`
- `src/config/`
- `package.json`
- `docker-compose.yml`
- `Dockerfile`
- `data/`

## 后端 AI 边界

Claude / GPT / Codex 可以修改：

- `src/routes/`
- `src/services/`
- `src/db/`
- `src/utils/`
- `docs/`

但必须遵守：

- routes 只写接口。
- services 写业务逻辑。
- db 只处理 SQLite 连接、schema、迁移。
- utils 放通用函数。
- API 改动同步更新文档。
- 数据库改动同步更新文档。

## 当前重要路径

- 入口：`src/server.js`
- 应用组装：`src/app.js`
- 配置：`src/config/index.js`
- SQLite schema：`src/db/schema.sql`
- 前台：`public/index.html`
- 后台：`admin/index.html`
- 主 CSS：`public/assets/css/main.css`
- 后台 CSS：`public/assets/css/admin.css`
- 数据库：`data/daohang.sqlite`
- 上传：`public/uploads/`
