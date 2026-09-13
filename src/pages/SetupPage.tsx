import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Clipboard, Copy, Link2, Plus, Swords, Users, Zap } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { decodePayload } from '../utils/payload';
import type { Format, SessionPayload, MatchResult } from '../types';

type Props = {
  mode: 'host' | 'join';
  onBack: () => void;
  title: string;
  onTitleChange: (v: string) => void;
  format: Format;
  onFormatChange: (v: Format) => void;
  playerText: string;
  onPlayerTextChange: (v: string) => void;
  players: string[];
  onHost: () => void;
  joinName: string;
  onJoinNameChange: (v: string) => void;
  joinMessage: string;
  onJoinMessageChange: (v: string) => void;
  onSessionLoaded: (payload: SessionPayload, results: Record<string, MatchResult>) => void;
};

export function SetupPage({
  mode, onBack, title, onTitleChange, format, onFormatChange, playerText,
  onPlayerTextChange, players, onHost, joinName, onJoinNameChange,
  joinMessage, onJoinMessageChange, onSessionLoaded,
}: Props) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    const rawInvite = joinName.split('session=')[1] || joinName.trim();
    let invite = rawInvite;
    try { invite = decodeURIComponent(rawInvite); } catch { /* Keep the raw value for the validation message. */ }
    const id = joinName.includes('session=')
      ? decodePayload(invite)?.id
      : invite;
    if (!id) { onJoinMessageChange('Enter a valid room code or session link.'); setIsJoining(false); return; }
    try {
      const sessionSnap = await getDoc(doc(db, 'sessions', id));
      if (sessionSnap.exists()) {
        const data = sessionSnap.data() as SessionPayload & { matchResults: Record<string, MatchResult> };
        onSessionLoaded(data, data.matchResults || {});
      } else {
        const maybePayload = decodePayload(invite);
        if (maybePayload) onSessionLoaded(maybePayload, {});
        else onJoinMessageChange('Room not found. Check the code and try again.');
      }
    } catch {
      const maybePayload = decodePayload(invite);
      if (maybePayload) onSessionLoaded(maybePayload, {});
      else onJoinMessageChange('Could not load that room. Check your connection.');
    } finally { setIsJoining(false); }
  };

  return (
    <motion.div className="setup-page" key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Back home</button>
      <div className="setup-heading">
        <span className="setup-kicker">{mode === 'host' ? 'Create a room' : 'Enter a room'}</span>
        <h1>{mode === 'host' ? 'Set up your tournament.' : 'Join the squad.'}</h1>
        <p>{mode === 'host' ? 'Add your players, pick a format, and get the first match on screen.' : 'Paste the invite link or enter the room code from your host.'}</p>
      </div>
      {mode === 'host' ? (
        <div className="setup-layout">
          <div className="setup-form-card">
            <div className="form-group"><label>Tournament name</label><input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Friday Night FC" autoFocus /></div>
            <div className="form-group"><label>Format</label><div className="format-options">
              <button type="button" className={`format-option ${format === 'league' ? 'selected' : ''}`} onClick={() => onFormatChange('league')}><Swords size={18} /><span><b>Round robin</b><small>Everyone plays everyone</small></span></button>
              <button type="button" className={`format-option ${format === 'champions' ? 'selected' : ''}`} onClick={() => onFormatChange('champions')}><Zap size={18} /><span><b>Champions League</b><small>Swiss-style competitive rounds</small></span></button>
            </div></div>
            <div className="form-group"><div className="label-row"><label>Players</label><span>{players.length} added</span></div><textarea rows={6} value={playerText} onChange={(e) => onPlayerTextChange(e.target.value)} placeholder={'Marcus\nJay\nAisha\nSam'} /></div>
            <button className="btn btn-primary btn-large setup-submit" onClick={onHost} disabled={players.length < 2}><Plus size={19} /> Create tournament</button>
            {players.length < 2 && <p className="form-hint">Add at least two players to start.</p>}
          </div>
          <aside className="setup-aside"><div className="aside-icon"><Users size={20} /></div><b>Invite the room after setup</b><p>You’ll get a share link and QR code to send to everyone playing.</p><div className="aside-rule" /><span><Clipboard size={14} /> Works on phones, tablets, and TV screens</span></aside>
        </div>
      ) : (
        <div className="join-card"><div className="join-icon"><Link2 size={22} /></div><div className="form-group"><label>Room code or invite link</label><input value={joinName} onChange={(e) => { onJoinNameChange(e.target.value); onJoinMessageChange(''); }} onKeyDown={(e) => e.key === 'Enter' && handleJoin()} placeholder="Paste a link or room code" autoFocus /></div><button className="btn btn-primary btn-large setup-submit" onClick={handleJoin} disabled={isJoining}><Zap size={19} /> {isJoining ? 'Loading room…' : 'Join tournament'}</button>{joinMessage && <p className="error-message">{joinMessage}</p>}<p className="join-help"><Copy size={14} /> Ask the host to copy the invite link from the Share panel.</p></div>
      )}
    </motion.div>
  );
}
