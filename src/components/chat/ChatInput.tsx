"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

interface ChatInputProps {
  value: string;
  loading: boolean;
  placeholder: string;
  sendLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export interface ChatInputHandle {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  { value, loading, placeholder, sendLabel, onChange, onSubmit },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const disabled = loading || !value.trim();

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isComposing = event.nativeEvent.isComposing || event.keyCode === 229;
    if (event.key === "Enter" && !event.shiftKey && !isComposing) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <form
        onSubmit={handleSubmit}
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
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
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
          disabled={disabled}
          title={sendLabel}
          style={{
            flexShrink: 0,
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "var(--primary)",
            color: "var(--primary-ink)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
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
  );
});
