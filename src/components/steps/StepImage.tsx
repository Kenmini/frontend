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
        borderRadius: "11px",
        overflow: "hidden",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface2)",
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
      <AnnotationOverlay annotation={step.annotation} markerId={markerId} />
    </div>
  );
}
