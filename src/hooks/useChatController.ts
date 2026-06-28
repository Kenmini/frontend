"use client";

import { useCallback, useState } from "react";
import { sendChatMessage } from "@/services/chatService";
import type { ChatMessage, ChatResponse, Step } from "@/types/chat";

type Language = "ja" | "en";

interface UseChatControllerOptions {
  endpoint: string;
  lang: Language;
  errorMessage: string;
}

function pickLocalizedText(value: string | { ja: string; en: string }, lang: Language) {
  if (typeof value === "object") {
    return value[lang] || value.ja || value.en;
  }

  return value;
}

function createMessageId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

function loadHistoryItems() {
  if (typeof window === "undefined") return [];

  const savedHistory = localStorage.getItem("chat_history");
  if (!savedHistory) return [];

  try {
    const parsedHistory = JSON.parse(savedHistory);
    if (Array.isArray(parsedHistory)) {
      return parsedHistory.filter((item): item is string => typeof item === "string");
    }
  } catch (err) {
    console.error(err);
  }

  return [];
}

export function useChatController({ endpoint, lang, errorMessage }: UseChatControllerOptions) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({});
  const [historyItems, setHistoryItems] = useState<string[]>(loadHistoryItems);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setStepIndex({});
    setError(null);
    setInput("");
  }, []);

  const handleSend = useCallback(
    async (forcedText?: string) => {
      const textToSend = (forcedText ?? input).trim();
      if (!textToSend || loading) return;

      const userMessage: ChatMessage = {
        id: createMessageId("u"),
        role: "user",
        text: textToSend,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
      setError(null);

      setHistoryItems((prev) => {
        const updatedHistory = [textToSend, ...prev.filter((item) => item !== textToSend)].slice(0, 15);
        localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      try {
        const response: ChatResponse = await sendChatMessage(textToSend, endpoint);
        const aiMsgId = createMessageId("ai");
        const steps: Step[] = response.steps.map((step, idx) => ({
          ...step,
          id: step.id || `${aiMsgId}-step-${idx}`,
        }));

        const aiMessage: ChatMessage = {
          id: aiMsgId,
          role: "ai",
          text: pickLocalizedText(response.answer, lang),
          steps,
          warnings: response.warnings,
          slackContext: response.slackContext,
          nextStepHint: response.nextStepHint,
          citations: response.citations,
          confidence: response.confidence,
          visualData: response.visualData,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setStepIndex((prev) => ({ ...prev, [aiMsgId]: 0 }));
      } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : String(err);
        setError(`${errorMessage} (${detail})`);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, errorMessage, input, lang, loading]
  );

  const handleStepNavigation = useCallback((msgId: string, delta: number, totalSteps: number) => {
    setStepIndex((prev) => {
      const currentIdx = prev[msgId] ?? 0;
      const nextIdx = Math.max(0, Math.min(totalSteps - 1, currentIdx + delta));
      return { ...prev, [msgId]: nextIdx };
    });
  }, []);

  const deleteHistoryItem = useCallback((itemToDelete: string) => {
    setHistoryItems((prev) => {
      const updatedHistory = prev.filter((item) => item !== itemToDelete);
      localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  return {
    input,
    messages,
    loading,
    error,
    stepIndex,
    historyItems,
    setInput,
    clearError: () => setError(null),
    handleNewChat,
    handleSend,
    handleStepNavigation,
    deleteHistoryItem,
  };
}
