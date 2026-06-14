"use client";

import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { chatService } from "@/lib/services";
import Markdown from "@/components/Markdown";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

interface Message { role: "user" | "assistant"; content: string; }

const DEFAULT_CASE = {
  title: "自由问答",
  category: "正常心电图",
  difficulty: "进阶",
  description: "心电学堂 AI 导师——随时随地为你的心电图判读答疑解惑",
  ecg_findings: [] as string[],
  question: "你今天想学习或讨论什么心电图问题？",
  hint: "你可以上传心电图图片描述，或直接提问心电图判读、鉴别诊断、临床决策相关问题",
  key_points: [] as string[],
  is_published: true,
};

export default function AIConsultPage() {
  usePageTitle("AI 问心");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try { const saved = sessionStorage.getItem("ecg_consult_chat"); return saved ? JSON.parse(saved) : []; } catch { return []; }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `👋 欢迎使用**心电学堂 AI 问心**！\n\n我是你的心电图判读导师。你可以：\n\n- 📈 提交一份心电图的文字描述，我来带你判读\n- 🩺 提出临床心电图相关的问题\n- 📚 请求讲解某个心电图概念（如"什么是 Brugada 综合征的心电图特征？"）\n- 🎯 让我给你出一道心电图判读题练手\n\n今天你想学习什么？`,
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setSending(true);
    setStreamingText(null);

    try {
      const ctx = {
        ...DEFAULT_CASE,
        contentJson: undefined as Record<string, unknown> | undefined,
      };
      const apiMsgs = [...messages, userMsg].slice(-20);
      let fullText = "";
      await chatService.sendMessageStream(
        apiMsgs.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
        ctx,
        "free-chat",
        (chunk: string) => {
          fullText += chunk;
          setStreamingText(fullText);
        }
      );
      const display = fullText;
      setMessages((p) => [...p, { role: "assistant", content: display }]);
      setStreamingText(null);
    } catch (err: unknown) {
      setMessages((p) => [...p, { role: "assistant", content: "抱歉：" + ((err as Error).message || "AI 暂不可用") }]);
    } finally {
      setSending(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setStreamingText(null);
    if (typeof window !== "undefined") try { sessionStorage.removeItem("ecg_consult_chat"); } catch {}
  };

  const handleChatScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  };

  useEffect(() => {
    if (isAtBottomRef.current && chatRef.current) {
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
    }
  }, [messages, streamingText]);

  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      try { sessionStorage.setItem("ecg_consult_chat", JSON.stringify(messages)); } catch {}
    }
  }, [messages]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">🤖 AI 问心</h1>
          <p className="text-[#6B7F96] dark:text-slate-400 text-sm">心电学堂 AI 导师 — 随时随地为你的心电图判读答疑解惑</p>
        </div>

        <div className="card">
          <div ref={chatRef} onScroll={handleChatScroll} className="h-[450px] sm:h-[500px] overflow-y-auto mb-4 space-y-3 pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#1B4F8A] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">📈</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1B4F8A] dark:bg-blue-600 text-white rounded-br-md"
                    : "bg-[#F5F8FC] dark:bg-slate-800 text-[#3D5166] dark:text-slate-300 rounded-bl-md border border-[#DDE5EE] dark:border-slate-700"
                }`}>
                  <Markdown text={msg.content} />
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#E8ECF0] dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-[#6B7F96] dark:text-slate-400">👤</div>
                )}
              </div>
            ))}
            {streamingText !== null && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#1B4F8A] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">📈</div>
                <div className="bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE5EE] dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed text-[#3D5166] dark:text-slate-300 max-w-[80%]">
                  <Markdown text={streamingText} />
                  <span className="inline-block w-1.5 h-4 bg-[#1B4F8A] dark:bg-blue-400 ml-0.5 animate-pulse align-middle" />
                </div>
              </div>
            )}
            {sending && streamingText === null && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#1B4F8A] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">📈</div>
                <div className="bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE5EE] dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8FA0B4] dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#8FA0B4] dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#8FA0B4] dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !isComposing) { e.preventDefault(); handleSend(); } }}
              placeholder="输入你的心电图问题...（Enter 发送，Shift+Enter 换行）"
              rows={3} disabled={sending}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100 placeholder-[#8FA0B4] dark:placeholder-slate-500 focus:outline-none focus:border-[#1B4F8A] dark:focus:border-blue-400 resize-none"
            />
            <button onClick={handleSend} disabled={sending || !input.trim()} className="self-end px-5 py-2 bg-[#1B4F8A] dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-[#154070] dark:hover:bg-blue-500 transition-colors disabled:opacity-50 text-sm">
              发送
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleRestart} disabled={sending} className="text-xs px-3 py-1.5 bg-[#F5F8FC] dark:bg-slate-800 text-[#6B7F96] dark:text-slate-400 rounded-full hover:bg-[#E8ECF0] dark:hover:bg-slate-700 transition-colors disabled:opacity-40">🔄 新对话</button>
            <span className="text-xs text-[#8FA0B4] dark:text-slate-500 ml-auto">AI 答案仅供参考，不构成临床决策建议</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
