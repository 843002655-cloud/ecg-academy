#!/bin/bash
# 在服务器上执行：解压并重启心电学堂
set -euo pipefail

APP_DIR="/home/admin/ecg-academy"
ARCHIVE="/home/admin/ecg-academy-deploy.tar.gz"

if [ ! -f "$ARCHIVE" ]; then
  echo "错误: 未找到 $ARCHIVE"
  exit 1
fi

echo "==> 备份 .env.local"
cp "$APP_DIR/.env.local" /tmp/ecg-academy.env.local.bak

echo "==> 清理旧构建产物"
rm -rf "$APP_DIR/.next"

echo "==> 解压到 $APP_DIR"
tar xzf "$ARCHIVE" -C "$APP_DIR"
rm -f "$ARCHIVE"

echo "==> 恢复 .env.local"
cp /tmp/ecg-academy.env.local.bak "$APP_DIR/.env.local"

cd "$APP_DIR"
echo "==> npm install"
npm install --prefer-offline 2>&1 | tail -5

echo "==> npm run build"
npm run build 2>&1 | tail -15

echo "==> pm2 restart ecg-academy"
pm2 restart ecg-academy
pm2 save

echo "==> 完成"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3001/
pm2 list
