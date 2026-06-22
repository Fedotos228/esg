export function sanitizeText(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 200);
}
