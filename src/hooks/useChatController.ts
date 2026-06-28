"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { sendChatMessage } from "@/services/chatService";
import type { ChatMessage, ChatResponse, Step } from "@/types/chat";

type Language = "ja" | "en";
const HISTORY_STORAGE_KEY = "chat_history";
const HISTORY_CHANGED_EVENT = "chat_history_changed";
const MAX_HISTORY_ENTRIES = 15;

interface HistoryEntry {
  query: string;
  aiMessage?: ChatMessage;
}

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

function loadHistoryEntries(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  return parseHistoryEntries(window.localStorage.getItem(HISTORY_STORAGE_KEY));
}

function parseHistoryEntries(savedHistory: string | null): HistoryEntry[] {
  if (!savedHistory) return [];
  try {
    const parsed = JSON.parse(savedHistory);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): HistoryEntry | null => {
        if (typeof item === "string") {
          return { query: item };
        }
        if (item && typeof item === "object" && typeof item.query === "string") {
          return {
            query: item.query,
            aiMessage:
              item.aiMessage && typeof item.aiMessage === "object"
                ? (item.aiMessage as ChatMessage)
                : undefined,
          };
        }
        return null;
      })
      .filter((entry): entry is HistoryEntry => entry !== null);
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

function updateStoredHistoryEntries(updater: (prev: HistoryEntry[]) => HistoryEntry[]) {
  const updated = updater(loadHistoryEntries());
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(HISTORY_CHANGED_EVENT));
}

export function useChatController({ endpoint, lang, errorMessage }: UseChatControllerOptions) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({});
  const historySnapshot = useSyncExternalStore(subscribeHistoryItems, getHistorySnapshot, () => "[]");
  const historyEntries = useMemo(() => parseHistoryEntries(historySnapshot), [historySnapshot]);
  const historyItems = useMemo(() => historyEntries.map((entry) => entry.query), [historyEntries]);

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

      updateStoredHistoryEntries((prev) =>
        [{ query: textToSend }, ...prev.filter((entry) => entry.query !== textToSend)].slice(
          0,
          MAX_HISTORY_ENTRIES,
        ),
      );

      try {
        const response: ChatResponse = await sendChatMessage(textToSend, endpoint, { lang });
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

        updateStoredHistoryEntries((prev) =>
          prev.map((entry) =>
            entry.query === textToSend ? { ...entry, aiMessage } : entry,
          ),
        );
      } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : String(err);
        setError(`${errorMessage} (${detail})`);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, errorMessage, input, lang, loading]
  );

  const selectHistoryItem = useCallback(
    (query: string) => {
      const cached = loadHistoryEntries().find((entry) => entry.query === query);

      if (!cached?.aiMessage) {
        handleSend(query);
        return;
      }

      const userMessage: ChatMessage = {
        id: createMessageId("u"),
        role: "user",
        text: query,
      };

      const aiMessage = { ...cached.aiMessage, id: createMessageId("ai") };

      setMessages([userMessage, aiMessage]);
      setStepIndex({ [aiMessage.id]: 0 });
      setError(null);
      setInput("");
    },
    [handleSend],
  );

  const handleStepNavigation = useCallback((msgId: string, delta: number, totalSteps: number) => {
    setStepIndex((prev) => {
      const currentIdx = prev[msgId] ?? 0;
      const nextIdx = Math.max(0, Math.min(totalSteps - 1, currentIdx + delta));
      return { ...prev, [msgId]: nextIdx };
    });
  }, []);

  const deleteHistoryItem = useCallback((itemToDelete: string) => {
    updateStoredHistoryEntries((prev) => prev.filter((entry) => entry.query !== itemToDelete));
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
    selectHistoryItem,
    handleStepNavigation,
    deleteHistoryItem,
  };
}
