import type { ReactNode } from "react";
import React, { useState } from "react";
import type { Citation, VisualData } from "@/types/chat";
import { DIAGRAMS } from "@/data/diagrams";
import { parseAnswerBlocks, parseAnswerInline } from "@/utils/answerParser";

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
  showConfidence?: boolean;
  showRelatedFigure?: boolean;
  labels: AnswerMessageLabels;
}

function renderInlineText(text: string): ReactNode {
  return parseAnswerInline(text).map((segment, index) => {
    if (segment.type === "strong") {
      return <strong key={index}>{segment.text}</strong>;
    }

    return <span key={index}>{segment.text}</span>;
  });
}

function FormattedAnswerText({ text }: { text: string }) {
  const blocks = parseAnswerBlocks(text);

  return (
    <div className="answer-rich-text">
      {blocks.map((block, index) => {
        if (block.type === "rule") {
          return <hr key={index} />;
        }

        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h2" : "h3";
          return <Tag key={index}>{renderInlineText(block.text)}</Tag>;
        }

        if (block.type === "orderedList") {
          return (
            <ol key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "unorderedList") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={index}>
              {block.lines.map((line, lineIndex) => (
                <p key={lineIndex}>{renderInlineText(line)}</p>
              ))}
            </blockquote>
          );
        }

        return <p key={index}>{renderInlineText(block.text)}</p>;
      })}
    </div>
  );
}

function getPdfDisplayLabel(visualData?: VisualData | null) {
  if (visualData?.pdf_url) {
    try {
      const url = new URL(visualData.pdf_url);
      return url.pathname.split("/").filter(Boolean).pop() || "PDF";
    } catch {
      return visualData.pdf_url.split("/").filter(Boolean).pop() || "PDF";
    }
  }

  return visualData?.source || "PDF";
}

function buildPdfPageLinkUrl(visualData?: VisualData | null) {
  if (!visualData?.pdf_url || visualData.page_number == null) return null;

  try {
    const url = new URL(visualData.pdf_url);
    url.hash = `page=${visualData.page_number}`;
    return url.toString();
  } catch {
    const baseUrl = visualData.pdf_url.split("#")[0];
    return `${baseUrl}#page=${visualData.page_number}`;
  }
}

export function AnswerMessage({
  text,
  warnings,
  slackContext,
  nextStepHint,
  citations,
  confidence,
  visualData,
  showConfidence = false,
  showRelatedFigure = false,
  labels,
}: AnswerMessageProps) {
  const [pdfExpanded, setPdfExpanded] = useState(false);
  const hasCitations = citations && citations.length > 0;
  const hasVisualData =
    showRelatedFigure && Boolean(
      (visualData?.figure_id && visualData.figure_id !== "panel_01") ||
      visualData?.highlight_item
    );
  const confidenceVisible = showConfidence && typeof confidence === "number";
  const hasMetadata = nextStepHint || confidenceVisible || hasVisualData || hasCitations;
  const hasStaticImages = (visualData?.static_images?.length ?? 0) > 0;
  const pdfPageLinkUrl = buildPdfPageLinkUrl(visualData);
  const pdfDisplayLabel = getPdfDisplayLabel(visualData);
  const hasPdfFallback = !hasStaticImages && Boolean(pdfPageLinkUrl);

  // Deduplicate citations by source name
  const groupedCitations = hasCitations
    ? Object.entries(
        citations.reduce<Record<string, string[]>>((acc, c) => {
          if (!acc[c.source]) acc[c.source] = [];
          acc[c.source].push(c.snippet);
          return acc;
        }, {})
      )
    : [];

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
        <FormattedAnswerText text={text} />
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
          {confidenceVisible && (
            <div>
              <strong>{labels.confidence}: </strong>
              {Math.round(confidence! * 100)}%
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
                  {DIAGRAMS[visualData.figure_id]?.name || visualData.figure_id}
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
                {groupedCitations.map(([source, snippets]) => (
                  <li key={source} style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 600 }}>{source}</div>
                    <div style={{ color: "var(--muted)", fontSize: "12px", marginTop: "2px" }}>
                      {snippets[0].slice(0, 120)}
                      {snippets[0].length > 120 ? "…" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hasPdfFallback && (
        <div
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--surface2)",
            borderRadius: "12px",
            maxWidth: "90%",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setPdfExpanded(!pdfExpanded)}
            style={{
              width: "100%",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
            }}
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
              style={{
                transform: pdfExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span style={{ color: "var(--muted)" }}>
              {pdfDisplayLabel} — Page {visualData?.page_number}
            </span>
          </button>
          {pdfExpanded && pdfPageLinkUrl && visualData?.pdf_url && visualData.page_number != null && (
            <div style={{ padding: "0 14px 14px" }}>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  backgroundColor: "var(--surface)",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                    wordBreak: "break-all",
                  }}
                >
                  {visualData.pdf_url}
                </div>
                <a
                  href={pdfPageLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--primary)",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    alignSelf: "flex-start",
                  }}
                >
                  Page {visualData.page_number} を開く
                </a>
              </div>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--muted)" }}>
                {pdfDisplayLabel} — Page {visualData.page_number}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
