import type { SessionPayload } from '../types';

export const encodePayload = (payload: SessionPayload): string => {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodePayload = (value: string): SessionPayload | null => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as SessionPayload;
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
