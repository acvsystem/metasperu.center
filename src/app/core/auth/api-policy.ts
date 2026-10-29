import {centerApiOrigin} from '../runtime-config';
export function isCenterApi(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === centerApiOrigin() &&
      /^\/(?:s1\/center|s2\/auth\/center|s4\/center\/inventory|s5\/center\/resources\/human|s6\/center\/accounting)(?:\/|$)/.test(parsed.pathname);
  } catch { return false; }
}
