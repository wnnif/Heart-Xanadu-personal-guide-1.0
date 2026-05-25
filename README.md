# daohang

轻量个人导航页 / 个人主页。

## 技术栈

- Fastify
- HTML / CSS / Alpine.js
- SQLite / better-sqlite3
- Docker Compose 主部署
- systemd + Nginx 备用部署

## 快速启动

默认后台账号密码：

```txt
账号：admin
密码：123456
```

搭建完成后请登录后台自行修改密码。

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
