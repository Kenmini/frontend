"use client";

import React from "react";
import { StepCard } from "@/components/steps/StepCard";
import type { ChatMessage } from "@/types/chat";
import { AnswerMessage } from "./AnswerMessage";

interface ChatHistoryLabels {
  emptyTitle: string;
  empty: string;
  emptyHint: string;
  aiName: string;
  thinking: string;
  warnings: string;
  slack: string;
  nextStep: string;
  confidence: string;
  relatedFigure: string;
  relatedItem: string;
  citations: string;
  back: string;
  next: string;
  done: string;
  allDone: string;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  suggestions: string[];
  stepIndex: Record<string, number>;
  dark: boolean;
  lang: "ja" | "en";
  labels: ChatHistoryLabels;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSuggestionClick: (text: string) => void;
  onStepNavigation: (messageId: string, delta: number, totalSteps: number) => void;
  onClearError: () => void;
}

function AiHeader({ label }: { label: string }) {
  return (
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
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--primary-ink)" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {label}
    </div>
  );
}

export function ChatHistory({
  messages,
  loading,
  error,
  suggestions,
  stepIndex,
  dark,
  lang,
  labels,
  scrollRef,
  onSuggestionClick,
  onStepNavigation,
  onClearError,
}: ChatHistoryProps) {
  return (
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
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8" />
                <path d="M9 2v6.5L5 17a3 3 0 0 0 2.7 4.3h8.6A3 3 0 0 0 19 17l-4-8.5V2" />
                <path d="M7 14h10" />
              </svg>
            </div>
            <div style={{ maxWidth: "400px" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px", letterSpacing: "-.01em" }}>
                {labels.emptyTitle}
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.55 }}>
                {labels.empty}
              </div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: "4px" }}>
              {labels.emptyHint}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "460px" }}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
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
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          const steps = message.steps || [];
          const hasSteps = steps.length > 0;
          const currentStepIdx = stepIndex[message.id] ?? 0;

          return (
            <div key={message.id} style={{ animation: "msgIn .3s ease both" }}>
              {isUser ? (
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
                    {message.text}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <AnswerMessage
                    text={message.text}
                    warnings={message.warnings}
                    slackContext={message.slackContext}
                    nextStepHint={message.nextStepHint}
                    citations={message.citations}
                    confidence={message.confidence}
                    visualData={message.visualData}
                    labels={{
                      aiName: labels.aiName,
                      warnings: labels.warnings,
                      slack: labels.slack,
                      nextStep: labels.nextStep,
                      confidence: labels.confidence,
                      relatedFigure: labels.relatedFigure,
                      relatedItem: labels.relatedItem,
                      citations: labels.citations,
                    }}
                  />

                  {hasSteps && (
                    <StepCard
                      messageId={message.id}
                      steps={steps}
                      currentStepIndex={currentStepIdx}
                      dark={dark}
                      lang={lang}
                      labels={{
                        back: labels.back,
                        next: labels.next,
                        done: labels.done,
                        allDone: labels.allDone,
                      }}
                      onNavigate={onStepNavigation}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "msgIn .3s ease both" }}>
            <AiHeader label={labels.aiName} />
            <div style={{ backgroundColor: "var(--ai-bg)", padding: "14px 18px", borderRadius: "4px 16px 16px 16px", display: "flex", alignItems: "center", gap: "10px", width: "fit-content" }}>
              <span style={{ display: "flex", gap: "5px" }}>
                {[0, 0.2, 0.4].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "var(--muted)",
                      animation: `blink 1.2s infinite ${delay}s`,
                    }}
                  />
                ))}
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>{labels.thinking}</span>
            </div>
          </div>
        )}

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <div style={{ flex: 1, fontSize: "13px", lineHeight: 1.5, fontWeight: 500 }}>{error}</div>
            <button
              onClick={onClearError}
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
  );
}
