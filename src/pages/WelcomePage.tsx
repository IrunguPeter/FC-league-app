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
  mySessions: (SessionPayload & { matchResults: Record<string, MatchResult> })[];
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
          <motion.div
            variants={fadeInUp}
            className="glass-panel"
            style={{
              marginTop: '4rem',
              padding: '4rem 2rem',
              textAlign: 'center',
              borderRadius: '3rem',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '6rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                background:
                  'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                zIndex: 0,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  boxShadow:
                    '0 12px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                  transform: 'rotate(-4deg)',
                }}
              >
                <img
                  src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png"
                  alt="Google"
                  style={{ width: '40px' }}
                />
              </div>

              <h2
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                Your Stats, Everywhere.
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '500px',
                  margin: '0 auto 2.5rem',
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of players who track their FC dominance. Sign in
                with Google to sync your leagues and never lose a goal.
              </p>

              <button
                className="btn btn-primary"
                onClick={onLogin}
                style={{
                  padding: '1.25rem 3rem',
                  fontSize: '1.125rem',
                  borderRadius: '1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontWeight: 800,
                }}
              >
                <LogIn size={24} /> Continue with Google
              </button>

              <div
                style={{
                  marginTop: '3.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '3rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Globe size={16} color="var(--accent-emerald)" />
                  </div>
                  Live Cloud Sync
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={16} color="var(--accent-blue)" />
                  </div>
                  Secure Profile
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trophy size={16} color="var(--accent-purple)" />
                  </div>
                  Global Rankings
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} style={{ margin: '2rem 0' }}>
            <div
              className="badge"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '2rem',
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
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
        <motion.div
          variants={fadeInUp}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
        >
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              textAlign: 'left',
              maxWidth: '1000px',
              margin: '4rem auto 0',
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
          <p>
            Points, GD, and ranks update in real-time as you enter scores.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} className="card-interactive">
          <Share2 size={48} color="var(--accent-blue)" />
          <h2>Instant Sharing</h2>
          <p>
            QR codes and deep links let everyone track the league from their own
            phone.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} className="card-interactive">
          <LayoutDashboard size={48} color="#9333ea" />
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
