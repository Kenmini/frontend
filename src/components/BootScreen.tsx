"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoImg from "@/assets/logo.png";

interface BootScreenProps {
  isStatic?: boolean;
  dark?: boolean;
  lang: "ja" | "en";
  onComplete: () => void;
}

interface Particle {
  id: number;
  emoji: string;
  x: number; // horizontal offset in pixels relative to logo center
  rotation: number; // random rotation angle
}

const MESSAGES_JA = [
  "システムコンポーネントをロード中...",
  "光学レンズの曇りを磨き上げています...",
  "レーザー発振管をゆっくり暖機運転中...",
  "Slackの過去ログから不具合情報を検索中...",
  "顕微鏡にご機嫌をうかがっています...",
  "安全確認プロトコルを順守中...",
  "AIガイドの思考回路をフル回転中...",
  "診断データベースの接続を確認中...",
  "まもなく診断を開始します..."
];

const MESSAGES_EN = [
  "Loading system components...",
  "Polishing the optical lenses...",
  "Warming up the laser cavity...",
  "Searching Slack logs for issues...",
  "Asking the microscope nicely to cooperate...",
  "Verifying safety protocols...",
  "Overclocking AI guide neurons...",
  "Checking diagnostic database connection...",
  "Starting the assistant..."
];

const EMOJIS = ["💡", "⚡", "⚙️", "🔬", "🧪", "🔍", "✨", "🚀", "🤖"];

