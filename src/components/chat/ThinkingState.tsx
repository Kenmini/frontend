"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoImg from "@/assets/logo.png";

interface ThinkingStateProps {
  lang: "ja" | "en";
  aiName: string;
  defaultThinkingLabel: string;
}

interface Particle {
  id: number;
  emoji: string;
  x: number; // horizontal offset in pixels relative to logo center
  rotation: number; // random rotation angle
}

const MESSAGES_JA = [
  "確認手順を組み立てています...",
  "光学レンズの曇りを磨き上げています...",
  "レーザー発振管をゆっくり暖機運転中...",
  "Slackの過去ログから類似トラブルを検索中...",
  "顕微鏡にご機嫌をうかがっています...",
  "極秘のラボ・マニュアルを精査中...",
  "AI回路に特製オイルを注油しています...",
  "安全確認プロトコルを順守中...",
  "装置からの微弱な電気信号をデコード中...",
  "AIガイドの思考回路をフル回転中..."
];

const MESSAGES_EN = [
  "Preparing the confirmation steps...",
  "Polishing the optical lenses...",
  "Warming up the laser cavity...",
  "Searching Slack archives for similar issues...",
  "Asking the microscope nicely to cooperate...",
  "Flipping through the sacred lab manuals...",
  "Lubricating the AI circuits...",
  "Ensuring all safety protocols are met...",
  "Decoding faint electronic signals from the device...",
  "Overclocking the AI guide neurons..."
];

const EMOJIS = ["💡", "⚡", "⚙️", "❤️", "🔬", "🧪", "🔍", "✨"];

export function ThinkingState({ lang, aiName, defaultThinkingLabel }: ThinkingStateProps) {
  const messages = lang === "ja" ? MESSAGES_JA : MESSAGES_EN;
  const clickHint = lang === "ja" ? "タップで応援！" : "Click to cheer me on!";

  const [messageIndex, setMessageIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickCount, setClickCount] = useState(0);

  // Cycle messages every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [messages.length]);

  // Click handler to trigger cute logo interactions
  const handleLogoClick = () => {
    setIsSpinning(true);
    setClickCount((prev) => prev + 1);

    // Spawn a cute random particle
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const randomX = Math.floor(Math.random() * 40) - 20; // -20px to 20px
    const randomRotation = Math.floor(Math.random() * 60) - 30; // -30deg to 30deg
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      emoji: randomEmoji,
      x: randomX,
      rotation: randomRotation,
    };

    setParticles((prev) => [...prev, newParticle]);

    // Clean up particle after animation ends
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);
  };

  // Reset spin state after animation ends
  const handleAnimationEnd = () => {
    setIsSpinning(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "msgIn .3s ease both" }}>
      {/* AI Name Header */}
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
        {aiName}
      </div>

      {/* Main Thinking Bubble */}
      <div
        style={{
          backgroundColor: "var(--ai-bg)",
          padding: "16px 20px",
          borderRadius: "4px 20px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          maxWidth: "92%",
          width: "fit-content",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Floating click particles container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "34px", // Align centered with the logo container
            width: "1px",
            height: "1px",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                fontSize: "20px",
                left: `${p.x}px`,
                transform: `translateX(-50%) rotate(${p.rotation}deg)`,
                animation: "floatUp 1s ease-out both",
                whiteSpace: "nowrap",
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>

        {/* Logo Interaction Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Outer rotating dashed ring */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "2px dashed var(--primary)",
              opacity: 0.65,
              position: "absolute",
              top: "-4px",
              left: "-4px",
              animation: "spinSlow 12s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Interactive logo wrapper */}
          <div
            onClick={handleLogoClick}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "transform 0.2s, filter 0.2s",
              animation: isSpinning ? "none" : "logoBob 3s ease-in-out infinite",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
            className="interactive-loader-logo"
          >
            <Image
              src={logoImg}
              alt="Logo"
              width={40}
              height={40}
              onAnimationEnd={handleAnimationEnd}
              style={{
                borderRadius: "10px",
                objectFit: "cover",
                animation: isSpinning ? "logoSpinOnDemand 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1" : "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            />
          </div>

          {/* Click hint/counter */}
          <span
            style={{
              fontSize: "8.5px",
              color: "var(--muted)",
              opacity: 0.75,
              whiteSpace: "nowrap",
              textAlign: "center",
              marginTop: "2px",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {clickCount > 0 ? `× ${clickCount}` : clickHint}
          </span>
        </div>

        {/* Message and loading visualizer block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" }}>
          {/* Dynamic Thinking text */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              key={messageIndex}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ai-text)",
                animation: "textSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              {messages[messageIndex]}
            </span>

            {/* Three blink dots */}
            <span style={{ display: "inline-flex", gap: "3px" }}>
              {[0, 0.2, 0.4].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "var(--muted)",
                    animation: `blink 1.2s infinite ${delay}s`,
                  }}
                />
              ))}
            </span>
          </div>

          {/* Scanning/Indeterminate progress line */}
          <div
            style={{
              height: "3px",
              width: "100%",
              maxWidth: "180px",
              backgroundColor: "var(--border)",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "40px",
                background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
                position: "absolute",
                animation: "scannerSlide 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
