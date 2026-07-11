import { motion } from 'framer-motion';
import { MatchCard } from './MatchCard';
import type { Round, MatchResult, Format } from '../types';

type Props = {
  rounds: Round[];
  format: Format;
  matchResults: Record<string, MatchResult>;
  onUpdate: (
    key: string,
    field: 'scoreA' | 'scoreB',
    value: number | '',
  ) => void;
};

export function FixturesList({
  rounds,
  format,
  matchResults,
  onUpdate,
}: Props) {
  return (
    <>
      <h3 className="fixtures-header">Fixtures</h3>
      <div className="grid-auto">
        {rounds.map((round, rIdx) => (
          <motion.div
            key={round.round}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rIdx * 0.08, duration: 0.3 }}
          >
            <div className="round-header">
              <h4>{round.round}</h4>
            </div>
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
