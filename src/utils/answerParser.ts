export type AnswerInlineSegment =
  | { type: "text"; text: string }
  | { type: "strong"; text: string };

export type AnswerBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "orderedList"; items: string[] }
  | { type: "unorderedList"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "rule" }
  | { type: "table"; headers: string[]; rows: string[][]; alignments?: ("left" | "center" | "right" | null)[] };

const MARKDOWN_SHORTCODE_PATTERN = /:([a-z0-9_+-]+):/gi;
const ORDERED_ITEM_PATTERN = /^(\d+)\.\s+(.+)$/;
const UNORDERED_ITEM_PATTERN = /^[-*]\s+(.+)$/;

function normalizeAnswerText(text: string) {
  // Normalize row boundaries for tables that might be inline or missing proper newlines
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/\|[ \t]*\n?[ \t]*\|/g, "|\n|");

  return normalized
    .replace(/[ \t]+(---)(?=[ \t]|$)/g, "\n$1\n")
    .replace(/(^|[^\n])[ \t]+(#{1,6}[ \t]+)/g, "$1\n$2")
    .replace(/(^|[^\n])[ \t]+(>[ \t]*)/g, "$1\n$2")
    .replace(/(^|[^\n])[ \t]+(\d+\.[ \t]+)/g, "$1\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanInlineText(text: string) {
  return text.replace(MARKDOWN_SHORTCODE_PATTERN, "").replace(/[ \t]{2,}/g, " ").trim();
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return false;
  }
  return /^[|:\-\s]+$/.test(trimmed);
}

function isTableStart(lines: string[], idx: number): boolean {
  const currentLine = lines[idx];
  const nextLine = lines[idx + 1];
  if (!currentLine || !nextLine) return false;
  return currentLine.startsWith("|") && isTableSeparator(nextLine);
}

function parseTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith("|")) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
}

function parseAlignments(line: string): ("left" | "center" | "right" | null)[] {
  const cells = parseTableRow(line);
  return cells.map((cell) => {
    const trimmed = cell.trim();
    const starts = trimmed.startsWith(":");
    const ends = trimmed.endsWith(":");
    if (starts && ends) {
      return "center";
    } else if (starts) {
      return "left";
    } else if (ends) {
      return "right";
    }
    return null;
  });
}

export function parseAnswerInline(text: string): AnswerInlineSegment[] {
  return cleanInlineText(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map<AnswerInlineSegment>((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return { type: "strong", text: cleanInlineText(part.slice(2, -2)) };
      }

      return { type: "text", text: cleanInlineText(part) };
    })
    .filter((segment) => segment.text.length > 0);
}

export function parseAnswerBlocks(text: string): AnswerBlock[] {
  const lines = normalizeAnswerText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: AnswerBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: "rule" });
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: cleanInlineText(headingMatch[2]),
      });
      continue;
    }

    if (isTableStart(lines, index)) {
      const headerRow = lines[index];
      const separatorRow = lines[index + 1];
      const alignments = parseAlignments(separatorRow);
      const headers = parseTableRow(headerRow);
      const rows: string[][] = [];

      index += 1; // skip separator row

      while (lines[index + 1] && lines[index + 1].startsWith("|")) {
        index += 1;
        rows.push(parseTableRow(lines[index]));
      }

      blocks.push({
        type: "table",
        headers,
        rows,
        alignments,
      });
      continue;
    }

    const orderedMatch = ORDERED_ITEM_PATTERN.exec(line);
    if (orderedMatch) {
      const items = [cleanInlineText(orderedMatch[2])];
      while (ORDERED_ITEM_PATTERN.test(lines[index + 1] ?? "")) {
        index += 1;
        const nextMatch = ORDERED_ITEM_PATTERN.exec(lines[index]);
        if (nextMatch) items.push(cleanInlineText(nextMatch[2]));
      }
      blocks.push({ type: "orderedList", items });
      continue;
    }

    const unorderedMatch = UNORDERED_ITEM_PATTERN.exec(line);
    if (unorderedMatch) {
      const items = [cleanInlineText(unorderedMatch[1])];
      while (UNORDERED_ITEM_PATTERN.test(lines[index + 1] ?? "")) {
        index += 1;
        const nextMatch = UNORDERED_ITEM_PATTERN.exec(lines[index]);
        if (nextMatch) items.push(cleanInlineText(nextMatch[1]));
      }
      blocks.push({ type: "unorderedList", items });
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines = [cleanInlineText(line.replace(/^>\s?/, "").replace(UNORDERED_ITEM_PATTERN, "$1"))];
      while ((lines[index + 1] ?? "").startsWith(">")) {
        index += 1;
        quoteLines.push(cleanInlineText(lines[index].replace(/^>\s?/, "").replace(UNORDERED_ITEM_PATTERN, "$1")));
      }
      blocks.push({ type: "quote", lines: quoteLines.filter(Boolean) });
      continue;
    }

    const paragraphLines = [line];
    while (
      lines[index + 1] &&
      !/^-{3,}$/.test(lines[index + 1]) &&
      !/^(#{1,6})\s+/.test(lines[index + 1]) &&
      !ORDERED_ITEM_PATTERN.test(lines[index + 1]) &&
      !UNORDERED_ITEM_PATTERN.test(lines[index + 1]) &&
      !lines[index + 1].startsWith(">") &&
      !isTableStart(lines, index + 1)
    ) {
      index += 1;
      paragraphLines.push(lines[index]);
    }
    blocks.push({ type: "paragraph", text: cleanInlineText(paragraphLines.join(" ")) });
  }

  return blocks.filter((block) => {
    if (block.type === "rule") return true;
    if (block.type === "heading" || block.type === "paragraph") return block.text.length > 0;
    if (block.type === "quote") return block.lines.length > 0;
    if (block.type === "table") return block.headers.length > 0 || block.rows.length > 0;
    return block.items.length > 0;
  });
}
