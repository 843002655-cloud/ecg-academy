# 心电学堂 Web 端功能完善设计

## 概述

完善心电学堂 Next.js Web 端的三个核心页面：知识测验、个人中心、会员升级。参考 EP Mentor 的代码模式和组件风格。

## 模块 A：知识测验

### 页面：`/quiz`

- **题库来源**：本地 `src/lib/quiz-data.ts` 打底（约 40 题心电图判读题库）+ Supabase `/api/quiz-questions` API 扩展
- **题目范围**：心电图判读（正常 ECG、心梗定位、ST-T 改变、电解质异常、心律失常识别、起搏器 ECG 等），不涉及 EP 电生理
- **答题模式**：每轮 5 题，Fisher-Yates 洗牌随机选取
- **UI 交互**：
  - 进度条（第 X/5 题）
  - 选项即时高亮，提交后显示对错（绿/红）
  - 正确答案 + 解析展示
  - 结果页：得分 X/5 + 百分比 + 重新测验按钮
- **分类标签**：正常心电图、心肌缺血、心律失常、电解质、起搏器等

### 技术要点

- 复用 EP Mentor quiz 页面结构和组件
- 动态导入 `quiz-data.ts` 作为 fallback，API 优先
- Skeleton loading 状态
- 适配暗色模式

## 模块 B：个人中心

### 页面：`/profile`

- **用户卡片**：头像首字母 + 邮箱 + 角色标签（来自 `authService.getUser()`）
- **学习统计卡片**（4 个）：
  - 已完成病例数
  - 总病例数
  - 今日学习次数
  - 完成率
- **学习徽章**（6 枚，心电图主题）：
  - 🫀 初识心电图 — 完成首个病例
  - 📈 ST 段猎人 — 完成 5 个心肌缺血病例
  - ⚡ 心律失常侦探 — 完成 5 个心律失常病例
  - 🧠 AI 学伴 — 累计 50 次 AI 对话
  - 📚 勤奋学习者 — 完成 20 个病例
  - 🏆 判读达人 — 完成率 80%+
- **最近学习**：时间线列表（最近 10 条记录）

### 技术要点

- 复用 EP Mentor profile 页面结构
- 数据来源：`progressService.getUserProgress()` + `authService.getUser()`
- Skeleton loading + EmptyState（无记录时引导去病例库）
- 适配暗色模式

## 模块 C：会员升级

### 页面：`/upgrade`

- **三层定价展示**（更详细的权益对比表）：
  - Tier 1 基础心电图 — 免费
  - Tier 2 心律失常 — ¥99/年（🔥 推荐）
  - Tier 3 EP 电生理 — 含会员
- **权益对比**：病例数量、AI 对话次数、测验权限、学习报告
- **支付入口**：微信支付二维码占位（小程序阶段接入 JSAPI）
- **FAQ**：常见问题折叠面板

### 技术要点

- 复用首页 tier 设计的配色和风格
- 权益对比表格
- 二维码占位区域
- 联系邮箱入口

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新建 | `src/lib/quiz-data.ts` |
| 重写 | `src/app/quiz/page.tsx`（覆盖占位） |
| 重写 | `src/app/profile/page.tsx`（覆盖占位） |
| 重写 | `src/app/upgrade/page.tsx`（覆盖占位） |

## 设计原则

1. 参考 EP Mentor 代码风格，保持一致性
2. 适配现有暗色模式（`dark:` 前缀）
3. 复用现有组件（AppLayout、Skeleton、EmptyState、usePageTitle）
4. 共用已有 services 和 API 路由
