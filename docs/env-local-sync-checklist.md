# 心电学堂 — `.env.local` 同步清单

`.env.local` **不进 Git**。换电脑、密钥轮换后，用本文逐项核对。

模板：项目根目录 [`.env.local.example`](../.env.local.example)

U 盘备份文件名建议：`ecg-academy.env.local`（复制到项目根后改名为 `.env.local`）

---

## 一、需要这份文件的环境

| 环境 | 路径 | 说明 |
|------|------|------|
| 本地开发机 | `ecg-academy/.env.local` | `npm run dev`、Python 脚本 |
| 生产服务器 | `/home/admin/ecg-academy/.env.local` | PM2 `ecg-academy`，端口 **3001** |
| Vercel（若启用） | Project → Environment Variables | 变量名与本地一致 |

**与 EP Mentor 的关系：** 共用 Supabase 时，`NEXT_PUBLIC_SUPABASE_*` 与 `SUPABASE_SERVICE_ROLE_KEY` **必须相同**；`NEXT_PUBLIC_SITE_URL` 各站独立（本站在线域名 `https://www.xindianxuetang.com`）。

---

## 二、变量清单

### 必填

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 数据库 / Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 浏览器端 Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 admin、配额（勿暴露前端） |
| `DEEPSEEK_API_KEY` | AI 对话、病例生成 |
| `NEXT_PUBLIC_ADMIN_EMAIL` | 管理后台入口 |
| `ADMIN_EMAIL` | 服务端管理员校验（与上一项**相同**） |

### 强烈建议

| 变量 | 推荐值 |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | 生产：`https://www.xindianxuetang.com`；本地可 `http://localhost:3000` |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | `deepseek-chat` |

### 可选

| 变量 | 何时需要 |
|------|----------|
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信小程序登录 |
| `WECHAT_LOGIN_SECRET` | 微信登录 HMAC（推荐单独随机串） |
| `WECHAT_PAY_MCH_ID` / `WECHAT_PAY_API_V3_KEY` | 微信支付回调 |
| `WECHAT_PAY_NOTIFY_DEBUG` | 仅开发；生产 `false` |
| `ECG_PDF_PATH` 等 `ECG_*` | 本地跑 `batch_generate_ecg_cases.py` 时 PDF/目录路径 |

---

## 三、跨环境必须一致

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DEEPSEEK_API_KEY`
- [ ] `ADMIN_EMAIL` === `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] 微信相关密钥（若已启用）

## 四、可按环境不同

| 变量 | 本地 | 生产 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://www.xindianxuetang.com` |
| `ECG_*` 路径 | 本机 PDF 路径 | 通常只在开发机需要 |
| `WECHAT_PAY_NOTIFY_DEBUG` | 可 `true` | 必须关闭 |

---

## 五、推荐同步方式

1. **U 盘** — `G:\ecg-academy.env.local` → 新电脑 `ecg-academy\.env.local`
2. **密码管理器** — 条目「心电学堂 .env.local」
3. **服务器拉取**（已有 SSH）：
   ```bash
   scp admin@47.84.49.31:/home/admin/ecg-academy/.env.local ./.env.local
   ```

❌ 勿提交 Git、勿明文群发。

---

## 六、新电脑 Setup 勾选表

```bash
git clone https://github.com/843002655-cloud/ecg-academy.git
cd ecg-academy
copy G:\ecg-academy.env.local .env.local   # 或从 U 盘 / 密码管理器粘贴
npm install
npm run dev
```

- [ ] `.env.local` 已就位
- [ ] `ADMIN_EMAIL` === `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] 首页可打开
- [ ] 管理员账号可进 `/admin`
- [ ] 病例 AI 对话正常（`DEEPSEEK_API_KEY`）
- [ ] `npm test` / `npm run build` 通过（可选）

---

## 七、服务器更新 env 后

```bash
ssh admin@47.84.49.31
cd /home/admin/ecg-academy
# 编辑 .env.local 后：
pm2 restart ecg-academy
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3001/
```

---

## 八、空白模板

见 [`.env.local.example`](../.env.local.example)。

---

*最后更新：2026-06-21*
