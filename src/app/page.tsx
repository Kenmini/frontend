"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { DeviceDiagram } from "@/components/DeviceDiagram";
import {
  sendChatMessage,
  ChatResponse,
  Step,
  Annotation,
  FORCE_MOCK_MODE,
} from "@/services/chatService";
import logoImg from "@/assets/logo.png";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  steps?: Step[];
  warnings?: string[] | string;
  slackContext?: string;
}

const STRINGS = {
  ja: {
    title: "研究室AIガイド",
    subtitle: "装置トラブル診断アシスタント",
    placeholder: "装置の症状を入力…（例：レーザーが出ません）",
    send: "送信",
    newChat: "新規相談",
    history: "履歴",
    historyEmpty: "まだ相談はありません。",
    equipment: "装置から探す",
    cardView: "手順カード",
    emptyTitle: "どうされましたか？",
    empty: "装置の不具合や操作方法を質問してください。確認手順を画像付きで順番にご案内します。",
    emptyHint: "よくある質問",
    endpoint: "API エンドポイント URL",
    endpointHint: "空欄の場合はデモ用のサンプルデータで動作します。POST { message } → { answer, steps[] } を返す URL を指定してください。",
    back: "戻る",
    next: "次へ",
    done: "完了",
    allDoneLabel: "すべての手順が完了しました",
    aiName: "AIガイド",
    thinking: "確認手順を作成中…",
    error: "回答の取得に失敗しました。エンドポイントを確認してください。",
    warningsLabel: "注意事項",
    slackLabel: "最新共有情報 (Slack)",
    mockBadge: "デモモード動作中",
    mockBadgeHint: "APIエンドポイントが未設定のため、デモデータで応答しています。"
  },
  en: {
    title: "Lab AI Guide",
    subtitle: "Equipment troubleshooting assistant",
    placeholder: "Describe the issue… (e.g. the laser will not turn on)",
    send: "Send",
    newChat: "New Chat",
    history: "History",
    historyEmpty: "No consultations yet.",
    equipment: "Browse by device",
    cardView: "Step Card",
    emptyTitle: "How can I help?",
    empty: "Ask about an equipment fault or how to operate a device. I will walk you through the checks step by step, with images.",
    emptyHint: "Common questions",
    endpoint: "API Endpoint URL",
    endpointHint: "Leave blank to run on built-in sample data. Provide a URL that accepts POST { message } and returns { answer, steps[] }.",
    back: "Back",
    next: "Next",
    done: "Done",
    allDoneLabel: "All steps complete",
    aiName: "AI Guide",
    thinking: "Preparing the steps…",
    error: "Failed to get a response. Please check the endpoint.",
    warningsLabel: "Warning Details",
    slackLabel: "Latest Shared Info (Slack)",
    mockBadge: "Demo Mode Active",
    mockBadgeHint: "Using built-in demo scenarios because no API endpoint is set."
  }
};

const EQUIP_SUGGESTIONS = {
  ja: ["共焦点顕微鏡", "レーザー発振器", "分光光度計", "遠心分離機"],
  en: ["Confocal microscope", "Laser source", "Spectrophotometer", "Centrifuge"]
};

const CHAT_SUGGESTIONS = {
  ja: ["レーザーが出ません", "電源が入らない", "ピントが合わない"],
  en: ["The laser will not emit", "It will not power on", "Can't get it in focus"]
};

