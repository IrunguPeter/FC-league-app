import { useState } from 'react';
import { Banknote, CheckCircle2, Lock, Send, ShieldCheck } from 'lucide-react';
import type { PaidLeague, StandingsEntry } from '../types';
import type { User } from 'firebase/auth';

type Props = { leagueId: string; paid: PaidLeague; standings: StandingsEntry[]; user: User | null | undefined; isHost: boolean; tournamentComplete: boolean };

export function PaidLeaguePanel({ leagueId, paid, standings, user, isHost, tournamentComplete }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [phone, setPhone] = useState('254');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const winner = standings[0];
  const releasePrize = async () => {
    if (!user || !winner) return;
    setBusy(true); setMessage('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/payments/payout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ leagueId, winnerName: winner.player, winnerPhone: phone, amount: paid.prizePool }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payout failed');
      setMessage(`Prize release submitted. Reference: ${data.reference}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Payout failed.'); } finally { setBusy(false); }
  };
  const startCheckout = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/payments/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leagueId, playerName, phoneNumber: phone, entryFee: paid.entryFee }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout could not start');
      window.location.href = data.checkoutUrl;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Checkout could not start.'); setBusy(false); }
  };
  return <section className="paid-league-panel"><div className="paid-panel-heading"><span className="paid-panel-icon"><Banknote size={17} /></span><div><b>Paid league</b><span>KES {paid.entryFee.toLocaleString()} entry · KES {paid.prizePool.toLocaleString()} prize</span></div></div>{isHost ? <div className="release-panel"><div className="release-status"><ShieldCheck size={15} /> Host release only</div><p>When the final table is confirmed, enter the winner’s M-Pesa number and release the prize.</p><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="2547XXXXXXXX" aria-label="Winner M-Pesa phone" /><button className="btn btn-primary" disabled={!tournamentComplete || !/^254\d{9}$/.test(phone) || busy} onClick={releasePrize}><Send size={15} /> {busy ? 'Releasing…' : `Release KES ${paid.prizePool.toLocaleString()}`}</button>{!tournamentComplete && <small>Complete every match before releasing the prize.</small>}</div> : <div className="entry-panel"><p>Pay your entry fee through IntaSend to join this league.</p><input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Your player name" aria-label="Player name" /><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="2547XXXXXXXX" aria-label="M-Pesa phone" /><button className="btn btn-primary" disabled={!playerName || !/^254\d{9}$/.test(phone) || busy} onClick={startCheckout}><Lock size={14} /> {busy ? 'Opening IntaSend…' : `Pay KES ${paid.entryFee.toLocaleString()}`}</button><small>IntaSend processing fees are added at checkout.</small></div>}{message && <div className={`paid-message ${message.includes('submitted') ? 'success' : ''}`}><CheckCircle2 size={14} /> {message}</div>}</section>;
}
