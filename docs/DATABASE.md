# 数据库文档

本项目主数据使用 SQLite。

默认数据库路径：

```txt
data/daohang.sqlite
```

Docker 内路径：

```txt
/app/data/daohang.sqlite
```

## Node 库

使用：

```txt
better-sqlite3
```

原因：轻量、成熟、适合个人站和小后台。

## 表结构

详见：

```txt
src/db/schema.sql
```

### `app_content`

保存站点完整内容配置 JSON。

字段：

- `id`：固定为 1。
- `json`：完整内容配置，包含：
  - `siteTitle`：浏览器标题。
  - `profile` / `contacts` / `sites`：前台展示内容。
  - `footer.githubLabel` / `footer.githubUrl`：页脚 GitHub 项目链接。
  - `uiTemplate`：前台模板，`scheme-a` 或 `scheme-b`。
  - `wallpaperMode` / `gradientTheme` / `wallpaperApis` / `wallpaperFixed`：壁纸配置。
  - `siteCategories`：站点分类列表，分类项含 `id`、`name`、`order`。
  - `sites[].category`：站点所属分类 ID，空字符串表示不分类。
  - `sites[].order`：站点排序，数字越小越靠前。
- `updated_at`：更新时间。

当前为了兼容旧前端和旧后台，内容主体仍以 JSON 文档形式保存在 SQLite 中，避免第一次规范化时大拆数据结构。

后续如果某些功能增长明显，可以逐步拆成独立表，但必须写迁移。

### `admins`

后台登录信息。

当前后台登录页只需要密码，不需要账号；源码内部仍保留 `username` 字段用于以后扩展多管理员。

- `username`
- `password_hash`
- `created_at`
- `updated_at`

密码使用 PBKDF2 哈希存储。

### `stats_daily`

每日 PV 统计。

- `date`
- `pv`

### `visits`

访问记录明细。

- `visit_key`
- `ip`
- `location`
- `user_agent`
- `device`
- `os`
- `browser`
- `method`
- `path`
- `referer`
- `created_at`

## 迁移规则

任何 AI 或开发者修改数据库必须遵守：

1. 不得直接删除用户数据。
2. 新增字段必须兼容旧数据。
3. 改表结构必须更新本文档。
4. 复杂变更必须新增迁移脚本。
5. 禁止把访问记录重新改回 JSON。
6. 禁止引入 Prisma / MySQL / PostgreSQL / Redis，除非用户明确要求并确认迁移方案。

## 旧数据迁移

旧项目中的：

```txt
data/content.json
data/stats.json
data/visits.json
```

会在首次启动或执行以下命令时导入 SQLite：

```bash
npm run migrate
```

如果 SQLite 已存在 `app_content`，不会重复覆盖。

