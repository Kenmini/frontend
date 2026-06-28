"use client";

import { useState } from "react";
import { DeviceDiagram } from "@/components/DeviceDiagram";
import type { Step } from "@/types/chat";
import { AnnotationOverlay } from "./AnnotationOverlay";

interface StepImageProps {
  step: Step;
  markerId: string;
  dark: boolean;
}

export function StepImage({ step, markerId, dark }: StepImageProps) {
  const [isLoading, setIsLoading] = useState(Boolean(step.imageUrl));
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(step.imageUrl && !hasError);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3/2",
        // We do NOT set overflow: "hidden" here so that any tooltips
        // inside AnnotationOverlay can render outside the image boundaries.
        border: "1px solid var(--border)",
        borderRadius: "11px",
        backgroundColor: "var(--surface2)",
      }}
    >
      {/* Inner container to clip the image/diagram itself with overflow: hidden */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {showImage ? (
          <>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  fontSize: "12.5px",
                  backgroundColor: "var(--surface2)",
                  zIndex: 1,
                }}
              >
                Loading image...
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.imageUrl}
              alt=""
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </>
        ) : (
          <DeviceDiagram dark={dark} />
        )}
        {hasError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: "12.5px",
              backgroundColor: "var(--surface2)",
            }}
          >
            Image unavailable
          </div>
        )}
      </div>

      {/* Overlay rendered outside the inner clip wrapper so tooltips can float freely */}
      <AnnotationOverlay
        annotation={step.annotation}
        label={step.annotationLabel}
        description={step.annotationDescription}
        markerId={markerId}
      />
    </div>
  );
}
