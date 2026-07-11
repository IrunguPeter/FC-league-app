import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { StandingsEntry, Format } from '../types';

type Props = {
  standings: StandingsEntry[];
  format: Format;
};

export function StandingsTable({ standings, format }: Props) {
  return (
    <div className="standings-panel">
      <h3 className="standings-title">
        <Trophy size={18} color="var(--accent-emerald)" /> Standings
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
                  <td
                    style={{
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td>
                    <strong style={{ fontWeight: 700 }}>{entry.player}</strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {entry.played}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {entry.wins}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {entry.draws}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {entry.losses}
                  </td>
                  <td
                    style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                  >
                    {entry.goalsFor - entry.goalsAgainst > 0 && '+'}
                    {entry.goalsFor - entry.goalsAgainst}
                  </td>
                  <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
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
