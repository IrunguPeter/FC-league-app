import { Zap } from 'lucide-react';
import type { MatchResult } from '../types';

type Props = {
  home: string;
  away: string;
  matchKey: string;
  result?: MatchResult;
  onUpdate: (key: string, field: 'scoreA' | 'scoreB', value: number | '') => void;
};

export function MatchCard({ home, away, matchKey, result, onUpdate }: Props) {
  const isBye = home === 'BYE' || away === 'BYE';
  const opponent = home === 'BYE' ? away : home;

  if (isBye) {
    return (
      <div
        key={matchKey}
        className="match-card"
        style={{ opacity: 0.7, borderStyle: 'dashed' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span className="team-name">{opponent}</span>
          <div
            className="badge"
            style={{
              margin: 0,
              background: 'rgba(0,0,0,0.05)',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <Zap size={14} /> BYE / RESTING
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-card">
      <div className="match-grid">
        <span className="team-name">{home}</span>
        <div className="score-display">
          <input
            className="score-input"
            type="number"
            value={result?.scoreA ?? ''}
            onChange={(e) =>
              onUpdate(
                matchKey,
                'scoreA',
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
          />
          <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
            :
          </span>
          <input
            className="score-input"
            type="number"
            value={result?.scoreB ?? ''}
            onChange={(e) =>
              onUpdate(
                matchKey,
                'scoreB',
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
          />
        </div>
        <span className="team-name">{away}</span>
      </div>
    </div>
  );
}
