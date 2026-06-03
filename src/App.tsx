import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode.react';
import { 
  Trophy, 
  Users, 
  Share2, 
  Plus, 
  ChevronLeft, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  LayoutDashboard,
  Zap,
  Gamepad2,
  TrendingUp,
  ShieldCheck,
  Globe
} from 'lucide-react';

// --- Types ---
type Format = 'league' | 'champions';

type SessionPayload = {
  id: string;
  title: string;
  format: Format;
  players: string[];
  createdAt: string;
};

type Round = { round: string; matches: [string, string][] };

type StandingsEntry = {
  player: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

type MatchResult = { scoreA: number | ''; scoreB: number | '' };

// --- Constants ---
const STORAGE_KEY = 'fc-league-app';

// --- Utilities ---
const encodePayload = (payload: SessionPayload): string => 
  btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

const decodePayload = (value: string): SessionPayload | null => {
  try {
    const decoded = decodeURIComponent(escape(atob(value)));
    return JSON.parse(decoded) as SessionPayload;
  } catch { return null; }
};

const randomId = () => crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);

const normalizePlayers = (text: string): string[] => 
  text.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);

function generateLeagueRounds(players: string[]): Round[] {
  const roster = [...players];
  if (roster.length % 2 !== 0) roster.push('BYE');
  const rounds: Round[] = [];
  const totalRounds = roster.length - 1;
  const half = roster.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const matches: [string, string][] = [];
    for (let i = 0; i < half; i += 1) {
      matches.push([roster[i], roster[roster.length - 1 - i]]);
    }
    rounds.push({ round: `Round ${round + 1}`, matches });
    const fixed = roster[0];
    roster.splice(1, 0, roster.pop()!);
    roster[0] = fixed;
  }
  return rounds;
}

function generateChampionsStructure(players: string[]): Round[] {
  const roster = [...players];
  if (roster.length % 2 !== 0) roster.push('BYE');
  const rounds: Round[] = [];
  const totalRounds = Math.min(8, roster.length - 1);
  const half = roster.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const matches: [string, string][] = [];
    for (let i = 0; i < half; i += 1) {
      matches.push([roster[i], roster[roster.length - 1 - i]]);
    }
    rounds.push({ round: `Matchday ${round + 1}`, matches });
    const fixed = roster[0];
    roster.splice(1, 0, roster.pop()!);
    roster[0] = fixed;
  }
  return rounds;
}

