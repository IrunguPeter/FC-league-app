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

export function Header({
  loading,
  user,
  onLogin,
  onLogout,
  onHome,
  darkMode,
  onToggleDarkMode,
}: Props) {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className="header-brand"
        onClick={onHome}
        style={{ cursor: 'pointer' }}
      >
        <div className="live-indicator" />
        <span className="header-brand-text">FC Companion</span>
      </div>

      <div className="header-actions">
        <button
          className="btn btn-ghost btn-icon"
          onClick={onToggleDarkMode}
          title="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {loading ? (
          <div
            className="skeleton"
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
        ) : user ? (
          <>
            <img
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}`
              }
              alt="Avatar"
              className="header-avatar"
            />
            <button
              className="btn btn-ghost btn-icon"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={onLogin}
            title="Login with Google"
          >
            <LogIn size={18} />{' '}
            <span style={{ fontSize: '0.85rem' }}>Sign In</span>
          </button>
        )}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onHome}
          title="Home"
        >
          <Gamepad2 size={18} />
        </button>
      </div>
    </motion.header>
  );
}
