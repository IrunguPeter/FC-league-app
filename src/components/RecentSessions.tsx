import { Zap, LayoutDashboard, Trophy, Trash2 } from 'lucide-react';
import type { SessionPayload, MatchResult } from '../types';

type Props = {
  sessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[];
  onSelect: (session: SessionPayload) => void;
  onDelete: (e: React.MouseEvent, sessionId: string) => void;
};

export function RecentSessions({ sessions, onSelect, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3
        style={{
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <Zap size={18} color="var(--accent-gold)" /> Recent Activity
      </h3>
      {sessions.length > 0 ? (
        <div className="recent-sessions-container">
          {sessions.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="card-interactive"
              style={{
                padding: '1.25rem',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1rem',
              }}
              onClick={() => onSelect(s)}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0.85rem',
                  background:
                    s.format === 'league'
                      ? 'var(--accent-gold-light)'
                      : 'var(--accent-purple-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {s.format === 'league' ? (
                  <LayoutDashboard size={18} color="var(--accent-gold)" />
                ) : (
                  <Trophy size={18} color="var(--accent-purple)" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '1rem' }}>
                  {s.title}
                </h4>
                <p
                  className="meta-text"
                  style={{ fontSize: '0.8rem', margin: 0 }}
                >
                  {new Date(s.createdAt).toLocaleDateString()} &middot;{' '}
                  {s.players.length} players
                </p>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={(e) => onDelete(e, s.id)}
                style={{
                  color: 'var(--accent-red)',
                  flexShrink: 0,
                }}
                title="Delete Session"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No sessions yet. Host your first game to see it here!
        </div>
      )}
    </div>
  );
}
