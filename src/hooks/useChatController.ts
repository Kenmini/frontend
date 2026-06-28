"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { sendChatMessage } from "@/services/chatService";
import type { ChatMessage, ChatResponse, Step } from "@/types/chat";

type Language = "ja" | "en";
const HISTORY_STORAGE_KEY = "chat_history";
const HISTORY_CHANGED_EVENT = "chat_history_changed";

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

  return parseHistoryItems(window.localStorage.getItem(HISTORY_STORAGE_KEY));
}

function parseHistoryItems(savedHistory: string | null) {
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

function getHistorySnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]";
}

function subscribeHistoryItems(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(HISTORY_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(HISTORY_CHANGED_EVENT, onStoreChange);
  };
}

function updateStoredHistoryItems(updater: (prev: string[]) => string[]) {
  const updatedHistory = updater(loadHistoryItems());
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  window.dispatchEvent(new Event(HISTORY_CHANGED_EVENT));
}

export function useChatController({ endpoint, lang, errorMessage }: UseChatControllerOptions) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({});
  const historySnapshot = useSyncExternalStore(subscribeHistoryItems, getHistorySnapshot, () => "[]");
  const historyItems = useMemo(() => parseHistoryItems(historySnapshot), [historySnapshot]);

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

      updateStoredHistoryItems((prev) => [textToSend, ...prev.filter((item) => item !== textToSend)].slice(0, 15));

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
    updateStoredHistoryItems((prev) => prev.filter((item) => item !== itemToDelete));
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
