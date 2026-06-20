"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { SkeletonBox } from "@/components/Skeleton";
import type { QuizQuestion } from "@/lib/quiz-data";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { ROUTES } from "@/lib/routes";
import { catColors } from "@/lib/constants";
import { profileService } from "@/lib/services";
import type { UserProfile } from "@/lib/services";
import {
  loadQuizHistory,
  saveQuizResult,
  getWrongQuestionsFromHistory,
  type QuizHistoryEntry,
} from "@/lib/quiz-history";

const QUIZ_SIZE = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  usePageTitle("知识测验");
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongInRound, setWrongInRound] = useState<QuizHistoryEntry["wrongQuestions"]>([]);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [showReview, setShowReview] = useState(false);

  const startQuiz = (pool: QuizQuestion[]) => {
    const picked = shuffle(pool).slice(0, QUIZ_SIZE);
    setQuestions(picked);
    setWrongInRound([]);
  };

  useEffect(() => {
    setHistory(loadQuizHistory());
    profileService.getProfile().then(setProfile).catch(() => setProfile(null));

    Promise.all([import("@/lib/quiz-data"), import("@/lib/services")]).then(
      ([quizData, { quizService }]) => {
        const FALLBACK = quizData.default;
        quizService
          .getQuestions()
          .then((qs) => {
            const pool = qs?.length ? qs : FALLBACK;
            setAllQuestions(pool);
            setLoading(false);
          })
          .catch(() => {
            setAllQuestions(FALLBACK);
            setLoading(false);
          });
      }
    );
  }, []);

  const canAccess = profile?.canAccessQuiz === true;

  useEffect(() => {
    if (canAccess && allQuestions.length) startQuiz(allQuestions);
  }, [canAccess, allQuestions]);

  if (loading || profile === undefined) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonBox className="h-8 w-48 mb-2" />
          <SkeletonBox className="h-5 w-64 mb-8" />
          <div className="card">
            <SkeletonBox className="h-6 w-3/4 mb-6" />
            <SkeletonBox className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="card">
            <div className="text-4xl mb-4">📝</div>
            <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">知识测验</h1>
            <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-6">
              请先登录。升级至临床判读会员后可使用知识测验功能。
            </p>
            <div className="flex flex-col gap-2">
              <Link href={ROUTES.AUTH} className="btn-primary text-center">登录 / 注册</Link>
              <Link href={ROUTES.UPGRADE} className="text-sm text-[#2D8C6A] dark:text-emerald-400 hover:underline">
                了解会员方案 →
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!canAccess) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="card">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">会员专属功能</h1>
            <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-2">
              当前方案：<strong>{profile.planLabel}</strong>
            </p>
            <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-6">
              升级至临床判读会员（¥129/年）即可解锁知识测验、无限次刷题与错题复习。
            </p>
            <Link href={ROUTES.UPGRADE} className="btn-primary inline-block">升级会员</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showReview) {
    const wrong = getWrongQuestionsFromHistory();
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={() => setShowReview(false)} className="text-sm text-[#2D8C6A] dark:text-emerald-400 mb-4 hover:underline">
            ← 返回测验
          </button>
          <h1 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-6 font-serif">错题复习</h1>
          {wrong.length === 0 ? (
            <p className="text-[#6B7F96] dark:text-slate-400">暂无错题记录，完成几轮测验后再来看看吧。</p>
          ) : (
            <div className="space-y-4">
              {wrong.map((w) => (
                <div key={w.id} className="card">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300">{w.category}</span>
                  <p className="font-medium text-[#1A2332] dark:text-slate-100 mt-2">{w.question}</p>
                  <p className="text-sm text-[#6B7F96] dark:text-slate-400 mt-2">{w.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  if (!questions.length) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-[#6B7F96] dark:text-slate-400">
          暂无题目
        </div>
      </AppLayout>
    );
  }

  const q = questions[currentQ];

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.correct) {
      setScore((s) => s + 1);
    } else {
      setWrongInRound((prev) => [
        ...prev,
        { id: q.id, question: q.question, explanation: q.explanation, category: q.category },
      ]);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < QUIZ_SIZE) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      let finalWrong = [...wrongInRound];
      if (submitted && selected !== null && selected !== q.correct && !finalWrong.some((w) => w.id === q.id)) {
        finalWrong = [
          ...finalWrong,
          { id: q.id, question: q.question, explanation: q.explanation, category: q.category },
        ];
      }
      saveQuizResult({ score, total: QUIZ_SIZE, wrongQuestions: finalWrong });
      setHistory(loadQuizHistory());
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setWrongInRound([]);
    startQuiz(allQuestions);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">知识测验</h1>
            <p className="text-[#6B7F96] dark:text-slate-400">
              每轮 {QUIZ_SIZE} 题 · 题库 {allQuestions.length} 题
            </p>
          </div>
          <button
            onClick={() => setShowReview(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 hover:border-[#2D8C6A] dark:hover:border-emerald-400 shrink-0"
          >
            错题复习
          </button>
        </div>

        {history.length > 0 && !finished && (
          <div className="card mb-6 text-sm text-[#6B7F96] dark:text-slate-400">
            最近测验：{history[0].score}/{history[0].total}（{new Date(history[0].date).toLocaleDateString("zh-CN")}）
          </div>
        )}

        {finished ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">{score >= 4 ? "🎉" : score >= 3 ? "👍" : "📚"}</div>
            <h2 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">测验完成！</h2>
            <p className="text-lg text-[#6B7F96] dark:text-slate-400 mb-6">
              得分：{score} / {QUIZ_SIZE}（{Math.round((score / QUIZ_SIZE) * 100)}%）
            </p>
            {wrongInRound.length > 0 && (
              <p className="text-sm text-[#854F0B] dark:text-amber-400 mb-4">
                本次错题 {wrongInRound.length} 道，可在「错题复习」中查看
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={handleRestart} className="btn-primary">重新测验</button>
              {wrongInRound.length > 0 && (
                <button onClick={() => setShowReview(true)} className="px-4 py-2 rounded-lg border border-[#C5D3E0] dark:border-slate-600 text-sm">
                  查看错题
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-[#8FA0B4] dark:text-slate-500">第 {currentQ + 1} / {QUIZ_SIZE} 题</span>
              <div className="flex-1 h-2 bg-[#E8ECF0] dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#2D8C6A] dark:bg-emerald-600 rounded-full transition-all" style={{ width: `${((currentQ + 1) / QUIZ_SIZE) * 100}%` }} />
              </div>
            </div>
            <div className="card">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full mb-3 inline-block ${catColors[q.category] || "bg-[#F5F8FC] dark:bg-slate-800 text-[#6B7F96] dark:text-slate-400"}`}>
                {q.category}
              </span>
              <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-6 font-serif">{q.question}</h2>
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      submitted && i === q.correct
                        ? "border-[#0F6E56] dark:border-emerald-400 bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300"
                        : submitted && i === selected && i !== q.correct
                          ? "border-[#9B2C2C] dark:border-red-400 bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300"
                          : selected === i
                            ? "border-[#2D8C6A] dark:border-emerald-500 bg-[#E8F5F0] dark:bg-slate-700 text-[#2D8C6A] dark:text-emerald-400"
                            : "border-[#C5D3E0] dark:border-slate-600 text-[#3D5166] dark:text-slate-300 hover:border-[#2D8C6A] dark:hover:border-emerald-400"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              {submitted && (
                <div className="bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE5EE] dark:border-slate-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#3D5166] dark:text-slate-300">{q.explanation}</p>
                </div>
              )}
              {!submitted ? (
                <button onClick={handleSubmit} disabled={selected === null} className="btn-primary disabled:opacity-50">提交答案</button>
              ) : (
                <button onClick={handleNext} className="btn-primary">{currentQ + 1 < QUIZ_SIZE ? "下一题" : "查看结果"}</button>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
