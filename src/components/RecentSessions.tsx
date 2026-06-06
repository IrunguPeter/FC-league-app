import { Zap, LayoutDashboard, Trophy, Trash2 } from 'lucide-react';
import type { SessionPayload, MatchResult } from '../types';

type Props = {
  sessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[];
  onSelect: (session: SessionPayload) => void;
  onDelete: (e: React.MouseEvent, sessionId: string) => void;
};

export function RecentSessions({ sessions, onSelect, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3
        style={{
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Zap size={20} color="var(--accent-blue)" /> Recent Activity
      </h3>
      {sessions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="card-interactive"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1.5rem',
              }}
              onClick={() => onSelect(s)}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '1rem',
                  background:
                    s.format === 'league'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.format === 'league' ? (
                  <LayoutDashboard size={20} color="var(--accent-blue)" />
                ) : (
                  <Trophy size={20} color="var(--accent-purple)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>
                  {s.title}
                </h4>
                <p className="meta-text" style={{ fontSize: '0.85rem' }}>
                  {new Date(s.createdAt).toLocaleDateString()} •{' '}
                  {s.players.length} players
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={(e) => onDelete(e, s.id)}
                style={{
                  padding: '0.5rem',
                  color: '#ef4444',
                  borderColor: 'transparent',
                  background: 'transparent',
                }}
                title="Delete Session"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          No sessions yet. Host your first game to see it here!
        </div>
      )}
    </div>
  );
}
