import { supabaseAdmin } from "@/lib/supabase-server";
import FALLBACK_QUESTIONS from "@/lib/quiz-data";

export const QUIZ_PRODUCT = "ecg-academy";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find the table") ||
    lower.includes("schema cache")
  );
}

export function mapQuizRow(row: Record<string, unknown>): QuizQuestion {
  const options = row.options;
  return {
    id: String(row.id),
    question: String(row.question ?? ""),
    options: Array.isArray(options) ? options.map(String) : [],
    correct: Number(row.correct ?? 0),
    explanation: String(row.explanation ?? ""),
    category: String(row.category ?? ""),
  };
}

export async function fetchQuizQuestions(): Promise<{
  questions: QuizQuestion[];
  source: "database" | "fallback";
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .select("*")
      .eq("product", QUIZ_PRODUCT)
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingTableError(error.message)) {
        return { questions: FALLBACK_QUESTIONS, source: "fallback" };
      }
      console.error("fetchQuizQuestions:", error.message);
      return { questions: FALLBACK_QUESTIONS, source: "fallback" };
    }

    if (!data?.length) {
      return { questions: FALLBACK_QUESTIONS, source: "fallback" };
    }

    return { questions: data.map(mapQuizRow), source: "database" };
  } catch (err) {
    console.error("fetchQuizQuestions:", err);
    return { questions: FALLBACK_QUESTIONS, source: "fallback" };
  }
}

export function quizTableUnavailableError(): string {
  return "quiz_questions 表未创建，请先执行 scripts/supabase-api-tables.sql";
}
