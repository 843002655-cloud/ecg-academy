# 心电学堂 — AI 心电图判读教学平台

> 面向全体临床医生的 Web 学习平台（微信小程序规划中），AI 苏格拉底式对话教你判读心电图。

## 架构

```
┌─────────────────────────────────────────┐
│  心电学堂 Web (Next.js 14 App Router)    │
│  首页 · 病例库 · AI 对话 · 测验 · 会员   │
└──────────────────┬──────────────────────┘
                   ▼
    ┌──────────────────────────────────┐
    │  Supabase (PostgreSQL + Auth)    │
    │  DeepSeek API · 共享 EP Mentor DB │
    └──────────────────────────────────┘
```

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | Next.js 14 · React 18 · Tailwind CSS |
| 后端 | Next.js API Routes |
| 数据库 | Supabase PostgreSQL |
| AI | DeepSeek API |
| 登录 | 邮箱密码 · 微信登录 API（小程序） |

## 主要功能

- **病例库**：按 tier / 分类筛选，AI 苏格拉底式逐图教学
- **AI 问心**：自由心电图问答
- **知识测验**：会员专属，支持错题复习与历史记录
- **个人中心**：学习进度、徽章、会员状态、AI 配额
- **管理后台**：数据统计、病例发布、题库查看、会员手动开通

## 本地开发

```bash
git clone https://github.com/843002655-cloud/ecg-academy.git
cd ecg-academy
cp .env.local.example .env.local
# 填写 Supabase 与 DeepSeek 密钥（多机同步见 docs/env-local-sync-checklist.md）

npm install
npm run dev
```

在 Supabase SQL Editor 执行 `scripts/supabase-api-tables.sql` 创建测验题库与 profiles 扩展字段。

## 多电脑协作（Git + GitHub）

代码源：**https://github.com/843002655-cloud/ecg-academy**  
默认分支：**`main`**

### 新电脑首次 setup

```bash
git clone https://github.com/843002655-cloud/ecg-academy.git
cd ecg-academy
npm install
cp .env.local.example .env.local   # 填入密钥（U 盘 / 密码管理器同步）
npm run dev
```

`.env.local` **不要提交 Git**。完整变量说明见 **[docs/env-local-sync-checklist.md](docs/env-local-sync-checklist.md)**。

### 日常：离开电脑前

```bash
git add .
git commit -m "描述本次改动"
git push origin main
```

### 日常：换电脑后

```bash
git pull origin main
npm install    # package.json 有变化时
npm run dev
```

### 功能分支（可选）

```bash
git checkout -b feature/my-change
git push -u origin feature/my-change
# GitHub 开 PR 合并到 main
```

## 部署

### 推荐：服务器 git pull

服务器目录 `/home/admin/ecg-academy` 已是 git 仓库，推送后在服务器执行：

```bash
cd /home/admin/ecg-academy
bash scripts/deploy-git.sh main
```

或本机 SSH 一键：

```bash
ssh admin@47.84.49.31 "cd /home/admin/ecg-academy && bash scripts/deploy-git.sh main"
```

### 备选：scp 整包

```bash
tar --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=*.tar.gz -czf ecg-academy-deploy.tar.gz .
scp ecg-academy-deploy.tar.gz admin@47.84.49.31:/tmp/
ssh admin@47.84.49.31 "bash /home/admin/ecg-academy/scripts/deploy-remote.sh"
```

- **生产：** PM2 + Nginx，端口 **3001**，域名 www.xindianxuetang.com
- 脚本说明见 [scripts/README.md](scripts/README.md)

## 脚本

| 脚本 | 用途 |
|------|------|
| `scripts/batch_generate_ecg_cases.py` | 从 PDF 批量 AI 生成病例 |
| `scripts/upload_to_supabase.py` | 上传图片并导入病例 |
| `scripts/supabase-api-tables.sql` | 数据库迁移 |

路径可通过环境变量配置：

```bash
export ECG_PDF_PATH=/path/to/book.pdf
export ECG_CASES_DIR=/path/to/ecg_cases
export ECG_IMAGES_DIR=/path/to/ecg_images
```

## 会员体系

| 方案 | 价格 | 权益 |
|------|------|------|
| 基础入门 | 免费 | Tier 1 病例、有限 AI 对话 |
| 临床判读 | ¥129/年 | 全病例 + 知识测验 |
| 机构版 | ¥999/年 | 批量账号 |

支付：Web 端扫码 + 管理员后台手动开通；微信支付回调 API 已预留。

## 开发路线

- [x] Web MVP（病例 + AI + 测验 + 个人中心）
- [x] 后端 API（quiz / wechat / generate-case / membership）
- [ ] 会员付费墙与 tier 访问控制
- [ ] 微信小程序（Taro）
- [ ] 微信支付全自动回调

## 与 EP Mentor 的关系

共享 Supabase 数据库，通过 `content_json.product = 'ecg-academy'` 区分病例归属。
