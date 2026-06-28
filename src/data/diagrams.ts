import type { Annotation } from "@/types/chat";
import DIAGRAMS_JSON from "../../public/images/diagrams/metadata.json";

export interface DiagramHighlight {
  item: string;
  annotation: Annotation;
  description: string;
}

export interface DiagramData {
  id: string;
  name: string;
  url: string;
  highlights: Record<string, DiagramHighlight>;
}

interface RawHighlight {
  item: string;
  annotation: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  explanation?: string;
  description?: string;
}

interface RawDiagram {
  filename: string;
  name: string;
  description: string;
  highlights: Record<string, RawHighlight>;
}

const rawMetadata = DIAGRAMS_JSON as unknown as Record<string, RawDiagram>;
const parsedDiagrams: Record<string, DiagramData> = {};

for (const [key, raw] of Object.entries(rawMetadata)) {
  const highlights: Record<string, DiagramHighlight> = {};
  
  for (const [hKey, hVal] of Object.entries(raw.highlights)) {
    highlights[hKey] = {
      item: hVal.item,
      annotation: hVal.annotation as Annotation,
      description: hVal.explanation || hVal.description || "",
    };
  }

  parsedDiagrams[key] = {
    id: key,
    name: raw.name,
    url: `/images/diagrams/${raw.filename}`,
    highlights,
  };
}

export const DIAGRAMS = parsedDiagrams;
