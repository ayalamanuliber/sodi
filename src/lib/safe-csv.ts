/** RFC-style quoting plus neutralization of spreadsheet formulas, even after whitespace. */
export function safeCsvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
