import { z } from 'zod';

export type Format = 'league' | 'champions';

export const sessionPayloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  format: z.enum(['league', 'champions']),
  players: z.array(z.string()),
  createdAt: z.string(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const matchResultSchema = z.object({
  scoreA: z.union([z.number(), z.literal('')]),
  scoreB: z.union([z.number(), z.literal('')]),
});

export type MatchResult = z.infer<typeof matchResultSchema>;

export type Round = { round: string; matches: [string, string][] };

export type StandingsEntry = {
  player: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type CareerStats = {
  wins: number;
  draws: number;
  losses: number;
  streak: string[];
  totalGoals: number;
};

export const firestoreSessionSchema = sessionPayloadSchema.extend({
  matchResults: z.record(z.string(), matchResultSchema).optional(),
  ownerId: z.string().optional(),
});

export type FirestoreSession = z.infer<typeof firestoreSessionSchema>;
