import { useMemo } from 'react';
import { User } from 'firebase/auth';
import type { SessionPayload, MatchResult, CareerStats } from '../types';

export function useCareerStats(
  user: User | null | undefined,
  mySessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[],
): CareerStats {
  return useMemo(() => {
    let w = 0,
      d = 0,
      l = 0,
      g = 0;
    const allMatches: { date: string; result: string }[] = [];
    const currentDisplayName = user?.displayName || '';

    if (!user || !mySessions.length) {
      return { wins: 0, draws: 0, losses: 0, streak: [], totalGoals: 0 };
    }

    mySessions.forEach((s) => {
      const results = s.matchResults;
      if (!results || typeof results !== 'object') return;

      Object.entries(results).forEach(([key, res]) => {
        if (
          !res ||
          res.scoreA === '' ||
          res.scoreB === '' ||
          res.scoreA === undefined ||
          res.scoreB === undefined
        )
          return;

        const parts = key.split('|');
        if (parts.length < 2) return;

        const home = parts[parts.length - 2];
        const away = parts[parts.length - 1];

        const sA = Number(res.scoreA);
        const sB = Number(res.scoreB);

        if (isNaN(sA) || isNaN(sB)) return;

        if (
          currentDisplayName &&
          (home === currentDisplayName || away === currentDisplayName)
        ) {
          const isHome = home === currentDisplayName;
          const userScore = isHome ? sA : sB;
          const oppScore = isHome ? sB : sA;

          g += userScore;
          if (userScore > oppScore) {
            w++;
            allMatches.push({ date: s.createdAt, result: 'W' });
          } else if (userScore < oppScore) {
            l++;
            allMatches.push({ date: s.createdAt, result: 'L' });
          } else {
            d++;
            allMatches.push({ date: s.createdAt, result: 'D' });
          }
        }
      });
    });

    const streak = allMatches
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((m) => m.result)
      .slice(0, 5);

    return { wins: w, draws: d, losses: l, streak, totalGoals: g };
  }, [user, mySessions]);
}
