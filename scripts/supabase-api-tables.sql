-- 心电学堂 API 所需 Supabase 表结构（在共享 EP Mentor 数据库中执行）
-- Usage: 在 Supabase SQL Editor 中运行本脚本

-- 1. 测验题库
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct INTEGER NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT 'ecg-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_product ON quiz_questions (product);

-- 2. 用户 profiles 扩展（若 profiles 表已存在则只加列）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wechat_openid TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_ref TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_wechat_openid
  ON profiles (wechat_openid)
  WHERE wechat_openid IS NOT NULL;

-- 3. （可选）从本地 seed 导入初始题库 — 由管理员通过 API POST 或单独 seed 脚本完成
