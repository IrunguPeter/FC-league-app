import { motion } from 'framer-motion';
import { LogOut, LogIn, Gamepad2, Sun, Moon } from 'lucide-react';
import type { User } from 'firebase/auth';

type Props = {
  loading: boolean;
  user: User | null | undefined;
  onLogin: () => void;
  onLogout: () => void;
  onHome: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

export function Header({ loading, user, onLogin, onLogout, onHome, darkMode, onToggleDarkMode }: Props) {
  return (
    <motion.header
      className="glass-panel"
      style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
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
        <button
          className="btn btn-ghost"
          onClick={onToggleDarkMode}
          title="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {loading ? (
          <div className="skeleton" style={{ width: '100px', height: '32px' }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}`
              }
              alt="Avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
            <button className="btn btn-ghost" onClick={onLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost"
              onClick={onLogin}
              title="Login with Google"
            >
              <LogIn size={20} />
            </button>
          </div>
        )}
        <button className="btn btn-ghost" onClick={onHome}>
          <Gamepad2 size={20} />
        </button>
      </div>
    </motion.header>
  );
}
