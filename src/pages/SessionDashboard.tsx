import { motion } from 'framer-motion';
import { LayoutDashboard, Trash2, ArrowLeft } from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  SessionPayload,
  MatchResult,
  StandingsEntry,
  Round,
} from '../types';
import { StandingsTable } from '../components/StandingsTable';
import { SharePanel } from '../components/SharePanel';
import { FixturesList } from '../components/FixturesList';

type Props = {
  sessionPayload: SessionPayload;
  user: User | null | undefined;
  mySessions: (SessionPayload & {
    matchResults: Record<string, MatchResult>;
  })[];
  matchResults: Record<string, MatchResult>;
  standings: StandingsEntry[];
  rounds: Round[];
  sessionUrl: string;
  onUpdateMatch: (
    key: string,
    field: 'scoreA' | 'scoreB',
    value: number | '',
  ) => void;
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title-row">
            <LayoutDashboard size={22} color="var(--accent-blue)" />
            <h2 className="session-title">{sessionPayload.title}</h2>
          </div>
          <p className="meta-text session-meta">
            {sessionPayload.format === 'league'
              ? 'League'
              : 'Champions League Swiss'}{' '}
            &middot; {sessionPayload.players.length} Players
          </p>
        </div>
        <div className="dashboard-actions">
          {user && mySessions.some((s) => s.id === sessionPayload.id) && (
            <button
              className="btn btn-ghost"
              onClick={async (e) => {
                await onDeleteSession(e as React.MouseEvent, sessionPayload.id);
                onBackToHome();
              }}
              style={{ color: 'var(--accent-red)' }}
            >
              <Trash2 size={18} /> Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onBackToHome}>
            <ArrowLeft size={18} /> New Session
          </button>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: '2.5rem' }}>
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
