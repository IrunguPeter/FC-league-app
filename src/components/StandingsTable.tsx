import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { StandingsEntry, Format } from '../types';

type Props = {
  standings: StandingsEntry[];
  format: Format;
};

export function StandingsTable({ standings, format }: Props) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Trophy size={20} color="var(--accent-emerald)" /> Standings
      </h3>
      <div className="standings-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {standings.map((entry, idx) => (
                <motion.tr
                  key={entry.player}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={
                    format === 'champions'
                      ? idx < 8
                        ? 'row-highlight-success'
                        : idx < 24
                          ? 'row-highlight-warning'
                          : 'row-highlight-danger'
                      : ''
                  }
                >
                  <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <strong>{entry.player}</strong>
                  </td>
                  <td>{entry.played}</td>
                  <td>{entry.wins}</td>
                  <td>{entry.draws}</td>
                  <td>{entry.losses}</td>
                  <td>{entry.goalsFor - entry.goalsAgainst}</td>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>
                    {entry.points}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
