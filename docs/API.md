# API 文档

基础地址同站点域名。接口返回沿用现有前端兼容格式。

## 公共接口

### GET `/health`

健康检查。

```json
{ "ok": true }
```

### GET `/api/content`

获取前台内容配置。不会返回 `admin` 字段。主要字段：

- `siteTitle`：浏览器标题。
- `profile`：个人资料。
- `contacts`：联系方式，支持 `apple`、`qq`、`wechat`、`telegram`、`github`、`email/mail`、`twitter`、`globe`、`cloud`、`image`、`compass`、`link` 图标。
- `footer`：页脚配置，支持 `copyright`、`icp`、`githubLabel`、`githubUrl`，前台页脚会显示 GitHub 项目跳转链接。
- `uiTemplate`：前台 UI 方案。

- `scheme-a`：方案 A，高级毛玻璃，保留当前左窄右宽布局。
- `scheme-b`：方案 B，浮动主视觉布局，左侧 Hero 固定，右侧站点卡片更突出。

站点支持分类和排序字段：

- `siteCategories`：分类列表，每项包含 `id`、`name`、`order`。
- `sites[].category`：站点所属分类 ID；为空表示不分类。
- `sites[].order`：站点排序，数字越小越靠前。

前台规则：没有分类或没有站点选择分类时，保持原平铺布局；有分类时显示“我的站点 → 分类 → 站点”。

### GET `/api/stats`

获取访问统计。

```json
{
  "total": 100,
  "today": 5,
  "todayPv": 5,
  "todayVisitors": 2,
  "date": "2026-05-25",
  "daily": {
    "2026-05-25": 5
  }
}
```

### POST `/api/visit`

记录一次访问，并增加 PV。

### GET `/api/weather`

返回天气数据。默认兼容 wttr.in JSON 结构。

### GET `/api/wallpaper`

重定向到当前壁纸 URL。

## 后台接口

后台接口使用 HttpOnly Cookie `session`。

### POST `/api/admin/login`

请求：

```json
{ "password": "后台密码" }
```

成功：

```json
{ "ok": true }
```

失败：HTTP 401。

### POST `/api/admin/logout`

退出登录并清除 Cookie。

### GET `/api/admin/content`

获取后台完整配置，包含 `admin` 字段。需要登录。

### PUT `/api/admin/content`

保存完整内容配置。需要登录。

### PUT `/api/admin/password`

修改后台密码。修改成功后会清空现有登录 session。

请求：

```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

### POST `/api/admin/upload`

上传图片。字段名不限，取 multipart 第一个文件。支持：jpg、jpeg、png、webp、gif。

成功：

```json
{ "ok": true, "url": "/uploads/xxx.png" }
```

### GET `/api/admin/stats`

获取统计数据。需要登录。

### GET `/api/visits`

获取按日期分组的访问记录。需要登录。

### GET `/api/ip`

后台 IP 访问记录页面。未登录会显示登录页；已登录显示按 IP 汇总的访问次数和展开详情。

