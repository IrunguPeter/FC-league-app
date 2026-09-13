import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Copy, Expand, LayoutDashboard, Monitor, Radio, Share2, Trash2, Trophy, Users } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { SessionPayload, MatchResult, StandingsEntry, Round } from '../types';
import { StandingsTable } from '../components/StandingsTable';
import { SharePanel } from '../components/SharePanel';
import { FixturesList } from '../components/FixturesList';

type Props = {
  sessionPayload: SessionPayload; user: User | null | undefined;
  mySessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[];
  matchResults: Record<string, MatchResult>; standings: StandingsEntry[]; rounds: Round[]; sessionUrl: string;
  onUpdateMatch: (key: string, field: 'scoreA' | 'scoreB', value: number | '') => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void; onBackToHome: () => void;
};

export function SessionDashboard({ sessionPayload, user, mySessions, matchResults, standings, rounds, sessionUrl, onUpdateMatch, onDeleteSession, onBackToHome }: Props) {
  const [tvMode, setTvMode] = useState(false);
  const formatPrefix = sessionPayload.format === 'league' ? '' : 'champions-league';
  const fixtures = useMemo(() => rounds.flatMap((round) => round.matches.map(([home, away]) => ({ round: round.round, home, away, key: `${formatPrefix}|${home}|${away}` }))).filter((match) => match.home !== 'BYE' && match.away !== 'BYE'), [rounds, formatPrefix]);
  const completed = fixtures.filter(({ key }) => matchResults[key]?.scoreA !== '' && matchResults[key]?.scoreA !== undefined && matchResults[key]?.scoreB !== '' && matchResults[key]?.scoreB !== undefined).length;
  const nextMatch = fixtures.find(({ key }) => !matchResults[key] || matchResults[key]?.scoreA === '' || matchResults[key]?.scoreB === '');

  if (tvMode) return <div className="tv-mode"><div className="tv-topbar"><div className="header-brand"><span className="live-indicator" /><span className="header-brand-text">FC League</span></div><span className="tv-room"><Radio size={14} /> LIVE · {sessionPayload.title}</span><button className="btn btn-ghost" onClick={() => setTvMode(false)}><Expand size={15} /> Exit TV mode</button></div><div className="tv-heading"><span className="setup-kicker">Tournament live</span><h1>{sessionPayload.title}</h1><p>{completed} of {fixtures.length} matches complete · {sessionPayload.players.length} players</p></div><div className="tv-grid"><div className="tv-next"> <span className="preview-kicker">Up next</span>{nextMatch ? <><strong>{nextMatch.home}<em>vs</em>{nextMatch.away}</strong><span>{nextMatch.round}</span></> : <><strong>Tournament complete</strong><span>All results are in</span></>}</div><div className="tv-table"><div className="tv-table-heading"><Trophy size={16} /> Live standings</div>{standings.slice(0, 8).map((entry, index) => <div className={`tv-row ${index === 0 ? 'leader' : ''}`} key={entry.player}><span>{index + 1}</span><b>{entry.player}</b><span>{entry.played} played</span><strong>{entry.points} pts</strong></div>)}</div></div></div>;

  return (
    <motion.div key="dashboard" className="session-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="dashboard-header"><div><div className="session-breadcrumb"><span className="live-pill"><Radio size={12} /> LIVE ROOM</span><span>/{sessionPayload.format === 'league' ? 'round robin' : 'champions league'}</span></div><div className="dashboard-title-row"><LayoutDashboard size={21} color="var(--accent-gold)" /><h1 className="session-title">{sessionPayload.title}</h1></div><p className="meta-text session-meta"><Users size={14} /> {sessionPayload.players.length} players <span>·</span> {completed}/{fixtures.length} matches complete</p></div><div className="dashboard-actions"><button className="btn btn-ghost" onClick={() => setTvMode(true)}><Monitor size={16} /> TV mode</button>{user && mySessions.some((s) => s.id === sessionPayload.id) && <button className="btn btn-ghost danger-action" onClick={async (e) => { await onDeleteSession(e as React.MouseEvent, sessionPayload.id); onBackToHome(); }}><Trash2 size={16} /> Delete</button>}<button className="btn btn-ghost" onClick={onBackToHome}><ArrowLeft size={16} /> Home</button></div></div>
      <div className="next-match-banner"><div><span className="preview-kicker">{nextMatch ? 'Next match' : 'Tournament complete'}</span><strong>{nextMatch ? <>{nextMatch.home} <em>vs</em> {nextMatch.away}</> : 'The winner is decided.'}</strong>{nextMatch && <small>{nextMatch.round} · Enter the result below</small>}</div><div className="next-match-icon"><CheckCircle2 size={23} /></div></div>
      <div className="dashboard-grid"><div className="dashboard-main"><StandingsTable standings={standings} format={sessionPayload.format} /><FixturesList rounds={rounds} format={sessionPayload.format} matchResults={matchResults} onUpdate={onUpdateMatch} /></div><aside className="dashboard-side"><SharePanel sessionUrl={sessionUrl} /><div className="room-card"><div className="room-card-heading"><Share2 size={16} /> Host tools</div><button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(sessionUrl)}><Copy size={15} /> Copy invite link</button><button className="btn btn-ghost" onClick={() => setTvMode(true)}><Monitor size={15} /> Open TV display</button></div></aside></div>
    </motion.div>
  );
}
