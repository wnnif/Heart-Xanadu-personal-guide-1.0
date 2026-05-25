# daohang

轻量个人导航页 / 个人主页。

## 技术栈

- Fastify
- HTML / CSS / Alpine.js
- SQLite / better-sqlite3
- Docker Compose 主部署
- systemd + Nginx 备用部署

## 快速启动

默认后台密码：

```txt
密码：123456
```

后台登录页只需要输入密码，不需要账号。

```bash
cp .env.example .env
docker compose up -d --build
```

验证：

```bash
curl http://127.0.0.1:3100/health
```

## 本地开发

```bash
npm install
npm run migrate
npm start
```

## 文档

- `AI_HANDOFF.md`：AI 行为边界和接手规则
- `docs/API.md`：接口文档
- `docs/DATABASE.md`：数据库文档
- `docs/DEPLOY.md`：部署文档
- `docs/UI_GUIDE.md`：UI 维护指南
