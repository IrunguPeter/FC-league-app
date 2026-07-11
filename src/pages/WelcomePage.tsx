import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Plus,
  Share2,
  LayoutDashboard,
  Globe,
  ShieldCheck,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { SessionPayload, MatchResult, CareerStats } from '../types';
import { staggerContainer, fadeInUp } from '../utils/animation';
import { ProfileCard } from '../components/ProfileCard';
import { RecentSessions } from '../components/RecentSessions';


type Props = {
  user: User | null | undefined;
  onLogin: () => void;
  onSetMode: (mode: 'host' | 'join') => void;
  onSelectSession: (session: SessionPayload) => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void;
  mySessions: (SessionPayload & {
    matchResults: Record<string, MatchResult>;
  })[];
  careerStats: CareerStats;
};

export function WelcomePage({
  user,
  onLogin,
  onSetMode,
  onSelectSession,
  onDeleteSession,
  mySessions,
  careerStats,
}: Props) {
  return (
    <motion.div
      key="landing"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-geo" />
          <div className="hero-geo" />
          <div className="hero-geo" />
        </div>
        {!user ? (
          <motion.div variants={fadeInUp} className="hero-login-card">
            <div className="hero-login-card-glow" />
            <div className="hero-login-card-glow-2" />
            <div className="hero-login-content">
              <div className="hero-google-icon">
                <img
                  src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png"
                  alt="Google"
                />
              </div>

              <h2 className="hero-login-title">Your Stats, Everywhere.</h2>
              <p className="hero-login-subtitle">
                Join thousands of players who track their FC dominance. Sign in
                with Google to sync your leagues and never lose a goal.
              </p>

              <button className="btn btn-primary btn-large" onClick={onLogin}>
                <LogIn size={22} /> Continue with Google
              </button>

              <div className="hero-features">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon emerald">
                    <Globe size={14} color="var(--accent-emerald)" />
                  </div>
                  Live Cloud Sync
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon blue">
                    <ShieldCheck size={14} color="var(--accent-blue)" />
                  </div>
                  Secure Profile
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon purple">
                    <Trophy size={14} color="var(--accent-purple)" />
                  </div>
                  Global Rankings
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} style={{ margin: '2rem 0' }}>
            <div className="logged-in-badge">
              <CheckCircle2 size={18} /> Logged in as {user.displayName}
            </div>
          </motion.div>
        )}
        <motion.h1 variants={fadeInUp}>
          Level up your local game nights.
        </motion.h1>
        <motion.p variants={fadeInUp}>
          The professional companion for FC sessions. Manage leagues, track live
          standings, and share results with your squad instantly.
        </motion.p>
        <motion.div variants={fadeInUp} className="hero-actions">
          <button className="btn btn-primary" onClick={() => onSetMode('host')}>
            <Plus size={20} /> Start Session
          </button>
          <button className="btn btn-ghost" onClick={() => onSetMode('join')}>
            <Users size={20} /> Join Friends
          </button>
        </motion.div>

        {user && (
          <motion.div
            variants={fadeInUp}
            style={{
              marginTop: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              textAlign: 'left',
              maxWidth: '1000px',
              margin: '3rem auto 0',
            }}
          >
            <ProfileCard user={user} careerStats={careerStats} />
            <RecentSessions
              sessions={mySessions}
              onSelect={onSelectSession}
              onDelete={onDeleteSession}
            />
          </motion.div>
        )}

        <motion.div variants={fadeInUp} className="game-mockup">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
            alt="Gaming Setup"
          />
          <div className="floating-stats">
            <div className="stat-pill">
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              Rank #1: Pro Gamer
            </div>
            <div className="stat-pill">
              <Globe size={16} color="var(--accent-blue)" />
              Live Sync Enabled
            </div>
          </div>
        </motion.div>
      </section>

      <div className="grid-auto" style={{ marginTop: '4rem' }}>
        <motion.div variants={fadeInUp} className="card-interactive">
          <Trophy size={40} color="var(--accent-emerald)" />
          <h2>Automated Standings</h2>
          <p>Points, GD, and ranks update in real-time as you enter scores.</p>
        </motion.div>
        <motion.div variants={fadeInUp} className="card-interactive">
          <Share2 size={40} color="var(--accent-blue)" />
          <h2>Instant Sharing</h2>
          <p>
            QR codes and deep links let everyone track the league from their own
            phone.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} className="card-interactive">
          <LayoutDashboard size={40} color="var(--accent-purple)" />
          <h2>Pro Formats</h2>
          <p>
            Choose between standard Round Robin or the new Champions League
            Swiss format.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
