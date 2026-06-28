"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { sendChatMessage } from "@/services/chatService";
import type { ChatMessage, ChatResponse, Step } from "@/types/chat";

type Language = "ja" | "en";
const HISTORY_STORAGE_KEY = "chat_history";
const HISTORY_CHANGED_EVENT = "chat_history_changed";
const MAX_CONVERSATIONS = 15;

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  stepIndex: Record<string, number>;
  updatedAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
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

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];

  return parseConversations(window.localStorage.getItem(HISTORY_STORAGE_KEY));
}

function parseConversations(saved: string | null): Conversation[] {
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): Conversation | null => {
        // Legacy format: plain query string
        if (typeof item === "string") {
          return {
            id: createId("conv"),
            title: item,
            messages: [{ id: createId("u"), role: "user", text: item }],
            stepIndex: {},
            updatedAt: 0,
          };
        }
        if (!item || typeof item !== "object") return null;

        // Conversation format (new)
        if (
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          Array.isArray(item.messages)
        ) {
          return {
            id: item.id,
            title: item.title,
            messages: item.messages as ChatMessage[],
            stepIndex:
              item.stepIndex && typeof item.stepIndex === "object"
                ? (item.stepIndex as Record<string, number>)
                : {},
            updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : 0,
          };
        }

        // Legacy format: { query, aiMessage? }
        if (typeof item.query === "string") {
          const userMsg: ChatMessage = {
            id: createId("u"),
            role: "user",
            text: item.query,
          };
          const messages: ChatMessage[] = [userMsg];
          if (item.aiMessage && typeof item.aiMessage === "object") {
            messages.push(item.aiMessage as ChatMessage);
          }
          return {
            id: createId("conv"),
            title: item.query,
            messages,
            stepIndex: {},
            updatedAt: 0,
          };
        }

        return null;
      })
      .filter((c): c is Conversation => c !== null);
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

function updateStoredConversations(updater: (prev: Conversation[]) => Conversation[]) {
  const updated = updater(loadConversations());
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(HISTORY_CHANGED_EVENT));
}

export function useChatController({ endpoint, lang, errorMessage }: UseChatControllerOptions) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const historySnapshot = useSyncExternalStore(subscribeHistoryItems, getHistorySnapshot, () => "[]");
  const conversations = useMemo(() => parseConversations(historySnapshot), [historySnapshot]);
  const historyItems = useMemo<HistoryItem[]>(
    () => conversations.map((c) => ({ id: c.id, title: c.title })),
    [conversations],
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setStepIndex({});
    setError(null);
    setInput("");
    setCurrentConversationId(null);
  }, []);

  const handleSend = useCallback(
    async (forcedText?: string) => {
      const textToSend = (forcedText ?? input).trim();
      if (!textToSend || loading) return;

      const userMessage: ChatMessage = {
        id: createId("u"),
        role: "user",
        text: textToSend,
      };

      const targetId = currentConversationId ?? createId("conv");
      if (!currentConversationId) {
        setCurrentConversationId(targetId);
      }

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const response: ChatResponse = await sendChatMessage(textToSend, endpoint, { lang });
        const aiMsgId = createId("ai");
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

        updateStoredConversations((prev) => {
          const existing = prev.find((c) => c.id === targetId);
          const others = prev.filter((c) => c.id !== targetId);
          const baseMessages = existing?.messages ?? [];
          const updated: Conversation = {
            id: targetId,
            title: existing?.title ?? textToSend,
            messages: [...baseMessages, userMessage, aiMessage],
            stepIndex: { ...(existing?.stepIndex ?? {}), [aiMsgId]: 0 },
            updatedAt: Date.now(),
          };
          return [updated, ...others].slice(0, MAX_CONVERSATIONS);
        });
      } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : String(err);
        setError(`${errorMessage} (${detail})`);
      } finally {
        setLoading(false);
      }
    },
    [currentConversationId, endpoint, errorMessage, input, lang, loading],
  );

  const selectConversation = useCallback((id: string) => {
    const conv = loadConversations().find((c) => c.id === id);
    if (!conv) return;

    setMessages(conv.messages);
    setStepIndex(conv.stepIndex);
    setCurrentConversationId(id);
    setError(null);
    setInput("");
  }, []);

  const handleStepNavigation = useCallback(
    (msgId: string, delta: number, totalSteps: number) => {
      setStepIndex((prev) => {
        const currentIdx = prev[msgId] ?? 0;
        const nextIdx = Math.max(0, Math.min(totalSteps - 1, currentIdx + delta));
        const next = { ...prev, [msgId]: nextIdx };

        if (currentConversationId) {
          updateStoredConversations((stored) =>
            stored.map((conv) =>
              conv.id === currentConversationId
                ? { ...conv, stepIndex: next, updatedAt: Date.now() }
                : conv,
            ),
          );
        }

        return next;
      });
    },
    [currentConversationId],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      updateStoredConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (currentConversationId === id) {
        setMessages([]);
        setStepIndex({});
        setCurrentConversationId(null);
      }
    },
    [currentConversationId],
  );

  return {
    input,
    messages,
    loading,
    error,
    stepIndex,
    historyItems,
    currentConversationId,
    setInput,
    clearError: () => setError(null),
    handleNewChat,
    handleSend,
    selectConversation,
    handleStepNavigation,
    deleteConversation,
  };
}
