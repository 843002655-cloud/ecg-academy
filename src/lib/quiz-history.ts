import storage from "@/lib/storage";

export interface QuizHistoryEntry {
  id: string;
  date: string;
  score: number;
  total: number;
  wrongQuestions: Array<{
    id: string;
    question: string;
    explanation: string;
    category: string;
  }>;
}

const KEY = "ecg_quiz_history";
const MAX_ENTRIES = 20;

export function loadQuizHistory(): QuizHistoryEntry[] {
  return storage.getJSON<QuizHistoryEntry[]>(KEY) || [];
}

export function saveQuizResult(entry: Omit<QuizHistoryEntry, "id" | "date">): QuizHistoryEntry {
  const record: QuizHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  const history = [record, ...loadQuizHistory()].slice(0, MAX_ENTRIES);
  storage.setJSON(KEY, history);
  return record;
}

export function getWrongQuestionsFromHistory(): QuizHistoryEntry["wrongQuestions"] {
  const seen = new Set<string>();
  const wrong: QuizHistoryEntry["wrongQuestions"] = [];
  for (const entry of loadQuizHistory()) {
    for (const q of entry.wrongQuestions) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        wrong.push(q);
      }
    }
  }
  return wrong;
}
