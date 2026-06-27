import type { Citation, VisualData } from "@/types/chat";

interface AnswerMessageLabels {
  aiName: string;
  warnings: string;
  slack: string;
  nextStep: string;
  confidence: string;
  relatedFigure: string;
  relatedItem: string;
  citations: string;
}

interface AnswerMessageProps {
  text: string;
  warnings?: string[] | string;
  slackContext?: string;
  nextStepHint?: string | null;
  citations?: Citation[];
  confidence?: number;
  visualData?: VisualData | null;
  labels: AnswerMessageLabels;
}

export function AnswerMessage({
  text,
  warnings,
  slackContext,
  nextStepHint,
  citations,
  confidence,
  visualData,
  labels,
}: AnswerMessageProps) {
  const hasCitations = citations && citations.length > 0;
  const hasVisualData = Boolean(visualData?.figure_id || visualData?.highlight_item);
  const hasMetadata = nextStepHint || typeof confidence === "number" || hasVisualData || hasCitations;

  return (
    <>
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
        {labels.aiName}
      </div>

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
        {text}
      </div>

      {warnings && (
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
            {labels.warnings}
          </div>
          {Array.isArray(warnings) ? (
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "var(--text)", lineHeight: 1.5 }}>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.4 }}>
              {warnings}
            </div>
          )}
        </div>
      )}

      {slackContext && (
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
            {labels.slack}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.45, fontStyle: "italic" }}>
            &ldquo;{slackContext}&rdquo;
          </div>
        </div>
      )}

      {hasMetadata && (
        <div
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--surface2)",
            borderRadius: "12px",
            padding: "10px 14px",
            maxWidth: "90%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12.5px",
            color: "var(--text)",
            lineHeight: 1.45,
          }}
        >
          {typeof confidence === "number" && (
            <div>
              <strong>{labels.confidence}: </strong>
              {Math.round(confidence * 100)}%
            </div>
          )}
          {nextStepHint && (
            <div>
              <strong>{labels.nextStep}: </strong>
              {nextStepHint}
            </div>
          )}
          {hasVisualData && (
            <div>
              {visualData?.figure_id && (
                <div>
                  <strong>{labels.relatedFigure}: </strong>
                  {visualData.figure_id}
                </div>
              )}
              {visualData?.highlight_item && (
                <div>
                  <strong>{labels.relatedItem}: </strong>
                  {visualData.highlight_item}
                </div>
              )}
            </div>
          )}
          {hasCitations && (
            <div>
              <strong>{labels.citations}</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: "16px" }}>
                {citations.map((citation, index) => (
                  <li key={`${citation.source}-${index}`} style={{ marginBottom: "6px" }}>
                    <div style={{ fontWeight: 600 }}>{citation.source}</div>
                    <div style={{ color: "var(--muted)" }}>{citation.snippet}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
