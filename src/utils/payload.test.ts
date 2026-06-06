import { describe, it, expect } from 'vitest';
import {
  encodePayload,
  decodePayload,
  normalizePlayers,
  randomId,
} from './payload';
import type { SessionPayload } from '../types';

describe('encodePayload / decodePayload', () => {
  const payload: SessionPayload = {
    id: 'test-123',
    title: 'Test Session',
    format: 'league',
    players: ['Alice', 'Bob'],
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('round-trips a session payload', () => {
    const encoded = encodePayload(payload);
    const decoded = decodePayload(encoded);
    expect(decoded).toEqual(payload);
  });

  it('returns null for invalid input', () => {
    expect(decodePayload('not-base64')).toBeNull();
    expect(decodePayload('')).toBeNull();
  });
});

describe('normalizePlayers', () => {
  it('splits by newlines', () => {
    expect(normalizePlayers('Alice\nBob\nCharlie')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('splits by commas', () => {
    expect(normalizePlayers('Alice,Bob,Charlie')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('trims whitespace', () => {
    expect(normalizePlayers('  Alice , Bob \n Charlie ')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('filters empty entries', () => {
    expect(normalizePlayers('Alice\n\nBob\n')).toEqual(['Alice', 'Bob']);
  });
});

describe('randomId', () => {
  it('generates a non-empty string', () => {
    expect(randomId()).toBeTruthy();
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => randomId()));
    expect(ids.size).toBe(100);
  });
});
