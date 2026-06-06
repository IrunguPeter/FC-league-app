import { describe, it, expect } from 'vitest';
import {
  generateLeagueRounds,
  generateChampionsStructure,
  computeStandings,
} from './standings';
import type { MatchResult } from '../types';

describe('generateLeagueRounds', () => {
  it('generates correct number of rounds for even players', () => {
    const players = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const rounds = generateLeagueRounds(players);
    expect(rounds).toHaveLength(3);
  });

  it('generates correct number of rounds for odd players', () => {
    const players = ['Alice', 'Bob', 'Charlie'];
    const rounds = generateLeagueRounds(players);
    expect(rounds).toHaveLength(3);
    // odd players get a BYE
    expect(rounds[0].matches.some(([h, a]) => h === 'BYE' || a === 'BYE')).toBe(
      true,
    );
  });

  it('every player plays each round', () => {
    const players = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const rounds = generateLeagueRounds(players);
    for (const round of rounds) {
      const involved = new Set<string>();
      for (const [h, a] of round.matches) {
        involved.add(h);
        involved.add(a);
      }
      expect(involved.size).toBe(4);
    }
  });
});

describe('generateChampionsStructure', () => {
  it('caps at 8 matchdays', () => {
    const players = Array.from({ length: 20 }, (_, i) => `P${i + 1}`);
    const rounds = generateChampionsStructure(players);
    expect(rounds.length).toBeLessThanOrEqual(8);
  });

  it('works with small player count', () => {
    const players = ['Alice', 'Bob'];
    const rounds = generateChampionsStructure(players);
    expect(rounds).toHaveLength(1);
  });
});

describe('computeStandings', () => {
  const players = ['Alice', 'Bob', 'Charlie'];

  it('returns all players with zero stats initially', () => {
    const results: Record<string, MatchResult> = {};
    const standings = computeStandings(players, results, '');
    expect(standings).toHaveLength(3);
    standings.forEach((entry) => {
      expect(entry.played).toBe(0);
      expect(entry.points).toBe(0);
    });
  });

  it('awards 3 points for a win', () => {
    const results: Record<string, MatchResult> = {
      '|Alice|Bob': { scoreA: 3, scoreB: 1 },
    };
    const standings = computeStandings(players, results, '');
    const alice = standings.find((s) => s.player === 'Alice');
    const bob = standings.find((s) => s.player === 'Bob');
    expect(alice?.points).toBe(3);
    expect(alice?.wins).toBe(1);
    expect(bob?.points).toBe(0);
    expect(bob?.losses).toBe(1);
  });

  it('awards 1 point each for a draw', () => {
    const results: Record<string, MatchResult> = {
      '|Alice|Bob': { scoreA: 2, scoreB: 2 },
    };
    const standings = computeStandings(players, results, '');
    const alice = standings.find((s) => s.player === 'Alice');
    const bob = standings.find((s) => s.player === 'Bob');
    expect(alice?.points).toBe(1);
    expect(alice?.draws).toBe(1);
    expect(bob?.points).toBe(1);
    expect(bob?.draws).toBe(1);
  });

  it('sorts by points then goal difference', () => {
    const results: Record<string, MatchResult> = {
      '|Alice|Bob': { scoreA: 5, scoreB: 0 },
      '|Charlie|Bob': { scoreA: 2, scoreB: 1 },
    };
    const standings = computeStandings(players, results, '');
    // Alice: 3pts +5GD, Charlie: 3pts +1GD, Bob: 0pts
    expect(standings[0].player).toBe('Alice');
    expect(standings[1].player).toBe('Charlie');
    expect(standings[2].player).toBe('Bob');
  });

  it('filters by context', () => {
    const results: Record<string, MatchResult> = {
      '|Alice|Bob': { scoreA: 1, scoreB: 0 },
      'champions-league|Charlie|Bob': { scoreA: 2, scoreB: 2 },
    };
    const leagueStandings = computeStandings(players, results, '');
    const clStandings = computeStandings(
      players,
      results,
      'champions-league',
    );

    // League context should only include the first match
    const leagueAlice = leagueStandings.find((s) => s.player === 'Alice');
    expect(leagueAlice?.points).toBe(3);

    // Champions context should only include the second match
    const clCharlie = clStandings.find((s) => s.player === 'Charlie');
    expect(clCharlie?.points).toBe(1);
  });
});
