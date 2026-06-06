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
  Globe,
  LogOut,
  LogIn
} from 'lucide-react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

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
  const [user, loading] = useAuthState(auth);
  const [mode, setMode] = useState<'welcome' | 'host' | 'join'>('welcome');
  const [title, setTitle] = useState('FC League Session');
  const [format, setFormat] = useState<Format>('league');
  const [playerText, setPlayerText] = useState('Alice\nBob\nCharlie\nDiana');
  const [sessionPayload, setSessionPayload] = useState<SessionPayload | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});

  const rawSession = useQueryParameter('session');

  const [mySessions, setMySessions] = useState<SessionPayload[]>([]);

  // Fetch user sessions from their private subcollection
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'sessions'));
      const unsub = onSnapshot(q, (snapshot) => {
        const sessions = snapshot.docs.map(doc => doc.data() as SessionPayload);
        setMySessions(sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      });
      return () => unsub();
    } else {
      setMySessions([]);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);
  
  useEffect(() => {
    if (rawSession) {
      const payload = decodePayload(rawSession);
      if (payload) setSessionPayload(payload);
    }
  }, [rawSession]);

  // Sync with Firestore if session has an ID and user is logged in
  useEffect(() => {
    if (sessionPayload?.id) {
      const sessionRef = doc(db, 'sessions', sessionPayload.id);
      const unsub = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.matchResults) {
            setMatchResults(data.matchResults);
          }
        }
      });
      return () => unsub();
    }
  }, [sessionPayload?.id]);

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

  const handleHost = async () => {
    const payload: SessionPayload = {
      id: randomId(),
      title: title.trim() || 'FC League Session',
      format,
      players,
      createdAt: new Date().toISOString(),
    };
    
    // Always attempt to save to Firestore if user is logged in
    // This stores the 'master' record in their account
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'sessions', payload.id), {
          ...payload,
          matchResults: {}
        });
        
        // Also keep a shared version for friends to join/view
        await setDoc(doc(db, 'sessions', payload.id), {
          ...payload,
          ownerId: user.uid,
          matchResults: {}
        });
      } catch (e) {
        console.error("Error saving session to account", e);
      }
    }
    
    setSessionPayload(payload);
    setMode('host');
  };

  const updateMatchResult = async (key: string, field: 'scoreA' | 'scoreB', value: number | '') => {
    const newResults = { ...matchResults, [key]: { ...matchResults[key], [field]: value } };
    setMatchResults(newResults);

    if (sessionPayload?.id && user) {
      try {
        // Update both the user's private copy and the shared session
        const updates = { matchResults: newResults };
        await setDoc(doc(db, 'users', user.uid, 'sessions', sessionPayload.id), updates, { merge: true });
        await setDoc(doc(db, 'sessions', sessionPayload.id), updates, { merge: true });
      } catch (e) {
        console.error("Error updating scores", e);
      }
    }
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {loading ? (
              <div className="skeleton" style={{ width: '100px', height: '32px' }} />
            ) : user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={handleLogin} title="Login with Google">
                  <LogIn size={20} />
                </button>
              </div>
            )}
            <button className="btn btn-ghost" onClick={() => { setSessionPayload(null); setMode('welcome'); }}>
              <Gamepad2 size={20} />
            </button>
          </div>
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
                <div className="hero-bg-image">
                  <img 
                    src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2070&auto=format&fit=crop" 
                    alt="Gaming PC" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {!user ? (
                  <motion.div 
                    variants={fadeInUp} 
                    className="glass-panel" 
                    style={{ 
                      marginTop: '4rem', 
                      padding: '4rem 2rem', 
                      textAlign: 'center', 
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: '3rem',
                      boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: '6rem'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-100px',
                      right: '-100px',
                      width: '300px',
                      height: '300px',
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                      zIndex: 0
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'white', 
                        borderRadius: '1.5rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 2rem',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                        transform: 'rotate(-4deg)'
                      }}>
                        <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" style={{ width: '40px' }} />
                      </div>
                      
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a' }}>Your Stats, Everywhere.</h2>
                      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
                        Join thousands of players who track their FC dominance. Sign in with Google to sync your leagues and never lose a goal.
                      </p>
                      
                      <button 
                        className="btn btn-primary" 
                        onClick={handleLogin} 
                        style={{ 
                          background: '#0f172a', 
                          color: 'white',
                          padding: '1.25rem 3rem',
                          fontSize: '1.125rem',
                          borderRadius: '1.25rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '1rem',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                          border: 'none',
                          fontWeight: 800
                        }}
                      >
                        <LogIn size={24} /> Continue with Google
                      </button>
                      
                      <div style={{ 
                        marginTop: '3.5rem', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '3rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={16} color="var(--accent-emerald)" />
                          </div>
                          Live Cloud Sync
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={16} color="var(--accent-blue)" />
                          </div>
                          Secure Profile
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={16} color="var(--accent-purple)" />
                          </div>
                          Global Rankings
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} style={{ margin: '2rem 0' }}>
                    <div className="badge" style={{ padding: '0.75rem 1.5rem', borderRadius: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <CheckCircle2 size={18} /> Logged in as {user.displayName}
                    </div>
                  </motion.div>
                )}
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

                {user && (
                  <motion.div 
                    variants={fadeInUp} 
                    style={{ 
                      marginTop: '3rem', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                      gap: '2rem',
                      textAlign: 'left', 
                      maxWidth: '1000px', 
                      margin: '4rem auto 0' 
                    }}
                  >
                    {/* Profile Card */}
                    <div className="glass-panel" style={{ 
                      padding: '2.5rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid white'
                    }}>
                      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                          alt="Profile" 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '2.5rem', 
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                            border: '4px solid white'
                          }}
                        />
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '-5px', 
                          right: '-5px', 
                          width: '32px', 
                          height: '32px', 
                          background: 'var(--accent-emerald)', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                          <CheckCircle2 size={16} color="white" />
                        </div>
                      </div>
                      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>{user.displayName}</h2>
                      <p className="meta-text" style={{ marginBottom: '2rem' }}>{user.email}</p>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1rem', 
                        width: '100%',
                        padding: '1.5rem',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '1.5rem'
                      }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sessions</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{mySessions.length}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Players</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-purple)' }}>
                            {Array.from(new Set(mySessions.flatMap(s => s.players))).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Sessions List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Zap size={20} color="var(--accent-blue)" /> Recent Activity
                      </h3>
                      {mySessions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {mySessions.slice(0, 3).map(s => (
                            <div 
                              key={s.id} 
                              className="card-interactive" 
                              style={{ 
                                padding: '1.5rem', 
                                display: 'flex', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                gap: '1.5rem',
                                border: '1px solid rgba(0,0,0,0.05)',
                                background: 'rgba(255,255,255,0.6)'
                              }}
                              onClick={() => setSessionPayload(s)}
                            >
                              <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '1rem', 
                                background: s.format === 'league' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {s.format === 'league' ? <LayoutDashboard size={20} color="var(--accent-blue)" /> : <Trophy size={20} color="var(--accent-purple)" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{s.title}</h4>
                                <p className="meta-text" style={{ fontSize: '0.85rem' }}>
                                  {new Date(s.createdAt).toLocaleDateString()} • {s.players.length} players
                                </p>
                              </div>
                              <ChevronLeft style={{ transform: 'rotate(180deg)', opacity: 0.3 }} size={20} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No sessions yet. Host your first game to see it here!
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

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
                    onClick={async () => {
                      const id = joinName.split('session=')[1] ? decodePayload(joinName.split('session=')[1])?.id : joinName;
                      if (!id) {
                        setJoinMessage('Invalid session code.');
                        return;
                      }

                      // Try to fetch from Firestore
                      try {
                        const { getDoc, doc } = await import('firebase/firestore');
                        const sessionSnap = await getDoc(doc(db, 'sessions', id));
                        if (sessionSnap.exists()) {
                          const data = sessionSnap.data() as SessionPayload & { matchResults: Record<string, MatchResult> };
                          setSessionPayload(data);
                          if (data.matchResults) setMatchResults(data.matchResults);
                        } else {
                          // Fallback to decode payload if it was a URL
                          const maybePayload = decodePayload(joinName.split('session=')[1] || joinName);
                          if (maybePayload) setSessionPayload(maybePayload);
                          else setJoinMessage('Session not found.');
                        }
                      } catch (e) {
                        const maybePayload = decodePayload(joinName.split('session=')[1] || joinName);
                        if (maybePayload) setSessionPayload(maybePayload);
                        else setJoinMessage('Error loading session.');
                      }
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
