const lastRequestByIp = new Map<string, number>();
const WINDOW_MS = 10_000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = lastRequestByIp.get(ip);

  if (last !== undefined && now - last < WINDOW_MS) {
    return true;
  }

  lastRequestByIp.set(ip, now);
  return false;
}
