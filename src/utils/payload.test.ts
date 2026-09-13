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

  it('keeps paid league settings in the share payload without unsafe URL characters', () => {
    const paidPayload = {
      ...payload,
      paid: {
        enabled: true,
        entryFee: 100,
        currency: 'KES' as const,
        platformFeePercent: 25 as const,
        playerPaysProcessingFees: true,
        prizePool: 150,
        payoutStatus: 'not-ready' as const,
      },
    };
    const encoded = encodePayload(paidPayload);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodePayload(encoded)).toEqual(paidPayload);
    expect(Math.round(100 * 2 * 0.75)).toBe(150);
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
