# Heart Xanadu Personal Guide

轻量个人导航页 / 个人主页，当前预览站点：

```txt
https://hai.pw
```

## 功能

- 前台个人资料、联系方式、站点导航。
- 后台可编辑页面标题、头像、简介、联系方式、站点、分类、壁纸、天气、页脚和 GitHub 项目链接。
- 两套前台 UI 方案：高级毛玻璃 / 浮动主视觉。
- 支持渐变背景、随机动漫壁纸、随机 API 壁纸、固定图片壁纸。
- 访客统计和后台 IP 访问记录。
- Docker Compose 主部署，SQLite 持久化。

## 技术栈

- Fastify
- HTML / CSS / Alpine.js / 原生 JS
- SQLite / better-sqlite3
- Docker Compose
- 宿主机 Nginx 反代

## 快速部署

### 1. 克隆项目

```bash
git clone https://github.com/wnnif/Heart-Xanadu-personal-guide-1.0.git
cd Heart-Xanadu-personal-guide-1.0
```

### 2. 准备配置

```bash
cp .env.example .env
openssl rand -hex 32
```

编辑 `.env`，至少修改：

```env
SESSION_SECRET=上一步生成的强随机字符串
ADMIN_PASSWORD=换成你的初始后台密码
APP_PORT=3100
```

> `ADMIN_PASSWORD` 只在首次初始化 SQLite 数据库时生效。数据库已经存在后，请在后台修改密码。

### 3. 启动

```bash
docker compose up -d --build
```

### 4. 验证

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/content
```

默认访问：

```txt
http://127.0.0.1:3100
http://127.0.0.1:3100/admin/
```

后台登录页只需要输入密码，不需要账号。示例默认密码：`123456`，上线后请立即修改。

## Nginx 反代到 hai.pw

```nginx
server {
    listen 80;
    server_name hai.pw;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS 证书建议用 acme.sh 或 certbot 在宿主机 Nginx 上配置。

## 本地开发

```bash
npm install
npm run migrate
npm start
```

## 发布安全说明

不要提交运行时数据和敏感数据：

- 不要提交真实 `.env`
- 不要提交 `data/content.json`，里面可能含旧版后台密码
- 不要提交 `data/visits.json`，里面可能含访问 IP 记录
- 不要提交 `data/*.sqlite`，这是运行时数据库
- 不要提交 `public/uploads/` 里的上传内容

仓库只保留示例数据：

```txt
.env.example
data/content.example.json
public/uploads/.gitkeep
```

## 文档

- `AI_HANDOFF.md`：AI 行为边界和接手规则
- `docs/CONFIG.md`：配置说明
- `docs/API.md`：接口文档
- `docs/DATABASE.md`：数据库文档
- `docs/DEPLOY.md`：部署文档
- `docs/UI_GUIDE.md`：UI 维护指南
