# 配置说明

本项目通过 `.env` 控制运行端口、数据库位置、上传目录和后台安全参数。

## 快速开始

```bash
cp .env.example .env
openssl rand -hex 32
```

把生成的随机字符串填入 `.env` 的 `SESSION_SECRET`。

## 环境变量

- `NODE_ENV`：运行环境，生产环境填 `production`。
- `HOST`：容器内监听地址，Docker 推荐 `0.0.0.0`。
- `PORT`：应用在容器内监听端口，默认 `3000`。
- `APP_PORT`：Docker Compose 映射到宿主机的本地端口，默认 `3100`，实际只绑定 `127.0.0.1`。
- `DB_PATH`：SQLite 数据库路径，Docker 默认 `/app/data/daohang.sqlite`。
- `DATA_DIR`：旧 JSON 数据迁移目录，Docker 默认 `/app/data`。
- `UPLOAD_DIR`：上传图片保存目录，Docker 默认 `/app/public/uploads`。
- `MAX_UPLOAD_BYTES`：单个上传图片最大字节数，默认 `5242880`，即 5MB。
- `SESSION_SECRET`：后台 session cookie 签名密钥，必须改成强随机字符串。
- `ADMIN_PASSWORD`：首次初始化数据库时使用的后台默认密码。SQLite 已初始化后，后台修改密码会写入数据库，改 `.env` 不会覆盖已有密码。
- `COOKIE_SECURE`：是否给 session cookie 加 `Secure`。如果应用直接跑 HTTPS，可设为 `true`；如果由 Nginx 反代到本机 HTTP，通常保持 `false`。
- `TRUST_PROXY`：预留反代信任开关，默认 `true`。

## 后台入口

```txt
/admin/
```

后台登录页只需要输入密码，不需要账号。

默认示例密码是：

```txt
123456
```

上线后请马上在后台修改密码。

## 运行时数据

以下内容不会上传到 GitHub：

```txt
.env
data/content.json
data/stats.json
data/visits.json
data/*.sqlite
public/uploads/*
```

仓库只保留：

```txt
.env.example
data/content.example.json
public/uploads/.gitkeep
```

## Nginx 反代

容器默认映射到宿主机本地 `127.0.0.1:3100`，推荐由宿主机 Nginx 负责 HTTPS：

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
