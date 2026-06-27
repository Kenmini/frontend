"use client";

import React from "react";
import type { Step } from "@/types/chat";
import { StepImage } from "./StepImage";

interface StepCardLabels {
  back: string;
  next: string;
  done: string;
  allDone: string;
}

interface StepCardProps {
  messageId: string;
  steps: Step[];
  currentStepIndex: number;
  dark: boolean;
  lang: "ja" | "en";
  labels: StepCardLabels;
  onNavigate: (messageId: string, delta: number, totalSteps: number) => void;
}

function localizeField(value: string | { ja: string; en: string }, lang: "ja" | "en") {
  if (typeof value === "object") {
    return value[lang] || value.ja || value.en;
  }
  return value;
}

export function StepCard({
  messageId,
  steps,
  currentStepIndex,
  dark,
  lang,
  labels,
  onNavigate,
}: StepCardProps) {
  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px 11px", borderBottom: "1px solid var(--border)" }}>
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
          {`STEP ${currentStepIndex + 1} / ${steps.length}`}
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
          {localizeField(currentStep.title, lang)}
        </span>
        <div style={{ width: "74px", height: "5px", borderRadius: "3px", backgroundColor: "var(--surface2)", overflow: "hidden", flexShrink: 0 }}>
          <div
            style={{
              height: "100%",
              backgroundColor: "var(--primary)",
              width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%`,
              transition: "width .35s ease",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <StepImage
            step={currentStep}
            markerId={`${messageId}-${currentStepIndex}`}
            dark={dark}
          />
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.65, color: "var(--text)" }}>
            {localizeField(currentStep.text, lang)}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 16px 16px" }}>
        <button
          onClick={() => onNavigate(messageId, -1, steps.length)}
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {labels.back}
        </button>

        {isLastStep ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", color: "var(--primary)", fontSize: "13px", fontWeight: 600, animation: "msgIn .25s ease both" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            {labels.allDone}
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <button
          onClick={() => onNavigate(messageId, 1, steps.length)}
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
          {isLastStep ? labels.done : labels.next}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
