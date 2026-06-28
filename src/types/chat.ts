export interface Annotation {
  type: "circle" | "highlight" | "arrow";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Step {
  id: string;
  title: string | { ja: string; en: string };
  text: string | { ja: string; en: string };
  annotation?: Annotation;
  /** Human-readable name of the annotated item (e.g. "VACUUM STATE") */
  annotationLabel?: string;
  /** Explanation shown in the tooltip when the user clicks the annotation */
  annotationDescription?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface Citation {
  source: string;
  snippet: string;
}

export interface StaticImage {
  image_url: string;
  filename: string;
  name: string;
  description: string;
  page_number: number;
  highlights: Record<string, {
    item: string;
    annotation?: Annotation;
    explanation?: string;
  }>;
}

export interface VisualData {
  figure_id: string | null;
  highlight_item: string | null;
  image_url?: string | null;
  source?: string | null;
  page_number?: number | null;
  caption?: string | null;
  static_images?: StaticImage[];
  pdf_url?: string | null;
}

export interface ChatResponse {
  answer: string | { ja: string; en: string };
  steps: Step[];
  warnings?: string[] | string;
  slackContext?: string;
  nextStepHint?: string | null;
  citations?: Citation[];
  confidence?: number;
  isGap?: boolean;
  visualData?: VisualData | null;
}

export interface ChatRequestOptions {
  sessionId?: string;
  activeFigureId?: string;
  lang?: "ja" | "en";
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  steps?: Step[];
  warnings?: string[] | string;
  slackContext?: string;
  nextStepHint?: string | null;
  citations?: Citation[];
  confidence?: number;
  visualData?: VisualData | null;
}
