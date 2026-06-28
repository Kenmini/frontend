"use client";

import { useState, useCallback } from "react";
import type { Annotation } from "@/types/chat";

interface AnnotationOverlayProps {
  annotation?: Annotation;
  label?: string;
  description?: string;
  markerId: string;
}

/**
 * Renders an animated SVG overlay + a plain HTML tooltip.
 *
 * The SVG uses viewBox="0 0 600 400" with preserveAspectRatio="none" so
 * annotation coords (from metadata.json) map 1-to-1 without any division.
 *
 * The tooltip is a regular <div> (NOT a foreignObject inside the SVG) so
 * it escapes the parent container's overflow:hidden and renders correctly.
 */
export function AnnotationOverlay({
  annotation,
  label,
  description,
  markerId,
}: AnnotationOverlayProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    if (label || description) setOpen((v) => !v);
  }, [label, description]);

  const close = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  }, []);

  if (!annotation) return null;

  const W = 600;
  const H = 400;

  const redRaw = "#e8443b";
  const red = "var(--annot)";
  const white = "#ffffff";

  const { x, y, width: w, height: h, type } = annotation;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;

  const hasInfo = Boolean(label || description);

  // ── tooltip position as percentages of the image container ────────────
  // We keep working in the 600×400 coord space, then convert to %
  const tipCxPct = (cx / W) * 100;
  // Show tooltip above if annotation is in the bottom half, else below
  const showAbove = cy / H > 0.5;
  const tipEdgePct = showAbove
    ? ((H - y) / H) * 100          // distance from bottom
    : ((y + h) / H) * 100;         // distance from top

  // ── shapes ────────────────────────────────────────────────────────────
  let shape: React.ReactNode;

  if (type === "highlight") {
    const pad = 3;
    const rx = 8;

    shape = (
      <g
        onClick={toggle}
        style={{ cursor: hasInfo ? "pointer" : "default" }}
        role={hasInfo ? "button" : undefined}
        aria-label={label}
      >
        {/* Transparent full-area hit target */}
        <rect x={x} y={y} width={w} height={h} rx={rx} fill="transparent" />

        {/* Blush fill */}
        <rect x={x} y={y} width={w} height={h} rx={rx} fill={redRaw} fillOpacity={0.12} />

        {/* Solid backing border */}
        <rect
          x={x + pad} y={y + pad}
          width={w - pad * 2} height={h - pad * 2}
          rx={rx - 1} fill="none"
          stroke={red} strokeWidth={2.5} strokeOpacity={0.45}
        />

        {/* Marching-ants border */}
        <rect
          x={x + pad} y={y + pad}
          width={w - pad * 2} height={h - pad * 2}
          rx={rx - 1} fill="none"
          stroke={red} strokeWidth={2.5}
          strokeDasharray="14 10"
          style={{ animation: "annotMarch 1.2s linear infinite" }}
        />

        {/* Corner dots */}
        {([[x, y], [x + w, y], [x, y + h], [x + w, y + h]] as [number, number][]).map(
          ([dx, dy], i) => (
            <circle key={i} cx={dx} cy={dy} r={4} fill={red} fillOpacity={0.9} />
          )
        )}

        {/* Outer glow pulse */}
        <rect
          x={x - 4} y={y - 4}
          width={w + 8} height={h + 8}
          rx={rx + 4} fill="none"
          stroke={red} strokeWidth={3} strokeOpacity={0}
          style={{ animation: "annotOuterGlow 2s ease-in-out infinite" }}
        />

        {/* Tap-hint badge */}
        {hasInfo && (
          <circle
            cx={x + w - 10} cy={y + 10} r={7}
            fill={red} fillOpacity={0.92}
            style={{ animation: "annotOuterGlow 2s ease-in-out infinite" }}
          />
        )}
      </g>
    );
  } else if (type === "circle") {
    shape = (
      <g
        onClick={toggle}
        style={{ cursor: hasInfo ? "pointer" : "default" }}
        role={hasInfo ? "button" : undefined}
        aria-label={label}
      >
        {/* Transparent hit area (larger than the ring) */}
        <circle cx={cx} cy={cy} r={r + 12} fill="transparent" />

        {/* Ripple 1 */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={red} strokeWidth={2.5} strokeOpacity={0.8}
          style={{
            animation: "annotRippleOut 2s ease-out infinite",
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
        {/* Ripple 2 – offset by 0.7s */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={red} strokeWidth={2} strokeOpacity={0.5}
          style={{
            animation: "annotRippleOut 2s ease-out 0.7s infinite",
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />

        {/* Blush fill */}
        <circle cx={cx} cy={cy} r={r} fill={redRaw} fillOpacity={0.1} />

        {/* Solid ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={red} strokeWidth={3} strokeOpacity={0.9} />

        {/* White outer halo */}
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={white} strokeWidth={2} strokeOpacity={0.3} />

        {/* Centre dot */}
        <circle cx={cx} cy={cy} r={4} fill={red} fillOpacity={0.9} />
        <circle cx={cx} cy={cy} r={2} fill={white} fillOpacity={0.7} />

        {/* Tap-hint badge */}
        {hasInfo && (
          <circle
            cx={cx + r * 0.7} cy={cy - r * 0.7} r={7}
            fill={red} fillOpacity={0.92}
            style={{ animation: "annotOuterGlow 2s ease-in-out infinite" }}
          />
        )}
      </g>
    );
  } else {
    // Arrow
    const sx = Math.max(30, cx - 160);
    const sy = Math.max(20, cy - 130);
    const len = Math.hypot(cx - sx, cy - sy);

    shape = (
      <g
        onClick={toggle}
        style={{ cursor: hasInfo ? "pointer" : "default" }}
        role={hasInfo ? "button" : undefined}
        aria-label={label}
      >
        <defs>
          <marker
            id={`ah-${markerId}`}
            viewBox="0 0 12 12" refX={9} refY={6}
            markerWidth={7} markerHeight={7}
            orient="auto-start-reverse"
          >
            <path d="M0 1 L10 6 L0 11 Z" fill={red} />
          </marker>
          <filter id={`glow-${markerId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wide transparent hit-zone along the line */}
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke="transparent" strokeWidth={20} />

        {/* White shadow */}
        <line
          x1={sx} y1={sy} x2={cx} y2={cy}
          stroke={white} strokeWidth={8} strokeLinecap="round" strokeOpacity={0.65}
          strokeDasharray={len} strokeDashoffset={len}
          style={{ animation: "annotDraw .55s cubic-bezier(.4,0,.2,1) .1s both" }}
        />
        {/* Coloured line */}
        <line
          x1={sx} y1={sy} x2={cx} y2={cy}
          stroke={red} strokeWidth={4.5} strokeLinecap="round"
          markerEnd={`url(#ah-${markerId})`}
          filter={`url(#glow-${markerId})`}
          strokeDasharray={len} strokeDashoffset={len}
          style={{ animation: "annotDraw .55s cubic-bezier(.4,0,.2,1) .1s both" }}
        />
        {/* Pulsing tip */}
        <circle cx={cx} cy={cy} r={6} fill={red}
          style={{ animation: "annotArrowFade .6s ease .55s both" }}
        />
        <circle
          cx={cx} cy={cy} r={6} fill={red} fillOpacity={0.3}
          style={{
            animation: "annotArrowFade .6s ease .55s both, annotRippleOut 1.8s ease-out .8s infinite",
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      </g>
    );
  }

  // ── tooltip: plain HTML div, NOT foreignObject ────────────────────────
  // Rendered as a sibling to the SVG so it is not clipped by overflow:hidden
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    left: `clamp(8px, calc(${tipCxPct}% - 110px), calc(100% - 228px))`,
    width: "220px",
    zIndex: 10,
    pointerEvents: "auto",
    animation: "annotTooltipIn .2s cubic-bezier(.34,1.56,.64,1) both",
    background: "var(--surface)",
    border: "1.5px solid var(--border)",
    borderRadius: "10px",
    boxShadow: "0 6px 28px rgba(0,0,0,0.22)",
    padding: "10px 12px 10px",
  };

  if (showAbove) {
    tooltipStyle.bottom = `calc(${tipEdgePct}% + 8px)`;
  } else {
    tooltipStyle.top = `calc(${tipEdgePct}% + 8px)`;
  }

  return (
    <>
      {/* SVG layer — shapes only, no foreignObject */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          // Always accept pointer events so clicks register
          pointerEvents: "auto",
          animation: "annotFade .4s ease both",
        }}
      >
        <defs>
          <style>{`
            @keyframes annotOuterGlow {
              0%, 100% { stroke-opacity: 0; stroke-width: 3px; }
              50%       { stroke-opacity: 0.35; stroke-width: 8px; }
            }
            @keyframes annotRippleOut {
              0%   { transform: scale(1);   opacity: 0.85; }
              100% { transform: scale(1.9); opacity: 0; }
            }
          `}</style>
        </defs>
        {shape}
      </svg>

      {/* Tooltip: plain HTML, rendered as sibling so it escapes overflow:hidden */}
      {open && hasInfo && (
        <div style={tooltipStyle}>
          {/* Close button */}
          <button
            onClick={close}
            style={{
              position: "absolute",
              top: "6px",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: "16px",
              lineHeight: 1,
              padding: "0 2px",
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Label */}
          {label && (
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "var(--annot)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: description ? "5px" : 0,
                paddingRight: "18px",
              }}
            >
              {label}
            </div>
          )}

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "12px",
                lineHeight: 1.6,
                color: "var(--text)",
              }}
            >
              {description}
            </div>
          )}
        </div>
      )}
    </>
  );
}
