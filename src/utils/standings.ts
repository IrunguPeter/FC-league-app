import type { Round, MatchResult, StandingsEntry } from '../types';

export function generateLeagueRounds(players: string[]): Round[] {
  const roster = [...players];
  if (roster.length % 2 !== 0) roster.push('BYE');
  const rounds: Round[] = [];
  const totalRounds = roster.length - 1;
  const half = roster.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const matches: [string, string][] = [];
    for (let i = 0; i < half; i += 1) {
      matches.push([roster[i], roster[roster.length - 1 - i]]);
    }
    rounds.push({ round: `Round ${round + 1}`, matches });
    const fixed = roster[0];
    roster.splice(1, 0, roster.pop()!);
    roster[0] = fixed;
  }
  return rounds;
}

export function generateChampionsStructure(players: string[]): Round[] {
  const roster = [...players];
  if (roster.length % 2 !== 0) roster.push('BYE');
  const rounds: Round[] = [];
  const totalRounds = Math.min(8, roster.length - 1);
  const half = roster.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const matches: [string, string][] = [];
    for (let i = 0; i < half; i += 1) {
      matches.push([roster[i], roster[roster.length - 1 - i]]);
    }
    rounds.push({ round: `Matchday ${round + 1}`, matches });
    const fixed = roster[0];
    roster.splice(1, 0, roster.pop()!);
    roster[0] = fixed;
  }
  return rounds;
}

export function computeStandings(
  players: string[],
  matchResults: Record<string, MatchResult>,
  context: string,
): StandingsEntry[] {
  const standings: Record<string, StandingsEntry> = {};
  players.forEach(
    (p) =>
      (standings[p] = {
        player: p,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }),
  );

  Object.entries(matchResults).forEach(([key, result]) => {
    const [ctx, home, away] = key.split('|');
    if (ctx !== context || result.scoreA === '' || result.scoreB === '') return;
    const sA = Number(result.scoreA);
    const sB = Number(result.scoreB);
    if (standings[home]) {
      standings[home].played++;
      standings[home].goalsFor += sA;
      standings[home].goalsAgainst += sB;
      if (sA > sB) {
        standings[home].wins++;
        standings[home].points += 3;
      } else if (sA < sB) standings[home].losses++;
      else {
        standings[home].draws++;
        standings[home].points += 1;
      }
    }
    if (standings[away]) {
      standings[away].played++;
      standings[away].goalsFor += sB;
      standings[away].goalsAgainst += sA;
      if (sB > sA) {
        standings[away].wins++;
        standings[away].points += 3;
      } else if (sB < sA) standings[away].losses++;
      else {
        standings[away].draws++;
        standings[away].points += 1;
      }
    }
  });

  return Object.values(standings).sort((a, b) =>
    b.points !== a.points
      ? b.points - a.points
      : b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );
}
