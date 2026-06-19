#!/bin/bash
# 心电学堂 — 阿里云 ECS 部署脚本
# 用法: bash scripts/deploy-server.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> 项目目录: $APP_DIR"

if [ ! -f package.json ]; then
  echo "错误: 未找到 package.json，请确认在 ecg-academy 目录下运行"
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "错误: 缺少 .env.local，请先复制 .env.local.example 并填入密钥"
  echo "  cp .env.local.example .env.local && nano .env.local"
  exit 1
fi

echo "==> 检查 Node.js..."
node -v
npm -v

echo "==> 安装系统依赖 (canvas)..."
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
fi

echo "==> npm install..."
npm install

echo "==> npm run build..."
npm run build

echo "==> 启动/重启 PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

pm2 delete ecg-academy 2>/dev/null || true
pm2 start npm --name ecg-academy -- start
pm2 save

echo ""
echo "部署完成！"
echo "  本地访问: http://127.0.0.1:3000"
echo "  外网访问: http://47.84.49.31:3000 （需安全组放行 3000 端口）"
echo "  推荐: 配置 Nginx 反向代理 + 域名 + HTTPS"
echo ""
pm2 status
