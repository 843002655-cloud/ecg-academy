#!/bin/bash
# ============================================================
# 心电学堂 (ecg-academy) 一键部署脚本
# 运行环境：Ubuntu + Nginx + PM2（与 EP Mentor 同服务器）
# 使用方法：在宝塔终端粘贴运行
# ============================================================
set -e

APP_NAME="ecg-academy"
APP_DIR="/www/wwwroot/${APP_NAME}"
DOMAIN="www.xindianxuetang.com"
SERVER_IP="47.84.49.31"
PORT=3001  # EP Mentor 用 3000，这个用 3001

echo "=========================================="
echo "  心电学堂 (ecg-academy) 部署脚本"
echo "  域名: ${DOMAIN}"
echo "  端口: ${PORT}"
echo "=========================================="

# ── 1. 创建目录，解压 ────────────────────────────
echo ""
echo "[1/7] 准备目录..."
mkdir -p ${APP_DIR}
cd ${APP_DIR}

if [ -f /tmp/ecg-academy-deploy.tar.gz ]; then
    echo "  解压项目文件..."
    tar xzf /tmp/ecg-academy-deploy.tar.gz -C ${APP_DIR}/
    rm -f /tmp/ecg-academy-deploy.tar.gz
else
    echo "  ⚠ 没有找到 /tmp/ecg-academy-deploy.tar.gz"
    echo "  请先在宝塔「文件」里上传 ecg-academy-deploy.tar.gz 到 /tmp/"
    exit 1
fi

# ── 2. 安装依赖 ──────────────────────────────────
echo ""
echo "[2/7] 安装依赖..."
npm install

# ── 3. 检查 .env.local ───────────────────────────
echo ""
echo "[3/7] 检查环境变量..."
if [ ! -f .env.local ]; then
    echo "  复制 .env.local.example → .env.local"
    cp .env.local.example .env.local
    echo "  ⚠ 请编辑 .env.local 填入真实的 API key 和数据库连接信息"
    echo "  路径: ${APP_DIR}/.env.local"
    read -p "  按回车继续（确认已编辑好）..."
fi

# ── 4. 构建 ──────────────────────────────────────
echo ""
echo "[4/7] 构建生产版本..."
npm run build

# ── 5. 配置 Nginx ───────────────────────────────
echo ""
echo "[5/7] 配置 Nginx..."

NGINX_CONF="/www/server/panel/vhost/nginx/${DOMAIN}.conf"

cat > ${NGINX_CONF} << NGINXEOF
# 心电学堂 (ecg-academy)
server {
    listen 80;
    server_name ${DOMAIN};

    # 日志
    access_log /www/wwwlogs/${DOMAIN}.log;
    error_log  /www/wwwlogs/${DOMAIN}.error.log;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;

        # 流式 AI 响应需要关闭缓冲
        proxy_buffering off;
        proxy_cache off;
    }

    # 静态资源直接由 Nginx 服务（更好的性能）
    location /_next/static {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_cache_valid 200 1d;
        add_header X-Cache-Status \$upstream_cache_status;
    }
}
NGINXEOF

echo "  Nginx 配置写入: ${NGINX_CONF}"
nginx -t && nginx -s reload
echo "  Nginx 重载成功"

# ── 6. 配置 PM2 ──────────────────────────────────
echo ""
echo "[6/7] 配置 PM2..."

# 如果已经有旧实例，先停掉
pm2 delete ${APP_NAME} 2>/dev/null || true

pm2 start npm --name ${APP_NAME} \
    --cwd ${APP_DIR} \
    -- start

pm2 save

echo "  PM2 进程已启动: ${APP_NAME}"

# ── 7. 设置 SSL 证书（Let's Encrypt）──────────────
echo ""
echo "[7/7] SSL 证书..."
if [ -f /www/server/panel/vhost/cert/${DOMAIN}/fullchain.pem ]; then
    echo "  SSL 证书已存在"
else
    echo "  尝试申请 SSL 证书..."
    # 宝塔 acme.sh 路径
    if [ -f /root/.acme.sh/acme.sh ]; then
        /root/.acme.sh/acme.sh --issue -d ${DOMAIN} --webroot /www/wwwroot/${APP_NAME} || echo "  自动申请失败，请在宝塔面板「SSL」中手动申请"
    else
        echo "  请在宝塔面板 → 网站 → ${DOMAIN} → SSL → 申请 Let's Encrypt 证书"
    fi
fi

# ── 完成 ──────────────────────────────────────────
echo ""
echo "=========================================="
echo "  部署完成！"
echo "  HTTP:  http://${DOMAIN}"
echo "  HTTPS: https://${DOMAIN}（SSL 配置后生效）"
echo ""
echo "  管理命令："
echo "  pm2 status            查看进程状态"
echo "  pm2 logs ${APP_NAME}  查看日志"
echo "  pm2 restart ${APP_NAME} 重启应用"
echo "=========================================="
