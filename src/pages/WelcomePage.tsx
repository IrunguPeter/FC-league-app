import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  LayoutDashboard,
  LogIn,
  Plus,
  Radio,
  Share2,
  Sparkles,
  Trophy,
  Users,
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
      className="landing-page"
    >
      <section className="hero hero-redesign">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-geo" />
          <div className="hero-geo" />
          <div className="hero-geo" />
        </div>
        <motion.div variants={fadeInUp} className="hero-eyebrow">
          <span className="eyebrow-dot" />
          <span>Live league management</span>
          <span className="eyebrow-line" />
          <span>Built for game night</span>
        </motion.div>
        <motion.h1 variants={fadeInUp}>
          Make every match<br />
          <span>count.</span>
        </motion.h1>
        <motion.p variants={fadeInUp} className="hero-lede">
          Run your FC league like a pro. Generate fixtures, update scores in seconds,
          and keep the whole squad locked into the table.
        </motion.p>
        <motion.div variants={fadeInUp} className="hero-actions hero-actions-redesign">
          <button className="btn btn-primary btn-large" onClick={() => onSetMode('host')}>
            <Plus size={19} /> Create a league <ArrowUpRight size={17} />
          </button>
          <button className="btn btn-ghost btn-large" onClick={() => onSetMode('join')}>
            <Users size={18} /> Join with a code
          </button>
        </motion.div>
        {!user && (
          <motion.button variants={fadeInUp} className="login-inline" onClick={onLogin}>
            <LogIn size={15} /> Sign in with Google to save your seasons
          </motion.button>
        )}
        {user && (
          <motion.div variants={fadeInUp} className="logged-in-badge">
            <CheckCircle2 size={16} /> Welcome back, {user.displayName?.split(' ')[0] || 'captain'}
          </motion.div>
        )}

        <motion.div variants={fadeInUp} className="dashboard-preview" aria-label="League dashboard preview">
          <div className="preview-topbar">
            <div className="preview-context">
              <span className="preview-live"><Radio size={13} /> LIVE</span>
              <span>Saturday Night FC</span>
            </div>
            <span className="preview-muted">8 players · Round 3 of 7</span>
          </div>
          <div className="preview-body">
            <div className="preview-copy">
              <span className="preview-kicker">The table</span>
              <strong>Every result,<br />in one place.</strong>
              <span className="preview-note"><ClipboardCheck size={14} /> Scores sync as you play</span>
            </div>
            <div className="preview-table">
              <div className="preview-table-head"><span>#</span><span>PLAYER</span><span>PTS</span><span>GD</span></div>
              {[
                ['01', 'M. Rashford', '9', '+7'],
                ['02', 'J. Bellingham', '7', '+4'],
                ['03', 'A. Cole', '6', '+2'],
                ['04', 'K. Mbappé', '3', '-3'],
              ].map(([rank, name, pts, gd], index) => (
                <div className={`preview-row ${index === 0 ? 'is-leader' : ''}`} key={name}>
                  <span className="preview-rank">{index === 0 ? <Crown size={13} /> : rank}</span>
                  <span>{name}</span><b>{pts}</b><span>{gd}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="preview-footer">
            <span><span className="status-pip" /> All systems synced</span>
            <span>Updated just now</span>
          </div>
        </motion.div>
      </section>

      <motion.section variants={fadeInUp} className="value-strip">
        <div><span className="value-number">01</span><span><b>Set the format</b><small>League or Swiss-style</small></span></div>
        <div><span className="value-number">02</span><span><b>Share the room</b><small>One link for everyone</small></span></div>
        <div><span className="value-number">03</span><span><b>Play the night</b><small>Standings update live</small></span></div>
      </motion.section>

      {user && (
        <motion.section variants={fadeInUp} className="account-grid">
          <ProfileCard user={user} careerStats={careerStats} />
          <RecentSessions sessions={mySessions} onSelect={onSelectSession} onDelete={onDeleteSession} />
        </motion.section>
      )}

      <motion.section variants={fadeInUp} className="feature-grid">
        <div className="feature-card feature-card-accent"><span className="feature-icon"><Trophy size={19} /></span><span className="feature-index">01 / AUTOMATED</span><h2>Standings that never miss a beat.</h2><p>Points, goal difference, and ranks recalculate instantly after every score.</p></div>
        <div className="feature-card"><span className="feature-icon"><Share2 size={19} /></span><span className="feature-index">02 / CONNECTED</span><h2>Your whole squad, on the same page.</h2><p>Send one link or show the QR code. Everyone sees the same live session.</p></div>
        <div className="feature-card"><span className="feature-icon"><LayoutDashboard size={19} /></span><span className="feature-index">03 / FLEXIBLE</span><h2>Choose the night you want.</h2><p>Run a classic round robin or switch it up with a Champions League format.</p></div>
      </motion.section>

      <motion.div variants={fadeInUp} className="landing-footer-note"><Sparkles size={15} /> No spreadsheets. No guesswork. Just game night.</motion.div>
    </motion.div>
  );
}