function computeStandings(players: string[], matchResults: Record<string, MatchResult>, context: string): StandingsEntry[] {
  const standings: Record<string, StandingsEntry> = {};
  players.forEach(p => standings[p] = { player: p, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });

  Object.entries(matchResults).forEach(([key, result]) => {
    const [ctx, home, away] = key.split('|');
    if (ctx !== context || result.scoreA === '' || result.scoreB === '') return;
    const sA = Number(result.scoreA), sB = Number(result.scoreB);
    if (standings[home]) {
      standings[home].played++; standings[home].goalsFor += sA; standings[home].goalsAgainst += sB;
      if (sA > sB) { standings[home].wins++; standings[home].points += 3; }
      else if (sA < sB) standings[home].losses++;
      else { standings[home].draws++; standings[home].points += 1; }
    }
    if (standings[away]) {
      standings[away].played++; standings[away].goalsFor += sB; standings[away].goalsAgainst += sA;
      if (sB > sA) { standings[away].wins++; standings[away].points += 3; }
      else if (sB < sA) standings[away].losses++;
      else { standings[away].draws++; standings[away].points += 1; }
    }
  });

  return Object.values(standings).sort((a, b) => b.points !== a.points ? b.points - a.points : (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
}

function useQueryParameter(param: string): string | null {
  const [val, setVal] = useState<string | null>(null);
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setVal(searchParams.get(param));
  }, [param]);
  return val;
}

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// --- Main Component ---
export default function App() {
  const [mode, setMode] = useState<'welcome' | 'host' | 'join'>('welcome');
  const [title, setTitle] = useState('FC League Session');
  const [format, setFormat] = useState<Format>('league');
  const [playerText, setPlayerText] = useState('Alice\nBob\nCharlie\nDiana');
  const [sessionPayload, setSessionPayload] = useState<SessionPayload | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});

  const rawSession = useQueryParameter('session');
  
  useEffect(() => {
    if (rawSession) {
      const payload = decodePayload(rawSession);
      if (payload) setSessionPayload(payload);
    }
  }, [rawSession]);

  const players = useMemo(() => normalizePlayers(playerText), [playerText]);
  const sessionUrl = useMemo(() => {
    if (!sessionPayload) return '';
    const encoded = encodePayload(sessionPayload);
    return `${window.location.origin}${window.location.pathname}?session=${encoded}`;
  }, [sessionPayload]);

  const standings = useMemo(() => {
    if (!sessionPayload) return [];
    return computeStandings(sessionPayload.players, matchResults, sessionPayload.format === 'league' ? '' : 'champions-league');
  }, [sessionPayload, matchResults]);

  const rounds = useMemo(() => {
    if (!sessionPayload) return [];
    return sessionPayload.format === 'league' 
      ? generateLeagueRounds(sessionPayload.players) 
      : generateChampionsStructure(sessionPayload.players);
  }, [sessionPayload]);

  const handleHost = () => {
    const payload: SessionPayload = {
      id: randomId(),
      title: title.trim() || 'FC League Session',
      format,
      players,
      createdAt: new Date().toISOString(),
    };
    setSessionPayload(payload);
    setMode('host');
  };

  const updateMatchResult = (key: string, field: 'scoreA' | 'scoreB', value: number | '') => {
    setMatchResults(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setJoinMessage('Link copied to clipboard!');
      setTimeout(() => setJoinMessage(''), 3000);
    } catch { setJoinMessage('Failed to copy link.'); }
  };

  return (
    <div className="bg-overlay-wrapper">
      <div className="bg-overlay" />
      <div className="bg-pattern" />
      <div className="page-shell">
        <motion.header 
          className="glass-panel" 
          style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="live-indicator" />
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>FC Companion</h1>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => { setSessionPayload(null); setMode('welcome'); }}>
            <Gamepad2 size={20} />
          </button>
        </motion.header>

        <AnimatePresence mode="wait">
          {mode === 'welcome' && !sessionPayload && (
            <motion.div 
              key="landing"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <section className="hero">
                <motion.div variants={fadeInUp} className="badge">
                  <TrendingUp size={14} /> NEW: Swiss Format Support
                </motion.div>
                <motion.h1 variants={fadeInUp}>Level up your local game nights.</motion.h1>
                <motion.p variants={fadeInUp}>
                  The professional companion for FC sessions. Manage leagues, track live standings, and share results with your squad instantly.
                </motion.p>
                <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => setMode('host')}>
                    <Plus size={20} /> Start Session
                  </button>
                  <button className="btn btn-ghost" onClick={() => setMode('join')}>
                    <Users size={20} /> Join Friends
                  </button>
                </motion.div>

                <motion.div variants={fadeInUp} className="game-mockup">
                  <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" alt="Gaming Setup" />
                  <div className="floating-stats">
                    <div className="stat-pill">
                      <ShieldCheck size={18} color="var(--accent-emerald)" /> 
                      Rank #1: Pro Gamer
                    </div>
                    <div className="stat-pill">
                      <Globe size={18} color="var(--accent-blue)" /> 
                      Live Sync Enabled
                    </div>
                  </div>
                </motion.div>
              </section>

              <div className="grid-auto" style={{ marginTop: '4rem' }}>
                <motion.div variants={fadeInUp} className="card-interactive">
                  <Trophy size={48} color="var(--accent-emerald)" />
                  <h2>Automated Standings</h2>
                  <p>Points, GD, and ranks update in real-time as you enter scores.</p>
                </motion.div>
                <motion.div variants={fadeInUp} className="card-interactive">
                  <Share2 size={48} color="var(--accent-blue)" />
                  <h2>Instant Sharing</h2>
                  <p>QR codes and deep links let everyone track the league from their own phone.</p>
                </motion.div>
                <motion.div variants={fadeInUp} className="card-interactive">
                  <LayoutDashboard size={48} color="#9333ea" />
                  <h2>Pro Formats</h2>
                  <p>Choose between standard Round Robin or the new Champions League Swiss format.</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {(mode === 'host' || mode === 'join') && !sessionPayload && (
            <motion.div 
              key="setup"
              className="glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button className="btn btn-ghost" onClick={() => setMode('welcome')} style={{ marginBottom: '2rem' }}>
                <ChevronLeft size={20} /> Back
              </button>
              
              {mode === 'host' ? (
                <>
                  <h2>Session Setup</h2>
                  <div className="form-group">
                    <label>Session Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Champions Night" />
                  </div>
                  <div className="form-group">
                    <label>Format</label>
                    <select value={format} onChange={e => setFormat(e.target.value as Format)}>
                      <option value="league">Standard League</option>
                      <option value="champions">Champions League (Swiss)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Players (one per line)</label>
                    <textarea rows={5} value={playerText} onChange={e => setPlayerText(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" onClick={handleHost} disabled={players.length < 2}>
                    <Plus size={20} /> Create Session
                  </button>
                </>
              ) : (
                <>
                  <h2>Join Session</h2>
                  <div className="form-group">
                    <label>Session Link or Code</label>
                    <input value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="Paste URL or ID" />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      const maybePayload = decodePayload(joinName.split('session=')[1] || joinName);
                      if (maybePayload) setSessionPayload(maybePayload);
                      else setJoinMessage('Invalid session code.');
                    }}
                  >
                    <Zap size={20} /> Load Session
                  </button>
                  {joinMessage && <p style={{ marginTop: '1rem', color: '#ef4444' }}>{joinMessage}</p>}
                </>
              )}
            </motion.div>
          )}

          {sessionPayload && (
            <motion.div 
              key="dashboard"
              className="glass-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <LayoutDashboard size={24} color="var(--accent-blue)" />
                    <h2 style={{ margin: 0 }}>{sessionPayload.title}</h2>
                  </div>
                  <p className="meta-text">{sessionPayload.format === 'league' ? 'League' : 'Champions League Swiss'} • {sessionPayload.players.length} Players</p>
                </div>
                <button className="btn btn-ghost" onClick={() => { setSessionPayload(null); setMode('welcome'); }}>
                  New Session
                </button>
              </div>

              <div className="grid-auto" style={{ marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} color="var(--accent-emerald)" /> Standings
                  </h3>
                  <div className="standings-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>P</th>
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
                                sessionPayload.format === 'champions' 
                                  ? (idx < 8 ? 'row-highlight-success' : idx < 24 ? 'row-highlight-warning' : 'row-highlight-danger')
                                  : ''
                              }
                            >
                              <td><strong>{entry.player}</strong></td>
                              <td>{entry.played}</td>
                              <td>{entry.goalsFor - entry.goalsAgainst}</td>
                              <td style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{entry.points}</td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Share2 size={20} color="var(--accent-blue)" /> Share
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <QRCode value={sessionUrl} size={160} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input readOnly value={sessionUrl} style={{ fontSize: '0.8rem' }} />
                    <button className="btn btn-primary" onClick={() => copyToClipboard(sessionUrl)} style={{ padding: '0 1rem' }}>
                      <Copy size={18} />
                    </button>
                  </div>
                  {joinMessage && <p style={{ marginTop: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>{joinMessage}</p>}
                </div>
              </div>

              <h3 style={{ marginBottom: '1.5rem' }}>Fixtures</h3>
              <div className="grid-auto">
                {rounds.map((round, rIdx) => (
                  <motion.div 
                    key={round.round}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rIdx * 0.1 }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{round.round}</h4>
                    {round.matches.map(([h, a]) => {
                      const key = `${sessionPayload.format === 'league' ? '' : 'champions-league'}|${h}|${a}`;
                      const res = matchResults[key];
                      return (
                        <div key={key} className="match-card">
                          <div className="match-grid">
                            <span className="team-name">{h}</span>
                            <div className="score-display">
                              <input 
                                className="score-input"
                                type="number" 
                                value={res?.scoreA ?? ''} 
                                onChange={e => updateMatchResult(key, 'scoreA', e.target.value === '' ? '' : Number(e.target.value))}
                              />
                              <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>:</span>
                              <input 
                                className="score-input"
                                type="number" 
                                value={res?.scoreB ?? ''} 
                                onChange={e => updateMatchResult(key, 'scoreB', e.target.value === '' ? '' : Number(e.target.value))}
                              />
                            </div>
                            <span className="team-name">{a}</span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
