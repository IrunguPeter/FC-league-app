import { CheckCircle2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { CareerStats } from '../types';

type Props = {
  user: User;
  careerStats: CareerStats;
};

export function ProfileCard({ user, careerStats }: Props) {
  const total = careerStats.wins + careerStats.draws + careerStats.losses;
  const winRate = total > 0 ? Math.round((careerStats.wins / total) * 100) : 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${user.displayName}`
          }
          alt="Profile"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '2.5rem',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
            border: '4px solid white',
          }}
        />
        <div
          style={{
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
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        >
          <CheckCircle2 size={16} color="white" />
        </div>
      </div>
      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>
        {user.displayName}
      </h2>
      <p className="meta-text" style={{ marginBottom: '2rem' }}>
        {user.email}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem',
          width: '100%',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.1)',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--accent-emerald)',
              marginBottom: '0.25rem',
            }}
          >
            Wins
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>
            {careerStats.wins}
          </p>
        </div>
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.05)',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--accent-blue)',
              marginBottom: '0.25rem',
            }}
          >
            Draws
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>
            {careerStats.draws}
          </p>
        </div>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.1)',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#ef4444',
              marginBottom: '0.25rem',
            }}
          >
            Losses
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>
            {careerStats.losses}
          </p>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          padding: '1.25rem',
          background: 'var(--bg-secondary)',
          borderRadius: '1.5rem',
          textAlign: 'left',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            Recent Form
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {careerStats.streak.length > 0
              ? careerStats.streak.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      background:
                        r === 'W'
                          ? 'var(--accent-emerald)'
                          : r === 'D'
                            ? 'var(--accent-blue)'
                            : '#ef4444',
                      color: 'white',
                    }}
                  >
                    {r}
                  </div>
                ))
              : ''}
          </div>
        </div>
        {careerStats.streak.length === 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            No matches played
          </span>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            Win Rate
          </span>
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
            }}
          >
            {winRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
