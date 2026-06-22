/**
 * Lightweight user-agent parser to give each session a human-readable
 * "Browser on OS" label. Intentionally simple — no external dependency — since
 * we only need a friendly label, not exhaustive detection.
 */

function detectBrowser(ua: string): string {
  // Order matters: Edge/Opera spoof Chrome, Chrome spoofs Safari.
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/chrome\/|crios\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua)) return "Safari";
  return "";
}

function detectOS(ua: string): string {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os x|macintosh/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "";
}

export function parseUserAgent(userAgent?: string | null): string {
  if (!userAgent) return "Unknown device";

  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;
  return "Unknown device";
}