export function BootScreen({ isStatic = false, dark = false, lang = "ja", onComplete }: BootScreenProps) {
  const messages = lang === "ja" ? MESSAGES_JA : MESSAGES_EN;
  const t = {
    title: lang === "ja" ? "研究室AIガイド" : "Lab AI Guide",
    subtitle: lang === "ja" ? "装置トラブル診断アシスタント" : "Equipment troubleshooting assistant",
    cheerPrompt: lang === "ja" ? "ロゴをタップで応援！" : "Tap logo to cheer me on!",
    cheersCount: lang === "ja" ? "応援回数: " : "Cheers: ",
    ready: lang === "ja" ? "準備完了！" : "System ready!",
    levels: {
      0: lang === "ja" ? "アイドリング中..." : "Idling...",
      1: lang === "ja" ? "エンジン始動！ ⚡" : "Engine started! ⚡",
      2: lang === "ja" ? "いい調子！ ❤️" : "Going good! ❤️",
      3: lang === "ja" ? "超高速ローディング！ 🚀" : "Supercharging! 🚀",
      4: lang === "ja" ? "限界突破！ 🔥✨" : "Limit break! 🔥✨",
    }
  };

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  // Get active cheerleader level
  let cheerLevel = 0;
  if (clickCount >= 25) cheerLevel = 4;
  else if (clickCount >= 15) cheerLevel = 3;
  else if (clickCount >= 7) cheerLevel = 2;
  else if (clickCount >= 2) cheerLevel = 1;

  const currentMessage = messages[messageIndex % messages.length] ?? messages[0];

  // Static Mode vs Active Mode
  useEffect(() => {
    if (isStatic) return;

    // Smooth progress loader over 3.5s
    const startTime = Date.now();
    const duration = 3500;

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (elapsed >= duration) {
        clearInterval(progressTimer);
        // Trigger fadeout
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 500); // Wait for transition animation
      }
    }, 30);

    // Cycle messages faster during boot (every 800ms)
    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 850);

    return () => {
      clearInterval(progressTimer);
      clearInterval(msgTimer);
    };
  }, [isStatic, messages.length, onComplete]);

  // Click logo interaction
  const handleLogoClick = () => {
    if (isStatic) return;
    setIsSpinning(true);
    setClickCount((prev) => prev + 1);

    // Spawn 1-2 random emoji particles
    const count = Math.random() > 0.5 ? 2 : 1;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? "✨";
      const randomX = Math.floor(Math.random() * 80) - 40; // -40px to 40px
      const randomRotation = Math.floor(Math.random() * 60) - 30; // -30deg to 30deg
      newParticles.push({
        id: Date.now() + Math.random() + i,
        emoji: randomEmoji,
        x: randomX,
        rotation: randomRotation,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1000);
  };

  const handleAnimationEnd = () => {
    setIsSpinning(false);
  };

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-ibm-plex-sans-jp), sans-serif",
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? "scale(1.05)" : "scale(1)",
        pointerEvents: fadeOut ? "none" : "auto",
        transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Inline styles for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbitCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes logoBobLarge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes particleFloatUp {
          0% {
            transform: translateY(20px) scale(0.4);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-5px) scale(1.3);
          }
          100% {
            transform: translateY(-90px) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(13, 125, 138, 0.2)); }
          50% { filter: drop-shadow(0 0 20px rgba(13, 125, 138, 0.5)); }
        }
        [data-theme="dark"] {
          --glow-color: rgba(31, 182, 196, 0.4);
        }
        [data-theme="light"] {
          --glow-color: rgba(13, 125, 138, 0.3);
        }
        .boot-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background-color: var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
      `}} />

      <div
        className="boot-card"
        style={{
          padding: "45px 35px",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Title Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-.02em",
              color: "var(--text)",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              lineHeight: 1.4,
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Orbit & Logo System */}
        <div
          style={{
            position: "relative",
            width: "140px",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "10px 0",
          }}
        >
          {/* Particles */}
          <div
            style={{
              position: "absolute",
              top: "30px",
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
                  fontSize: "24px",
                  left: `${p.x}px`,
                  transform: `translateX(-50%) rotate(${p.rotation}deg)`,
                  animation: "particleFloatUp 1.0s cubic-bezier(0.1, 0.8, 0.3, 1) both",
                  whiteSpace: "nowrap",
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>

          {/* Outer rotating dashed ring */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px dashed var(--primary)",
              opacity: isStatic ? 0.3 : 0.7,
              position: "absolute",
              animation: isStatic ? "none" : "orbitCW 15s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Inner counter-rotating dotted ring */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "1.5px dotted var(--muted)",
              opacity: isStatic ? 0.2 : 0.5,
              position: "absolute",
              animation: isStatic ? "none" : "orbitCCW 10s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Logo container */}
          <div
            onClick={handleLogoClick}
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "16px",
              cursor: isStatic ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "transform 0.2s, filter 0.2s",
              animation: isStatic
                ? "none"
                : isSpinning
                ? "none"
                : "logoBobLarge 3.5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
            }}
            className={isStatic ? "" : "interactive-loader-logo"}
          >
            <Image
              src={logoImg}
              alt="Logo"
              width={74}
              height={74}
              onAnimationEnd={handleAnimationEnd}
              style={{
                borderRadius: "16px",
                objectFit: "cover",
                animation: isSpinning ? "logoSpinOnDemand 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) 1" : "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            />
          </div>
        </div>

        {/* Mini-Game: Cheerleader status */}
        {!isStatic && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              minHeight: "44px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                userSelect: "none",
              }}
            >
              {clickCount > 0 ? (
                <>
                  {t.cheersCount}
                  <strong style={{ color: "var(--primary)", fontSize: "12px" }}>{clickCount}</strong>
                </>
              ) : (
                t.cheerPrompt
              )}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: cheerLevel > 0 ? "var(--primary)" : "var(--muted)",
                backgroundColor: cheerLevel > 0 ? "var(--surface2)" : "transparent",
                padding: cheerLevel > 0 ? "3px 10px" : "0",
                borderRadius: "12px",
                border: cheerLevel > 0 ? "1px solid var(--border)" : "none",
                transition: "all 0.25s ease",
                transform: cheerLevel > 0 ? "scale(1.03)" : "scale(1)",
                display: "inline-block",
                userSelect: "none",
              }}
            >
              {cheerLevel === 4 && t.levels[4]}
              {cheerLevel === 3 && t.levels[3]}
              {cheerLevel === 2 && t.levels[2]}
              {cheerLevel === 1 && t.levels[1]}
              {cheerLevel === 0 && clickCount > 0 && t.levels[0]}
            </span>
          </div>
        )}

        {/* Progress & Message Section */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Progress Bar Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "6px",
              backgroundColor: "var(--border)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--primary), var(--primary))",
                boxShadow: "0 0 8px var(--primary)",
                borderRadius: "3px",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Progress percentage and status messages */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11.5px",
              color: "var(--muted)",
              minHeight: "18px",
            }}
          >
            {/* Status message */}
            <span
              key={messageIndex}
              style={{
                textAlign: "left",
                fontWeight: 500,
                color: "var(--text)",
                animation: isStatic ? "none" : "textSlideUp 0.3s ease both",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "80%",
              }}
            >
              {isStatic ? messages[0] : progress >= 100 ? t.ready : currentMessage}
            </span>

            {/* Percentage */}
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontWeight: 600 }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
