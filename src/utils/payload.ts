import type { SessionPayload } from '../types';

export const encodePayload = (payload: SessionPayload): string =>
  btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

export const decodePayload = (value: string): SessionPayload | null => {
  try {
    const decoded = decodeURIComponent(escape(atob(value)));
    return JSON.parse(decoded) as SessionPayload;
  } catch {
    return null;
  }
};

export const randomId = () =>
  crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);

export const normalizePlayers = (text: string): string[] =>
  text
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean);
