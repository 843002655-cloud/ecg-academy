/**
 * 统一路由常量 — 心电学堂版
 * 共享 EP Mentor 后端 API，页面路径独立
 */

export const ROUTES = {
  // ── 主页面 ──
  HOME: "/",
  CASES: "/cases",
  QUIZ: "/quiz",
  AUTH: "/auth",
  PROFILE: "/profile",
  UPGRADE: "/upgrade",
  TERMS: "/terms",
  AI_CONSULT: "/ai-consult",
  ADMIN: "/admin",

  // ── 子页面（带参数用工厂函数） ──
  CASE_DETAIL: (id: string) => `/cases/${id}`,
  AUTH_REGISTER: "/auth?register=1",
  AUTH_REDIRECT: (redirect: string) => `/auth?redirect=${encodeURIComponent(redirect)}`,
  CASES_CATEGORY: (category: string) => `/cases?category=${category}`,

  // ── API（指向 EP Mentor 共享后端） ──
  API_CASES: "/api/cases",
  API_CASE: (id: string) => `/api/cases/${id}`,
  API_CHAT: "/api/chat",
  API_PROGRESS: "/api/progress",
  API_PROGRESS_COMPLETE: "/api/progress/complete",
  API_QUIZ_QUESTIONS: "/api/quiz-questions",
  API_QUIZ_QUESTION: (id: string) => `/api/quiz-questions/${id}`,
  API_PROFILE: "/api/profile",
  API_WECHAT_LOGIN: "/api/wechat/login",
  API_GENERATE_BOOK_CASE: "/api/generate-book-case",
  API_MEMBERSHIP_ACTIVATE: "/api/membership/activate",
  API_PAYMENT_WECHAT_NOTIFY: "/api/payment/wechat/notify",
} as const;
