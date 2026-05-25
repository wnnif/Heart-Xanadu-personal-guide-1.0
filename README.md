# Heart Xanadu 的个人引导页 1.0

一个轻量级个人导航/引导页，前台和后台都使用原生 HTML/CSS/JavaScript，后端使用 Node.js + Fastify。

## 功能

- 个人介绍、头像、位置、建站时间
- 联系方式跳转
- 多个个人网站卡片跳转
- 实时时钟
- 天气显示
  - 访客 IP 自动定位（不弹浏览器定位权限）
  - 固定城市/API 模式
- 访客统计
  - 今日访客
  - 今日浏览
  - 总浏览
- IP 访问记录页 `/ip`
  - 使用后台同一个密码登录
  - 按 IP 汇总总访问次数
  - 点击 IP 行查看每天每次访问的具体时间、路径、来源
- 壁纸系统
  - 随机 API
  - 每日 API
  - 固定 URL 列表
  - 本地上传图片
- 后台管理 `/admin/`
  - 修改页面标题/浏览器标签
  - 修改个人资料
  - 修改联系方式
  - 修改个人网站
  - 修改壁纸
  - 修改天气配置
  - 修改页脚
  - 修改后台密码，修改后自动退出并使用新密码登录

## 技术栈

- Node.js
- Fastify
- 原生 HTML/CSS/JavaScript
- JSON 文件存储
- Nginx 反代
- systemd 守护进程

## 目录结构

```text
.
├── admin/                    # 后台管理页静态文件
│   └── index.html
├── public/                   # 前台静态文件
│   ├── index.html
│   └── uploads/              # 运行时上传壁纸目录，默认不提交 Git
├── src/
│   └── server.js             # Fastify 后端入口
├── data/
│   └── content.example.json  # 示例配置，真实 content.json 不提交 Git
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## 数据文件说明

运行时会使用这些文件：

- `data/content.json`：网站内容、后台密码、站点、壁纸、天气配置
- `data/stats.json`：访问统计
- `data/visits.json`：IP 访问记录
- `public/uploads/`：后台上传的壁纸

这些文件可能包含后台密码、IP 记录或用户上传内容，所以默认不会提交到 GitHub。

## 本地手动搭建

### 1. 安装 Node.js

建议 Node.js 20+。

```bash
node -v
npm -v
```

### 2. 克隆项目

```bash
git clone https://github.com/<你的用户名>/Heart-Xanadu-personal-guide-1.0.git
cd Heart-Xanadu-personal-guide-1.0
```

### 3. 安装依赖

```bash
npm install
```

### 4. 初始化配置

```bash
mkdir -p data public/uploads
cp data/content.example.json data/content.json
```

编辑配置：

```bash
nano data/content.json
```

至少修改：

- `siteTitle`
- `profile.name`
- `profile.bio`
- `contacts`
- `sites`
- `admin.password`

### 5. 启动

```bash
PORT=3000 npm start
```

访问：

- 前台：`http://服务器IP:3000/`
- 后台：`http://服务器IP:3000/admin/`
- IP 记录：`http://服务器IP:3000/ip`

## 生产环境 systemd 部署

假设项目放在：

```bash
/opt/haoyi-nav
```

创建服务：

```bash
cat > /etc/systemd/system/haoyi-nav.service << 'EOF'
[Unit]
Description=Heart Xanadu Personal Guide Page
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/haoyi-nav
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
Environment=PORT=3000
StandardOutput=append:/var/log/haoyi-nav.log
StandardError=append:/var/log/haoyi-nav.log

[Install]
WantedBy=multi-user.target
EOF
```

如果你的 Node 路径不是 `/usr/bin/node`，先查看：

```bash
which node
```

然后修改 `ExecStart`。

启动服务：

```bash
systemctl daemon-reload
systemctl enable --now haoyi-nav
systemctl status haoyi-nav --no-pager
```

## Nginx 反代示例

域名示例：`example.com`

```nginx
server {
    listen 80;
    server_name example.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

申请证书：

```bash
certbot certonly --webroot -w /var/www/html -d example.com --non-interactive --agree-tos --email admin@example.com
```

HTTPS 示例：

```nginx
server {
    listen 80;
    server_name example.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

验证并重载：

```bash
nginx -t
systemctl reload nginx
```

## 后台使用

- 后台地址：`/admin/`
- IP 记录地址：`/ip`
- 两者使用同一个密码：`data/content.json` 里的 `admin.password`
- 后台修改密码后，`/ip` 的密码也同步变更

## 备注

- 不要提交真实 `data/content.json`，里面含后台密码。
- 不要提交 `data/visits.json`，里面含访问 IP 记录。
- 不要提交 `public/uploads/`，里面是运行时上传内容。
