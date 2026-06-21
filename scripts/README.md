# 心电学堂 — 运维脚本

## 部署

| 脚本 | 说明 |
|------|------|
| **`deploy-git.sh`** | **推荐** — 服务器 `git pull` + build + PM2 重启 |
| `deploy-remote.sh` | 备选 — 解压 scp 上传的 `ecg-academy-deploy.tar.gz` |
| `deploy-server.sh` | 首次在服务器目录内安装依赖并启动 PM2 |
| `nginx-ecg-academy.conf` | Nginx 反代示例（端口 **3001**） |

### Git 部署（推荐）

```bash
# 本机推送后，在服务器：
cd /home/admin/ecg-academy
bash scripts/deploy-git.sh main
```

或 SSH 一键：

```bash
ssh admin@47.84.49.31 "cd /home/admin/ecg-academy && bash scripts/deploy-git.sh main"
```

## 内容与数据

| 脚本 | 说明 |
|------|------|
| `batch_generate_ecg_cases.py` | 从 Hampton PDF 批量 AI 生成病例 |
| `upload_to_supabase.py` | 上传图片并导入 Supabase |
| `enrich-figure-questions.py` | 批量 enrich 病例 figure 元数据 |
| `supabase-api-tables.sql` | 测验 / profiles 等表迁移 |

Python 脚本读取项目根目录 `.env.local`（Supabase 见 `supabase_env.py`）。

路径可通过环境变量配置，见 `.env.local.example` 中的 `ECG_*` 变量。
