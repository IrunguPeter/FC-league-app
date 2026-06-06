import { motion } from 'framer-motion';
import { LayoutDashboard, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { SessionPayload, MatchResult, StandingsEntry, Round } from '../types';
import { StandingsTable } from '../components/StandingsTable';
import { SharePanel } from '../components/SharePanel';
import { FixturesList } from '../components/FixturesList';

type Props = {
  sessionPayload: SessionPayload;
  user: User | null | undefined;
  mySessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[];
  matchResults: Record<string, MatchResult>;
  standings: StandingsEntry[];
  rounds: Round[];
  sessionUrl: string;
  onUpdateMatch: (key: string, field: 'scoreA' | 'scoreB', value: number | '') => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void;
  onBackToHome: () => void;
};

export function SessionDashboard({
  sessionPayload,
  user,
  mySessions,
  matchResults,
  standings,
  rounds,
  sessionUrl,
  onUpdateMatch,
  onDeleteSession,
  onBackToHome,
}: Props) {
  return (
    <motion.div
      key="dashboard"
      className="glass-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <LayoutDashboard size={24} color="var(--accent-blue)" />
            <h2 style={{ margin: 0 }}>{sessionPayload.title}</h2>
          </div>
          <p className="meta-text">
            {sessionPayload.format === 'league'
              ? 'League'
              : 'Champions League Swiss'}{' '}
            • {sessionPayload.players.length} Players
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {user && mySessions.some((s) => s.id === sessionPayload.id) && (
            <button
              className="btn btn-ghost"
              onClick={async (e) => {
                await onDeleteSession(e as React.MouseEvent, sessionPayload.id);
                onBackToHome();
              }}
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={20} /> Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onBackToHome}>
            New Session
          </button>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: '3rem' }}>
        <StandingsTable standings={standings} format={sessionPayload.format} />
        <SharePanel sessionUrl={sessionUrl} />
      </div>

      <FixturesList
        rounds={rounds}
        format={sessionPayload.format}
        matchResults={matchResults}
        onUpdate={onUpdateMatch}
      />
    </motion.div>
  );
}
