# 心电学堂 ↔ EP Mentor 后端整合方案

## 架构原则

**共享后端，各自前端。** 心电学堂小程序通过 HTTP API 调用 EP Mentor 的 Next.js API 路由。

## 数据库改动

只需在 `cases` 表加一个 `product` 字段：

```sql
ALTER TABLE cases ADD COLUMN product TEXT DEFAULT 'ep-mentor';

-- 基础心电图病例标记为 'ecg-academy'
-- 心律失常病例标记为 'ecg-academy'
-- EP 电生理病例保持 'ep-mentor'
```

## API 调用方式

心电学堂小程序的 `utils/api.ts` 指向 EP Mentor 部署域名：

```typescript
const API_BASE = "https://www.yovigo.cn/api";

// 病例查询（加 product 过滤）
export async function getCases(product: "ecg-academy" | "ep-mentor") {
  const res = await wx.request({
    url: `${API_BASE}/cases?product=${product}`,
  });
  return res.data;
}

// AI 对话（同一个 /api/chat，prompt 不同）
export async function chat(messages, caseContext) {
  const res = await wx.request({
    url: `${API_BASE}/chat`,
    method: "POST",
    data: { messages, caseContext, stream: false },
  });
  return res.data;
}
```

## 用户体系

两个产品共享同一 Supabase auth：

```
微信小程序 wx.login(code) 
  → POST /api/wechat/login 
  → Supabase auth.signIn 
  → 返回 JWT token
  → 同一个 user id，两个产品通用
```

会员状态存 `profiles` 表：
```sql
ALTER TABLE profiles ADD COLUMN plan TEXT DEFAULT 'free';
-- 'free' | 'pro' | 'institution'
```

## 未来合并路径

如果以后想把两个小程序合并：

1. 合并 Taro 项目页面文件
2. 在 app.json 配置 4 个 tab（首页/病例库/学习/我的）
3. 后端零改动
4. 一天完成

## 零改动的 API 清单

以下 API 心电学堂直接复用，零改动：

| API | 用途 |
|-----|------|
| POST /api/chat | AI 对话（stream: false） |
| GET /api/cases | 病例列表 |
| GET /api/cases/[id] | 病例详情 |
| GET /api/progress | 学习进度 |
| POST /api/wechat/login | 微信登录 |
| GET /api/quiz-questions | 测验题库 |
| POST /api/generate-book-case | AI 生成新病例 |
| GET /api/quota | 用量查询 |
