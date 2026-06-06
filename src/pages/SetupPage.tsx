import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Zap } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { decodePayload } from '../utils/payload';
import type { Format, SessionPayload, MatchResult } from '../types';

type Props = {
  mode: 'host' | 'join';
  onBack: () => void;
  // Host state
  title: string;
  onTitleChange: (v: string) => void;
  format: Format;
  onFormatChange: (v: Format) => void;
  playerText: string;
  onPlayerTextChange: (v: string) => void;
  players: string[];
  onHost: () => void;
  // Join state
  joinName: string;
  onJoinNameChange: (v: string) => void;
  joinMessage: string;
  onJoinMessageChange: (v: string) => void;
  onSessionLoaded: (
    payload: SessionPayload,
    results: Record<string, MatchResult>,
  ) => void;
};

export function SetupPage({
  mode,
  onBack,
  title,
  onTitleChange,
  format,
  onFormatChange,
  playerText,
  onPlayerTextChange,
  players,
  onHost,
  joinName,
  onJoinNameChange,
  joinMessage,
  onJoinMessageChange,
  onSessionLoaded,
}: Props) {
  const handleJoin = async () => {
    const id = joinName.split('session=')[1]
      ? decodePayload(joinName.split('session=')[1])?.id
      : joinName;
    if (!id) {
      onJoinMessageChange('Invalid session code.');
      return;
    }

    try {
      const sessionSnap = await getDoc(doc(db, 'sessions', id));
      if (sessionSnap.exists()) {
        const data = sessionSnap.data() as SessionPayload & {
          matchResults: Record<string, MatchResult>;
        };
        onSessionLoaded(data, data.matchResults || {});
      } else {
        const maybePayload = decodePayload(
          joinName.split('session=')[1] || joinName,
        );
        if (maybePayload) onSessionLoaded(maybePayload, {});
        else onJoinMessageChange('Session not found.');
      }
    } catch {
      const maybePayload = decodePayload(
        joinName.split('session=')[1] || joinName,
      );
      if (maybePayload) onSessionLoaded(maybePayload, {});
      else onJoinMessageChange('Error loading session.');
    }
  };

  return (
    <motion.div
      key="setup"
      className="glass-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <button
        className="btn btn-ghost"
        onClick={onBack}
        style={{ marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Back
      </button>

      {mode === 'host' ? (
        <>
          <h2>Session Setup</h2>
          <div className="form-group">
            <label>Session Title</label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Champions Night"
            />
          </div>
          <div className="form-group">
            <label>Format</label>
            <select
              value={format}
              onChange={(e) => onFormatChange(e.target.value as Format)}
            >
              <option value="league">Standard League</option>
              <option value="champions">Champions League (Swiss)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Players (one per line)</label>
            <textarea
              rows={5}
              value={playerText}
              onChange={(e) => onPlayerTextChange(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={onHost}
            disabled={players.length < 2}
          >
            <Plus size={20} /> Create Session
          </button>
        </>
      ) : (
        <>
          <h2>Join Session</h2>
          <div className="form-group">
            <label>Session Link or Code</label>
            <input
              value={joinName}
              onChange={(e) => onJoinNameChange(e.target.value)}
              placeholder="Paste URL or ID"
            />
          </div>
          <button className="btn btn-primary" onClick={handleJoin}>
            <Zap size={20} /> Load Session
          </button>
          {joinMessage && (
            <p style={{ marginTop: '1rem', color: '#ef4444' }}>
              {joinMessage}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}
