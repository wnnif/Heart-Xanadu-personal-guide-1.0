# daohang

轻量个人导航页 / 个人主页。

## 技术栈

- Fastify
- HTML / CSS / Alpine.js
- SQLite / better-sqlite3
- Docker Compose 主部署
- systemd + Nginx 备用部署

## 快速部署

### 1. 克隆项目

```bash
git clone https://github.com/wnnif/Heart-Xanadu-personal-guide-1.0.git
cd Heart-Xanadu-personal-guide-1.0
```

### 2. 准备配置

```bash
cp .env.example .env
```

默认后台密码：

```txt
123456
```

后台登录页只需要输入密码，不需要账号。搭建完成后请登录后台自行修改密码。

### 3. 启动

```bash
docker compose up -d --build
```

### 4. 验证

```bash
curl http://127.0.0.1:3100/health
```

默认访问：

```txt
http://127.0.0.1:3100
http://127.0.0.1:3100/admin/
```

## 本地开发

```bash
npm install
npm run migrate
npm start
```

## GitHub 提交注意

不要提交运行时数据和敏感数据：

- 不要提交真实 `.env`
- 不要提交 `data/content.json`，里面可能含后台密码
- 不要提交 `data/visits.json`，里面可能含访问 IP 记录
- 不要提交 `data/*.sqlite`，这是运行时数据库
- 不要提交 `public/uploads/` 里的上传内容

仓库只保留示例数据：

```txt
data/content.example.json
public/uploads/.gitkeep
```

## 文档

- `AI_HANDOFF.md`：AI 行为边界和接手规则
- `docs/API.md`：接口文档
- `docs/DATABASE.md`：数据库文档
- `docs/DEPLOY.md`：部署文档
- `docs/UI_GUIDE.md`：UI 维护指南
