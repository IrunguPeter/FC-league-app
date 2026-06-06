import { motion } from 'framer-motion';
import { MatchCard } from './MatchCard';
import type { Round, MatchResult, Format } from '../types';

type Props = {
  rounds: Round[];
  format: Format;
  matchResults: Record<string, MatchResult>;
  onUpdate: (key: string, field: 'scoreA' | 'scoreB', value: number | '') => void;
};

export function FixturesList({ rounds, format, matchResults, onUpdate }: Props) {
  return (
    <>
      <h3 style={{ marginBottom: '1.5rem' }}>Fixtures</h3>
      <div className="grid-auto">
        {rounds.map((round, rIdx) => (
          <motion.div
            key={round.round}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rIdx * 0.1 }}
          >
            <h4
              style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}
            >
              {round.round}
            </h4>
            {round.matches.map(([h, a]) => {
              const key = `${format === 'league' ? '' : 'champions-league'}|${h}|${a}`;
              const res = matchResults[key];
              return (
                <MatchCard
                  key={key}
                  home={h}
                  away={a}
                  matchKey={key}
                  result={res}
                  onUpdate={onUpdate}
                />
              );
            })}
          </motion.div>
        ))}
      </div>
    </>
  );
}
