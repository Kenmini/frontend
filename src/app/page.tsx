"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatInputHandle } from "@/components/chat/ChatInput";
import { useChatController } from "@/hooks/useChatController";
import { FORCE_MOCK_MODE } from "@/services/chatService";
import logoImg from "@/assets/logo.png";
import { BootScreen } from "@/components/BootScreen";

const STRINGS = {
  ja: {
    title: "研究室AIガイド",
    subtitle: "装置トラブル診断アシスタント",
    placeholder: "装置の症状を入力…（例：レーザーが出ません）",
    send: "送信",
    newChat: "新規相談",
    history: "履歴",
    historyEmpty: "まだ相談はありません。",
    equipment: "研究室ガイド",
    cardView: "手順カード",
    emptyTitle: "どうされましたか？",
    empty: "装置の不具合や操作方法を質問してください。確認手順を画像付きで順番にご案内します。",
    emptyHint: "よくある質問",
    endpoint: "API エンドポイント URL",
    endpointHint: "空欄の場合はデモ用のサンプルデータで動作します。BackendのBase URL、またはPOST /askのURLを指定してください。",
    back: "戻る",
    next: "次へ",
    done: "完了",
    allDoneLabel: "すべての手順が完了しました",
    aiName: "AIガイド",
    thinking: "確認手順を作成中…",
    error: "回答の取得に失敗しました。エンドポイントを確認してください。",
    warningsLabel: "注意事項",
    slackLabel: "最新共有情報 (Slack)",
    nextStepLabel: "次の確認",
    confidenceLabel: "信頼度",
    relatedFigureLabel: "関連図",
    relatedItemLabel: "関連箇所",
    citationsLabel: "出典",
    mockBadge: "デモモード動作中",
    mockBadgeHint: "APIエンドポイントが未設定のため、デモデータで応答しています。",
    version: "バージョン",
    displayLabel: "表示項目",
    showConfidence: "信頼度を表示",
    showRelatedFigure: "関連図を表示"
  },
  en: {
    title: "Lab AI Guide",
    subtitle: "Equipment troubleshooting assistant",
    placeholder: "Describe the issue… (e.g. the laser will not turn on)",
    send: "Send",
    newChat: "New Chat",
    history: "History",
    historyEmpty: "No consultations yet.",
    equipment: "Lab Guide",
    cardView: "Step Card",
    emptyTitle: "How can I help?",
    empty: "Ask about an equipment fault or how to operate a device. I will walk you through the checks step by step, with images.",
    emptyHint: "Common questions",
    endpoint: "API Endpoint URL",
    endpointHint: "Leave blank to run on built-in sample data. Provide the backend base URL or the POST /ask URL.",
    back: "Back",
    next: "Next",
    done: "Done",
    allDoneLabel: "All steps complete",
    aiName: "AI Guide",
    thinking: "Preparing the steps…",
    error: "Failed to get a response. Please check the endpoint.",
    warningsLabel: "Warning Details",
    slackLabel: "Latest Shared Info (Slack)",
    nextStepLabel: "Next check",
    confidenceLabel: "Confidence",
    relatedFigureLabel: "Related figure",
    relatedItemLabel: "Related item",
    citationsLabel: "Citations",
    mockBadge: "Demo Mode Active",
    mockBadgeHint: "Using built-in demo scenarios because no API endpoint is set.",
    version: "Version",
    displayLabel: "Display options",
    showConfidence: "Show confidence",
    showRelatedFigure: "Show related figure"
  }
};

const APP_VERSION = process.env.appVersion ?? "0.0.0";

const EQUIP_SUGGESTIONS = {
  ja: ["透過電子顕微鏡", "研究室の場所"],
  en: ["Transmission electron microscope", "Lab location"]
};

const CHAT_SUGGESTIONS = {
  ja: [
    "研究室の場所はどこですか？",
    "非点補正の手順を教えてください",
    "試料ホルダーの安全な取り出し方を教えてください",
    "対物レンズの非点収差を補正する方法を教えてください"
  ],
  en: [
    "Where is the lab located?",
    "How do I apply the high voltage and perform flashing?",
    "How do I safely remove the sample holder?",
    "How do I correct objective lens astigmatism?"
  ]
};

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function getInitialLang(): "ja" | "en" {
  if (typeof window === "undefined") return "ja";

  const savedLang = localStorage.getItem("lang");
  return savedLang === "en" ? "en" : "ja";
}

function getInitialDark() {
  if (typeof window === "undefined") return false;

  const savedTheme = localStorage.getItem("theme");
  return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialEndpoint() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("api_endpoint") || "";
}

function getInitialShowConfidence() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("show_confidence") === "true";
}

function getInitialShowRelatedFigure() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("show_related_figure") === "true";
}

