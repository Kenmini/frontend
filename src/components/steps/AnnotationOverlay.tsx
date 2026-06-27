import type { Annotation } from "@/types/chat";

interface AnnotationOverlayProps {
  annotation?: Annotation;
  markerId: string;
}

export function AnnotationOverlay({ annotation, markerId }: AnnotationOverlayProps) {
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
            id={`ah-${markerId}`}
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
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke={red} strokeWidth={5.5} strokeLinecap="round" markerEnd={`url(#ah-${markerId})`} />
        <circle cx={cx} cy={cy} r={6} fill={red} />
      </svg>
    );
  } else {
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
}
