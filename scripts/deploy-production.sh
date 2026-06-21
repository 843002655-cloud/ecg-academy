#!/bin/bash
# 从本 Mac 一键部署心电学堂到生产服务器（需先完成 scripts/add-mac-key-to-server.sh）
# 用法: bash scripts/deploy-production.sh [branch]
set -euo pipefail

BRANCH="${1:-main}"

echo "==> 测试 SSH 连接..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=10 yovigo "echo ok" >/dev/null 2>&1; then
  echo "错误: 无法 SSH 到 yovigo (47.84.49.31)"
  echo ""
  echo "请先在「能登录服务器的旧电脑」上运行："
  echo "  bash scripts/add-mac-key-to-server.sh"
  exit 1
fi

echo "==> 部署 branch: $BRANCH"
ssh yovigo "cd /home/admin/ecg-academy && bash scripts/deploy-git.sh $BRANCH"

echo ""
echo "==> 完成。请访问 https://www.xindianxuetang.com 验证。"