export default function Page() {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [lang, setLang] = useState<"ja" | "en">(getInitialLang);
  const [dark, setDark] = useState<boolean>(getInitialDark);
  const [endpoint, setEndpoint] = useState<string>(getInitialEndpoint);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfidence, setShowConfidence] = useState<boolean>(getInitialShowConfidence);
  const [showRelatedFigure, setShowRelatedFigure] = useState<boolean>(getInitialShowRelatedFigure);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [historyMenu, setHistoryMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [booting, setBooting] = useState<boolean>(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const t = STRINGS[lang];
  const {
    input,
    messages,
    loading,
    error,
    stepIndex,
    historyItems,
    setInput,
    clearError,
    handleNewChat,
    handleSend,
    selectConversation,
    handleStepNavigation,
    deleteConversation,
  } = useChatController({
    endpoint,
    lang,
    errorMessage: t.error,
  });


  // Keep the root theme attribute in sync with the current UI setting.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  // Keep the html lang attribute in sync with the current language.
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  // Bypass boot screen in test automation environments to avoid delaying test suites.
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) {
      const timerId = window.setTimeout(() => setBooting(false), 0);
      return () => window.clearTimeout(timerId);
    }
  }, []);

  // Update theme helper
  const handleToggleDark = () => {
    const nextDark = !dark;
    setDark(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", nextDark ? "dark" : "light");
  };

  // Update language helper
  const handleToggleLang = () => {
    const nextLang = lang === "ja" ? "en" : "ja";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
  };

  // Save Endpoint helper
  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndpoint(val);
    localStorage.setItem("api_endpoint", val);
  };

  const handleToggleShowConfidence = () => {
    const next = !showConfidence;
    setShowConfidence(next);
    localStorage.setItem("show_confidence", String(next));
  };

  const handleToggleShowRelatedFigure = () => {
    const next = !showRelatedFigure;
    setShowRelatedFigure(next);
    localStorage.setItem("show_related_figure", String(next));
  };

  // Auto-scroll when loading state changes or messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, error]);

  useEffect(() => {
    if (!historyMenu) return;

    const closeMenu = () => setHistoryMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenu);
    };
  }, [historyMenu]);
  // Return static boot screen during SSR/hydration phase to prevent flash issues and hydration mismatch.
  if (!mounted) {
    return <BootScreen isStatic={true} lang="ja" dark={false} onComplete={() => {}} />;
  }

  // Show the interactive boot screen when mounted but booting state is active.
  if (booting) {
    return <BootScreen isStatic={false} lang={lang} dark={dark} onComplete={() => setBooting(false)} />;
  }

  return (
    <div
      style={{
        height: "100dvh",
        minHeight: "100svh",
        maxHeight: "100dvh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-ibm-plex-sans-jp), sans-serif",
      }}
    >
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 90,
            display: "block",
          }}
          className="mobile-overlay"
        />
      )}

      {historyMenu && (
        <div
          style={{
            position: "fixed",
            top: historyMenu.y,
            left: historyMenu.x,
            zIndex: 200,
            minWidth: "132px",
            padding: "5px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            backgroundColor: "var(--surface)",
            boxShadow: "var(--shadow)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => {
              deleteConversation(historyMenu.id);
              setHistoryMenu(null);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              padding: "8px 9px",
              borderRadius: "6px",
              fontSize: "12.5px",
              textAlign: "left",
            }}
            className="sidebar-item-hover"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
            {lang === "ja" ? "削除" : "Delete"}
          </button>
        </div>
      )}

      {/* Sidebar Component */}
      <aside
        style={{
          width: "266px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--sidebar)",
          borderRight: "1px solid var(--border)",
          transition: "transform 0.3s ease",
        }}
        className={`sidebar-nav ${sidebarOpen ? "open" : ""}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "16px 16px 14px",
          }}
        >
                  <Image
            src={logoImg}
            alt="Logo"
            width={34}
            height={34}
            style={{
              borderRadius: "9px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-.01em",
                lineHeight: 1.2,
              }}
            >
              {t.title}
            </div>
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--muted)",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: "0 12px 12px" }}>
          <button
            onClick={() => {
              handleNewChat();
              setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              padding: "11px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 600,
              transition: "border-color 0.2s, color 0.2s",
            }}
            className="sidebar-btn-hover"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t.newChat}
          </button>
        </div>

        {/* Scrollable lists */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Conversation History */}
          <div>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: "var(--muted)",
                letterSpacing: ".07em",
                textTransform: "uppercase",
                padding: "4px 8px 8px",
              }}
            >
              {t.history}
            </div>
            {historyItems.length === 0 ? (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  padding: "2px 8px",
                  lineHeight: 1.5,
                }}
              >
                {t.historyEmpty}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setHistoryMenu({ id: item.id, x: event.clientX, y: event.clientY });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      transition: "background-color 0.2s",
                    }}
                    className="sidebar-item-hover"
                  >
                    <button
                      onClick={() => {
                        selectConversation(item.id);
                        setSidebarOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                        minWidth: 0,
                        textAlign: "left",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "var(--text)",
                        cursor: "pointer",
                        padding: "8px 0 8px 8px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        lineHeight: 1.3,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Directory */}
          <div>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: "var(--muted)",
                letterSpacing: ".07em",
                textTransform: "uppercase",
                padding: "4px 8px 8px",
              }}
            >
              {t.equipment}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {EQUIP_SUGGESTIONS[lang].map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(name + (lang === "ja" ? "の" : " "));
                    setSidebarOpen(false);
                    chatInputRef.current?.focus();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    transition: "background-color 0.2s",
                  }}
                  className="sidebar-item-hover"
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                      flexShrink: 0,
                    }}
                  />
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "12px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            onClick={handleToggleLang}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              height: "34px",
              borderRadius: "8px",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: ".03em",
            }}
            className="sidebar-item-hover"
          >
            {lang === "ja" ? "EN" : "日本語"}
          </button>
          <button
            onClick={handleToggleDark}
            title="Theme Toggle"
            style={{
              width: "34px",
              height: "34px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="sidebar-item-hover"
          >
            {dark ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            style={{
              width: "34px",
              height: "34px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="sidebar-item-hover"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main chat window container */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg)",
          position: "relative",
        }}
      >
        {/* App Bar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 20px",
            height: "58px",
            flexShrink: 0,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          {/* Hamburger Menu on Mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text)",
              marginRight: "4px",
            }}
            className="hamburger-menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span
            style={{
              fontSize: "14.5px",
              fontWeight: 600,
              letterSpacing: "-.01em",
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {messages.length > 0
              ? messages.find((m) => m.role === "user")?.text
              : t.newChat}
          </span>

          {/* Mode indicators / warning badge */}
          {(!endpoint.trim() || FORCE_MOCK_MODE) && (
            <div
              title={t.mockBadgeHint}
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--border)",
                padding: "3px 8px",
                borderRadius: "12px",
                fontWeight: 500,
              }}
            >
              ⚡ {t.mockBadge}
            </div>
          )}
        </div>

        {/* Settings Area */}
        {showSettings && (
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--surface2)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              animation: "mediaFade .2s ease both",
            }}
          >
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {t.endpoint}
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={handleEndpointChange}
              placeholder="https://your-api.com/chat"
              style={{
                height: "38px",
                maxWidth: "520px",
                width: "100%",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "12.5px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              className="input-focus-primary"
            />
            <span
              style={{
                fontSize: "11.5px",
                color: "var(--muted)",
                lineHeight: 1.4,
                maxWidth: "560px",
              }}
            >
              {t.endpointHint}
            </span>
            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                {t.displayLabel}
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "var(--text)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={showConfidence}
                  onChange={handleToggleShowConfidence}
                  style={{ cursor: "pointer" }}
                />
                {t.showConfidence}
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "var(--text)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={showRelatedFigure}
                  onChange={handleToggleShowRelatedFigure}
                  style={{ cursor: "pointer" }}
                />
                {t.showRelatedFigure}
              </label>
            </div>
            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11.5px",
                color: "var(--muted)",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
              }}
            >
              <span style={{ fontWeight: 600 }}>{t.version}</span>
              <span>v{APP_VERSION}</span>
            </div>
          </div>
        )}

        <ChatHistory
          messages={messages}
          loading={loading}
          error={error}
          suggestions={CHAT_SUGGESTIONS[lang]}
          stepIndex={stepIndex}
          dark={dark}
          lang={lang}
          showConfidence={showConfidence}
          showRelatedFigure={showRelatedFigure}
          labels={{
            emptyTitle: t.emptyTitle,
            empty: t.empty,
            emptyHint: t.emptyHint,
            aiName: t.aiName,
            thinking: t.thinking,
            warnings: t.warningsLabel,
            slack: t.slackLabel,
            nextStep: t.nextStepLabel,
            confidence: t.confidenceLabel,
            relatedFigure: t.relatedFigureLabel,
            relatedItem: t.relatedItemLabel,
            citations: t.citationsLabel,
            back: t.back,
            next: t.next,
            done: t.done,
            allDone: t.allDoneLabel,
          }}
          scrollRef={scrollRef}
          onSuggestionClick={(suggestion) => handleSend(suggestion)}
          onStepNavigation={handleStepNavigation}
          onClearError={clearError}
        />

        <ChatInput
          ref={chatInputRef}
          value={input}
          loading={loading}
          placeholder={t.placeholder}
          sendLabel={t.send}
          onChange={setInput}
          onSubmit={() => handleSend()}
        />
      </main>
    </div>
  );
}
