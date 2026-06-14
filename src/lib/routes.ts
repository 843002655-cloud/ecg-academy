/**
 * 统一路由常量 — 心电学堂版
 * 共享 EP Mentor 后端 API，页面路径独立
 */

export const ROUTES = {
  // ── 主页面 ──
  HOME: "/",
  CASES: "/cases",
  QUIZ: "/quiz",
  LIBRARY: "/library",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SUBMIT: "/submit",
  ABOUT: "/about",
  UPGRADE: "/upgrade",
  TERMS: "/terms",
  TOOLS: "/tools",
  AI_CONSULT: "/ai-consult",

  // ── 子页面（带参数用工厂函数） ──
  CASE_DETAIL: (id: string) => `/cases/${id}`,
  AUTH_REGISTER: "/auth?register=1",
  AUTH_REDIRECT: (redirect: string) => `/auth?redirect=${encodeURIComponent(redirect)}`,
  CASES_CATEGORY: (category: string) => `/cases?category=${category}`,

  // ── API（指向 EP Mentor 共享后端） ──
  API_CASES: "/api/cases",
  API_CASE: (id: string) => `/api/cases/${id}`,
  API_CHAT: "/api/chat",
  API_GENERATE_CASE: "/api/generate-case",
  API_PROGRESS: "/api/progress",
  API_QUIZ_QUESTIONS: "/api/quiz-questions",
  API_QUIZ_QUESTION: (id: string) => `/api/quiz-questions/${id}`,
  API_RESOURCES: "/api/resources",
  API_RESOURCE: (id: string) => `/api/resources/${id}`,
  API_SUBMISSIONS: "/api/submissions",
  API_SUBMISSION: (id: string) => `/api/submissions/${id}`,
} as const;
