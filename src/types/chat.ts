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
  imageId?: string;
  imageUrl?: string;
}

export interface Citation {
  source: string;
  snippet: string;
}

export interface VisualData {
  figure_id: string | null;
  highlight_item: string | null;
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
