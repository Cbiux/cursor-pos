import type { CreditEntry } from "./types";

function splitCsvLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function findUrlInCells(cells: string[]): string {
  return cells.find((cell) => /^https?:\/\//i.test(cell))?.trim() ?? "";
}

export function parseCreditsCsv(text: string): CreditEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const delimiter = lines[0]?.includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0] ?? "", delimiter).map((header) =>
    header.toLowerCase(),
  );

  const urlIndex = headers.findIndex(
    (header) =>
      header.includes("url") || header.includes("link") || header === "claim" || header === "credit",
  );
  const labelIndex = headers.findIndex(
    (header) =>
      header.includes("name") ||
      header.includes("label") ||
      header === "email" ||
      header === "guest",
  );

  const hasHeaderRow = urlIndex >= 0 || labelIndex >= 0;
  const startRow = hasHeaderRow ? 1 : 0;
  const entries: CreditEntry[] = [];

  for (let rowIndex = startRow; rowIndex < lines.length; rowIndex += 1) {
    const cells = splitCsvLine(lines[rowIndex] ?? "", delimiter);
    const claimUrl =
      urlIndex >= 0 ? cells[urlIndex]?.trim() ?? "" : findUrlInCells(cells);

    if (!claimUrl) {
      continue;
    }

    const label =
      (labelIndex >= 0 ? cells[labelIndex]?.trim() : "") ||
      cells.find((cell) => cell && cell !== claimUrl)?.trim() ||
      `Credit ${entries.length + 1}`;

    entries.push({
      id: `credit-${rowIndex}-${entries.length}`,
      label,
      claimUrl,
    });
  }

  return entries;
}
