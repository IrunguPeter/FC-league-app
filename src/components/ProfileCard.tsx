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
    <div className="profile-card">
      <div className="profile-avatar-wrapper">
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${user.displayName}`
          }
          alt="Profile"
          className="profile-avatar"
        />
        <div className="profile-avatar-badge">
          <CheckCircle2 size={14} color="white" />
        </div>
      </div>
      <h2 className="profile-name">{user.displayName}</h2>
      <p className="meta-text profile-email">{user.email}</p>

      <div className="stat-cards">
        <div className="stat-card emerald">
          <p
            className="stat-card-label"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Wins
          </p>
          <p className="stat-card-value">{careerStats.wins}</p>
        </div>
        <div className="stat-card blue">
          <p
            className="stat-card-label"
            style={{ color: 'var(--accent-gold)' }}
          >
            Draws
          </p>
          <p className="stat-card-value">{careerStats.draws}</p>
        </div>
        <div className="stat-card red">
          <p className="stat-card-label" style={{ color: 'var(--accent-red)' }}>
            Losses
          </p>
          <p className="stat-card-value">{careerStats.losses}</p>
        </div>
      </div>

      <div className="form-detail-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            Recent Form
          </span>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {careerStats.streak.length > 0
              ? careerStats.streak.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background:
                        r === 'W'
                          ? 'var(--accent-emerald)'
                          : r === 'D'
                            ? 'var(--accent-blue)'
                            : 'var(--accent-red)',
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
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            Win Rate
          </span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
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