export default function Page() {
  const [lang, setLang] = useState<"ja" | "en">("ja");
  const [dark, setDark] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = STRINGS[lang];

  // Set initial settings on mount
  useEffect(() => {
    setMounted(true);
    // Theme
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    // Endpoint
    const savedEndpoint = localStorage.getItem("api_endpoint") || "";
    setEndpoint(savedEndpoint);

    // Lang
    const savedLang = localStorage.getItem("lang") as "ja" | "en";
    if (savedLang) setLang(savedLang);

    // Load Chat History list
    const savedHistory = localStorage.getItem("chat_history");
    if (savedHistory) {
      try {
        setHistoryItems(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
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

  // Auto-scroll when loading state changes or messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, error]);

  // Adjust input textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Reset chat logic
  const handleNewChat = () => {
    setMessages([]);
    setStepIndex({});
    setError(null);
    setInput("");
    setSidebarOpen(false);
  };

  // Send message logic
  const handleSend = async (forcedText?: string) => {
    const textToSend = (forcedText ?? input).trim();
    if (!textToSend || loading) return;

    // Build user message
    const userMsgId = `u-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    setError(null);

    // Save to history list
    const updatedHistory = [textToSend, ...historyItems.filter((item) => item !== textToSend)].slice(0, 15);
    setHistoryItems(updatedHistory);
    localStorage.setItem("chat_history", JSON.stringify(updatedHistory));

    try {
      const response: ChatResponse = await sendChatMessage(textToSend, endpoint);

      // Utility function to extract local string or default translation
      const pickText = (val: string | { ja: string; en: string }) => {
        if (typeof val === "object") {
          return val[lang] || val.ja || val.en;
        }
        return val;
      };

      const aiMsgId = `ai-${Date.now()}`;
      const steps: Step[] = response.steps.map((s, idx) => ({
        ...s,
        id: s.id || `${aiMsgId}-step-${idx}`,
      }));

      const aiMessage: Message = {
        id: aiMsgId,
        role: "ai",
        text: pickText(response.answer),
        steps,
        warnings: response.warnings,
        slackContext: response.slackContext,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setStepIndex((prev) => ({ ...prev, [aiMsgId]: 0 }));
    } catch (err: any) {
      setError(`${t.error} (${err.message || err})`);
    } finally {
      setLoading(false);
    }
  };

  // Card steps navigation helper
  const handleStepNavigation = (msgId: string, delta: number, totalSteps: number) => {
    setStepIndex((prev) => {
      const currentIdx = prev[msgId] ?? 0;
      const nextIdx = Math.max(0, Math.min(totalSteps - 1, currentIdx + delta));
      return { ...prev, [msgId]: nextIdx };
    });
  };

  // Draw overlay annotation indicators
  const renderAnnotation = (annotation?: Annotation, key?: string) => {
    if (!annotation) return null;

    const red = "var(--annot)";
    const left = `${annotation.x / 6}%`;
    const top = `${annotation.y / 4}%`;
    const width = `${annotation.width / 6}%`;
    const height = `${annotation.height / 4}%`;

    let element;
    if (annotation.type === "highlight") {
      element = (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: `2.5px solid ${red}`,
            borderRadius: "8px",
            background: "rgba(232, 68, 59, 0.14)",
            boxShadow: "0 0 0 4px rgba(232, 68, 59, 0.08)",
          }}
        />
      );
    } else if (annotation.type === "arrow") {
      const cx = annotation.x + annotation.width / 2;
      const cy = annotation.y + annotation.height / 2;
      const sx = Math.max(20, cx - 150);
      const sy = Math.max(16, cy - 120);

      element = (
        <svg
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
          }}
        >
          <defs>
            <marker
              id={`ah-${key}`}
              viewBox="0 0 10 10"
              refX={7}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={red} />
            </marker>
          </defs>
          <line
            x1={sx}
            y1={sy}
            x2={cx}
            y2={cy}
            stroke="#fff"
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.7}
          />
          <line
            x1={sx}
            y1={sy}
            x2={cx}
            y2={cy}
            stroke={red}
            strokeWidth={5.5}
            strokeLinecap="round"
            markerEnd={`url(#ah-${key})`}
          />
          <circle cx={cx} cy={cy} r={6} fill={red} />
        </svg>
      );
    } else {
      // Default: circle
      element = (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: `3.5px solid ${red}`,
            borderRadius: "50%",
            boxShadow: "0 0 0 3px rgba(232, 68, 59, 0.16)",
          }}
        />
      );
    }

    return (
      <div
        key={key}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          animation: "annotFade .45s ease both",
        }}
      >
        {element}
      </div>
    );
  };

  // Helper translations for step item fields
  const getLocalizedField = (val: string | { ja: string; en: string }) => {
    if (typeof val === "object") {
      return val[lang] || val.ja || val.en;
    }
    return val;
  };

  // Return empty states before mounting to avoid SSR flash issues
  if (!mounted) return null;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
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
            onClick={handleNewChat}
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
                {historyItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSend(item);
                      setSidebarOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "var(--text)",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      lineHeight: 1.3,
                      transition: "background-color 0.2s",
                    }}
                    className="sidebar-item-hover"
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
                      {item}
                    </span>
                  </button>
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
                    if (textareaRef.current) textareaRef.current.focus();
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
          </div>
        )}

        {/* Message Panel Scroll Container */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              padding: "26px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              minHeight: "100%",
            }}
          >
            {/* Empty State Welcome Screen */}
            {messages.length === 0 && !loading && (
              <div
                style={{
                  margin: "auto 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "18px",
                  padding: "18px 6px",
                }}
              >
                <div
                  style={{
                    width: "62px",
                    height: "62px",
                    borderRadius: "16px",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 2h8" />
                    <path d="M9 2v6.5L5 17a3 3 0 0 0 2.7 4.3h8.6A3 3 0 0 0 19 17l-4-8.5V2" />
                    <path d="M7 14h10" />
                  </svg>
                </div>
                <div style={{ maxWidth: "400px" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      letterSpacing: "-.01em",
                    }}
                  >
                    {t.emptyTitle}
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      color: "var(--muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    {t.empty}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}
                >
                  {t.emptyHint}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                    maxWidth: "460px",
                  }}
                >
                  {CHAT_SUGGESTIONS[lang].map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      style={{
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                        cursor: "pointer",
                        padding: "9px 15px",
                        borderRadius: "22px",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        transition: "border-color 0.2s, color 0.2s",
                      }}
                      className="suggestion-chip"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List Chat Bubble Messages */}
            {messages.map((m) => {
              const isUser = m.role === "user";
              const steps = m.steps || [];
              const hasSteps = steps.length > 0;
              const currentStepIdx = stepIndex[m.id] ?? 0;
              const currentStep = steps[currentStepIdx];
              const isFirstStep = currentStepIdx === 0;
              const isLastStep = currentStepIdx === steps.length - 1;

              return (
                <div
                  key={m.id}
                  style={{
                    animation: "msgIn .3s ease both",
                  }}
                >
                  {isUser ? (
                    /* User Speech Bubble */
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          maxWidth: "82%",
                          backgroundColor: "var(--user-bg)",
                          color: "var(--user-text)",
                          padding: "10px 15px",
                          borderRadius: "16px 16px 4px 16px",
                          fontSize: "14px",
                          lineHeight: 1.5,
                          boxShadow: "var(--shadow)",
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    /* AI Speech Bubble */
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {/* Avatar Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          color: "var(--muted)",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: ".04em",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "5px",
                            backgroundColor: "var(--primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-ink)"
                            strokeWidth="2.4"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {t.aiName}
                      </div>

                      {/* Main Answer text */}
                      <div
                        style={{
                          backgroundColor: "var(--ai-bg)",
                          color: "var(--ai-text)",
                          padding: "12px 16px",
                          borderRadius: "4px 16px 16px 16px",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          maxWidth: "90%",
                        }}
                      >
                        {m.text}
                      </div>

                      {/* Warnings / Red banners */}
                      {m.warnings && (
                        <div
                          style={{
                            border: "1px solid rgba(232, 68, 59, 0.3)",
                            backgroundColor: "rgba(232, 68, 59, 0.08)",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            maxWidth: "90%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11.5px",
                              fontWeight: 700,
                              color: "var(--annot)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {t.warningsLabel}
                          </div>
                          {Array.isArray(m.warnings) ? (
                            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "var(--text)", lineHeight: 1.5 }}>
                              {m.warnings.map((w, wIdx) => (
                                <li key={wIdx}>{w}</li>
                              ))}
                            </ul>
                          ) : (
                            <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.4 }}>
                              {m.warnings}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Slack Context box */}
                      {m.slackContext && (
                        <div
                          style={{
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--surface2)",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            maxWidth: "90%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11.5px",
                              fontWeight: 700,
                              color: "var(--muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span style={{ fontSize: "12px" }}>💬</span>
                            {t.slackLabel}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.45, fontStyle: "italic" }}>
                            &ldquo;{m.slackContext}&rdquo;
                          </div>
                        </div>
                      )}

                      {/* Walkthrough Cards */}
                      {hasSteps && currentStep && (
                        <div
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: "16px",
                            backgroundColor: "var(--surface)",
                            boxShadow: "var(--shadow)",
                            overflow: "hidden",
                            maxWidth: "100%",
                          }}
                        >
                          {/* Card Header progress */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "13px 16px 11px",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-ibm-plex-mono), monospace",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "var(--primary-ink)",
                                backgroundColor: "var(--primary)",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                letterSpacing: ".02em",
                                flexShrink: 0,
                              }}
                            >
                              {`STEP ${currentStepIdx + 1} / ${steps.length}`}
                            </span>
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
                              {getLocalizedField(currentStep.title)}
                            </span>
                            <div
                              style={{
                                width: "74px",
                                height: "5px",
                                borderRadius: "3px",
                                backgroundColor: "var(--surface2)",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  backgroundColor: "var(--primary)",
                                  width: `${Math.round(((currentStepIdx + 1) / steps.length) * 100)}%`,
                                  transition: "width .35s ease",
                                }}
                              />
                            </div>
                          </div>

                          {/* Card Image Content */}
                          <div style={{ padding: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                              {/* Relative wrapper for schematic diagram + annotation */}
                              <div
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  aspectRatio: "3/2",
                                  borderRadius: "11px",
                                  overflow: "hidden",
                                  border: "1px solid var(--border)",
                                  backgroundColor: "var(--surface2)",
                                }}
                              >
                                <DeviceDiagram dark={dark} />
                                {renderAnnotation(currentStep.annotation, `${m.id}-${currentStepIdx}`)}
                              </div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "14px",
                                  lineHeight: 1.65,
                                  color: "var(--text)",
                                }}
                              >
                                {getLocalizedField(currentStep.text)}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer Navigation buttons */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "0 16px 16px",
                            }}
                          >
                            {/* Back Button */}
                            <button
                              onClick={() => handleStepNavigation(m.id, -1, steps.length)}
                              disabled={isFirstStep}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--surface)",
                                color: isFirstStep ? "var(--muted)" : "var(--text)",
                                cursor: isFirstStep ? "default" : "pointer",
                                opacity: isFirstStep ? 0.45 : 1,
                                padding: "9px 15px",
                                borderRadius: "9px",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M15 18l-6-6 6-6" />
                              </svg>
                              {t.back}
                            </button>

                            {/* Completed Status Checkmark */}
                            {isLastStep ? (
                              <div
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "7px",
                                  color: "var(--primary)",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  animation: "msgIn .25s ease both",
                                }}
                              >
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M8 12l3 3 5-6" />
                                </svg>
                                {t.allDoneLabel}
                              </div>
                            ) : (
                              <div style={{ flex: 1 }} />
                            )}

                            {/* Next Button */}
                            <button
                              onClick={() => handleStepNavigation(m.id, 1, steps.length)}
                              disabled={isLastStep}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "none",
                                backgroundColor: isLastStep ? "var(--muted)" : "var(--primary)",
                                color: "var(--primary-ink)",
                                cursor: isLastStep ? "default" : "pointer",
                                opacity: isLastStep ? 0.55 : 1,
                                padding: "9px 18px",
                                borderRadius: "9px",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "background-color 0.2s",
                              }}
                            >
                              {isLastStep ? t.done : t.next}
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Thinking bubble */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  animation: "msgIn .3s ease both",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "var(--muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".04em",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "5px",
                      backgroundColor: "var(--primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--primary-ink)"
                      strokeWidth="2.4"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {t.aiName}
                </div>
                <div
                  style={{
                    backgroundColor: "var(--ai-bg)",
                    padding: "14px 18px",
                    borderRadius: "4px 16px 16px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "fit-content",
                  }}
                >
                  <span style={{ display: "flex", gap: "5px" }}>
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "var(--muted)",
                        animation: "blink 1.2s infinite 0s",
                      }}
                    />
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "var(--muted)",
                        animation: "blink 1.2s infinite 0.2s",
                      }}
                    />
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "var(--muted)",
                        animation: "blink 1.2s infinite 0.4s",
                      }}
                    />
                  </span>
                  <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>
                    {t.thinking}
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "11px",
                  padding: "13px 15px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(232, 68, 59, 0.1)",
                  border: "1px solid rgba(232, 68, 59, 0.32)",
                  color: "var(--annot)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <div style={{ flex: 1, fontSize: "13px", lineHeight: 1.5, fontWeight: 500 }}>
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--annot)",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "18px",
                    lineHeight: 1,
                    opacity: 0.7,
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar Area */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              rows={1}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                resize: "none",
                maxHeight: "120px",
                minHeight: "46px",
                padding: "13px 14px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface2)",
                color: "var(--text)",
                fontSize: "14px",
                lineHeight: 1.4,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              className="input-focus-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              title={t.send}
              style={{
                flexShrink: 0,
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "var(--primary-ink)",
                cursor: loading || !input.trim() ? "default" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s, background-color 0.2s",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
