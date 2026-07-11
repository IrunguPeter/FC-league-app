import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { WelcomePage } from './pages/WelcomePage';
import { SetupPage } from './pages/SetupPage';
import { SessionDashboard } from './pages/SessionDashboard';
import { useQueryParameter } from './hooks/useQueryParameter';
import { useSessions } from './hooks/useSessions';
import { useCareerStats } from './hooks/useCareerStats';
import { useSessionSync } from './hooks/useSessionSync';
import {
  normalizePlayers,
  randomId,
  encodePayload,
  decodePayload,
} from './utils/payload';
import {
  computeStandings,
  generateLeagueRounds,
  generateChampionsStructure,
} from './utils/standings';
import type { Format, SessionPayload, MatchResult } from './types';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [mode, setMode] = useState<'welcome' | 'host' | 'join'>('welcome');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('fc-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('fc-dark-mode', String(darkMode));
  }, [darkMode]);
  const [title, setTitle] = useState('FC League Session');
  const [format, setFormat] = useState<Format>('league');
  const [playerText, setPlayerText] = useState('Alice\nBob\nCharlie\nDiana');
  const [sessionPayload, setSessionPayload] = useState<SessionPayload | null>(
    null,
  );
  const [joinName, setJoinName] = useState('');
  const [joinMessage, setJoinMessage] = useState('');

  const rawSession = useQueryParameter('session');
  const { mySessions, handleDeleteSession } = useSessions(user);
  const careerStats = useCareerStats(user, mySessions);
  const { matchResults, setMatchResults, updateMatchResult } = useSessionSync(
    sessionPayload?.id,
    user,
  );

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
    return computeStandings(
      sessionPayload.players,
      matchResults,
      sessionPayload.format === 'league' ? '' : 'champions-league',
    );
  }, [sessionPayload, matchResults]);

  const rounds = useMemo(() => {
    if (!sessionPayload) return [];
    return sessionPayload.format === 'league'
      ? generateLeagueRounds(sessionPayload.players)
      : generateChampionsStructure(sessionPayload.players);
  }, [sessionPayload]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
      const err = error as { code?: string; message: string };
      if (err.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to log in.');
      } else if (err.code === 'auth/unauthorized-domain') {
        alert(
          'This domain is not authorized for Firebase Authentication. Please add it in the Firebase Console.',
        );
      } else {
        alert(`Login failed: ${err.message}`);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  const handleHost = async () => {
    const payload: SessionPayload = {
      id: randomId(),
      title: title.trim() || 'FC League Session',
      format,
      players,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'sessions', payload.id), {
          ...payload,
          matchResults: {},
        });
        await setDoc(doc(db, 'sessions', payload.id), {
          ...payload,
          ownerId: user.uid,
          matchResults: {},
        });
      } catch (e) {
        console.error('Error saving session to account', e);
      }
    }

    setSessionPayload(payload);
    setMode('host');
  };

  const handleSessionLoaded = (
    payload: SessionPayload,
    results: Record<string, MatchResult>,
  ) => {
    setSessionPayload(payload);
    setMatchResults(results);
  };

  const goHome = () => {
    setSessionPayload(null);
    setMode('welcome');
  };

  return (
    <ErrorBoundary>
      <div className="bg-overlay-wrapper">
        <div className="bg-overlay" />
        <div className="bg-pattern" />
        <div className="page-shell">
          <Header
            loading={loading}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onHome={goHome}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          <AnimatePresence mode="wait">
            {mode === 'welcome' && !sessionPayload && (
              <WelcomePage
                user={user}
                onLogin={handleLogin}
                onSetMode={setMode}
                onSelectSession={setSessionPayload}
                onDeleteSession={handleDeleteSession}
                mySessions={mySessions}
                careerStats={careerStats}
              />
            )}

            {(mode === 'host' || mode === 'join') && !sessionPayload && (
              <SetupPage
                mode={mode}
                onBack={() => setMode('welcome')}
                title={title}
                onTitleChange={setTitle}
                format={format}
                onFormatChange={setFormat}
                playerText={playerText}
                onPlayerTextChange={setPlayerText}
                players={players}
                onHost={handleHost}
                joinName={joinName}
                onJoinNameChange={setJoinName}
                joinMessage={joinMessage}
                onJoinMessageChange={setJoinMessage}
                onSessionLoaded={handleSessionLoaded}
              />
            )}

            {sessionPayload && (
              <SessionDashboard
                sessionPayload={sessionPayload}
                user={user}
                mySessions={mySessions}
                matchResults={matchResults}
                standings={standings}
                rounds={rounds}
                sessionUrl={sessionUrl}
                onUpdateMatch={updateMatchResult}
                onDeleteSession={handleDeleteSession}
                onBackToHome={goHome}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
