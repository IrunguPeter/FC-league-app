import { Minus, Plus, Zap } from 'lucide-react';
import type { MatchResult } from '../types';

type Props = {
  home: string;
  away: string;
  matchKey: string;
  result?: MatchResult;
  onUpdate: (key: string, field: 'scoreA' | 'scoreB', value: number | '') => void;
};

export function MatchCard({ home, away, matchKey, result, onUpdate }: Props) {
  const isBye = home === 'BYE' || away === 'BYE';
  const opponent = home === 'BYE' ? away : home;
  if (isBye) return <div className="match-card match-bye"><span>{opponent}</span><span className="badge"><Zap size={12} /> BYE</span></div>;

  const scoreA = typeof result?.scoreA === 'number' ? result.scoreA : 0;
  const scoreB = typeof result?.scoreB === 'number' ? result.scoreB : 0;
  const hasScore = result?.scoreA !== '' && result?.scoreB !== '' && result?.scoreA !== undefined && result?.scoreB !== undefined;
  const adjust = (field: 'scoreA' | 'scoreB', delta: number) => {
    const value = field === 'scoreA' ? scoreA : scoreB;
    onUpdate(matchKey, field, Math.max(0, value + delta));
  };

  return (
    <div className={`match-card ${hasScore ? 'match-complete' : ''}`}>
      <div className="match-status">{hasScore ? 'Final' : 'Not played'}</div>
      <div className="match-grid">
        <span className="team-name">{home}</span>
        <div className="score-display">
          <div className="score-control"><button onClick={() => adjust('scoreA', -1)} aria-label={`Decrease ${home} score`}><Minus size={13} /></button><input className="score-input" type="number" min="0" value={result?.scoreA ?? ''} placeholder="0" onChange={(e) => onUpdate(matchKey, 'scoreA', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} /><button onClick={() => adjust('scoreA', 1)} aria-label={`Increase ${home} score`}><Plus size={13} /></button></div>
          <span className="score-separator">:</span>
          <div className="score-control"><button onClick={() => adjust('scoreB', -1)} aria-label={`Decrease ${away} score`}><Minus size={13} /></button><input className="score-input" type="number" min="0" value={result?.scoreB ?? ''} placeholder="0" onChange={(e) => onUpdate(matchKey, 'scoreB', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} /><button onClick={() => adjust('scoreB', 1)} aria-label={`Increase ${away} score`}><Plus size={13} /></button></div>
        </div>
        <span className="team-name">{away}</span>
      </div>
    </div>
  );
}
