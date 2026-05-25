# 部署文档

本项目主部署方式为 Docker Compose，保留 systemd + Nginx 作为备用方式。

## 方式 A：Docker Compose 主部署

### 1. 准备配置

```bash
cd /opt/daohang
cp .env.example .env
```

编辑 `.env`：

```env
APP_PORT=3100
SESSION_SECRET=改成强随机字符串
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
```

默认后台账号：

```txt
账号：admin
密码：123456
```

搭建完成后请登录后台自行修改密码。

> 上传 GitHub 时只能提交 `.env.example`，不要提交真实 `.env`。上线后建议在 `.env` 里把 `SESSION_SECRET` 改成强随机字符串。

### 2. 启动

```bash
cd /opt/daohang
docker compose up -d --build
```

### 3. 验证

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/content
```

### 4. Nginx 反代示例

宿主机 Nginx 继续负责 80/443，容器只监听本机端口。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

不要把域名写死进项目代码。

## 方式 B：systemd 备用部署

### 1. 安装依赖

```bash
cd /opt/daohang
npm install
npm run migrate
```

### 2. systemd 示例

```ini
[Unit]
Description=Daohang Fastify App
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/daohang
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3100
Environment=DB_PATH=/opt/daohang/data/daohang.sqlite
Environment=UPLOAD_DIR=/opt/daohang/public/uploads
ExecStart=/usr/bin/node /opt/daohang/src/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 3. 管理命令

```bash
systemctl daemon-reload
systemctl enable --now daohang
systemctl status daohang
```

## 数据备份

SQLite 文件：

```txt
/opt/daohang/data/daohang.sqlite
```

上传文件：

```txt
/opt/daohang/public/uploads/
```

备份至少包含这两个位置。
